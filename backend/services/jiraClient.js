const axios = require('axios');
const { withRetry } = require('../utils/retry');

const JIRA_DOMAIN = (process.env.JIRA_DOMAIN || process.env.JIRA_BASE_URL || '')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

const auth = {
    username: JIRA_EMAIL,
    password: JIRA_API_TOKEN,
};

const baseURL = `https://${JIRA_DOMAIN}/rest/api/3`;
const agileURL = `https://${JIRA_DOMAIN}/rest/agile/1.0`;

// function searchIssues(jql, startAt = 0, maxResults = 50) {
//     try {
//         const res = await axios.get(`${baseURL}/search`, { ... });
//         return res.data;
//     } ...
// }

// NEW IMPLEMENTATION for /rest/api/3/search/jql
// NEW IMPLEMENTATION for /rest/api/3/search/jql
async function searchIssues(jql, nextPageToken = undefined, maxResults = 50) {
    try {
        // We use the derived JIRA_DOMAIN or parse it from baseURL if needed
        // Note: baseURL handles the domain part.
        // Endpoint is /search/jql
        // Response format: { issues: [], nextPageToken: "...", isLast: boolean }

        const payload = {
            jql,
            maxResults,
            fields: ['key', 'summary', 'status', 'assignee', 'created', 'updated', 'priority', 'customfield_10020']
        };

        if (nextPageToken) {
            payload.nextPageToken = nextPageToken;
        }

        const res = await axios.post(`${baseURL}/search/jql`, payload, { auth });

        return {
            issues: res.data.issues || [],
            nextPageToken: res.data.nextPageToken,
            isLast: res.data.isLast
        };
    } catch (err) {
        console.error('Jira search error:', err.message);
        if (err.response) {
            console.error('Jira API Response:', err.response.data);
        }
        throw err;
    }
}

async function fetchSprints(boardId, startAt = 0) {
    try {
        const res = await axios.get(`${agileURL}/board/${boardId}/sprint`, {
            auth,
            params: { startAt },
        });
        return res.data;
    } catch (err) {
        console.error('Jira sprint fetch error:', err.message);
        throw err;
    }
}

async function fetchProjects() {
    const res = await axios.get(`${baseURL}/project`, { auth });
    return Array.isArray(res.data) ? res.data : (res.data.values || res.data || []);
}

async function fetchBoards(projectKeyOrId) {
    const res = await axios.get(`${agileURL}/board`, {
        auth,
        params: { projectKeyOrId },
    });
    return res.data.values || [];
}

async function createSprint(boardId, name, startDate, endDate) {
    return withRetry(
        () =>
            axios.post(
                `${agileURL}/sprint`,
                {
                    name,
                    startDate,
                    endDate,
                    originBoardId: Number(boardId),
                },
                { auth }
            ),
        { maxAttempts: 3, baseMs: 1000 }
    ).then((r) => r.data);
}

async function fetchIssue(issueKeyOrId) {
    const res = await axios.get(`${baseURL}/issue/${issueKeyOrId}`, { auth });
    return res.data;
}

async function getAssignableUsers(projectKey) {
    try {
        const res = await axios.get(`${baseURL}/user/assignable/search`, {
            auth,
            params: { project: projectKey },
        });
        return res.data || [];
    } catch (err) {
        console.error(`Error fetching assignable users for ${projectKey}:`, err.message);
        return [];
    }
}

async function createIssue(projectKey, summary, description, issueType, assigneeAccountId, priority) {
    const body = {
        fields: {
            project: { key: projectKey },
            summary: summary || 'Untitled',
            description: description
                ? {
                      type: 'doc',
                      version: 1,
                      content: [
                          {
                              type: 'paragraph',
                              content: [{ type: 'text', text: description }],
                          },
                      ],
                  }
                : undefined,
            issuetype: { name: issueType || 'Task' },
        },
    };
    if (assigneeAccountId) body.fields.assignee = { accountId: assigneeAccountId };
    if (priority) {
        const normPriority = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
        body.fields.priority = { name: normPriority };
    }
    return withRetry(
        () => axios.post(`${baseURL}/issue`, body, { auth }),
        { maxAttempts: 3, baseMs: 1000 }
    ).then((r) => r.data);
}

async function updateIssue(issueKeyOrId, updateData = {}) {
    const fields = {};
    if (updateData.summary !== undefined) {
        fields.summary = updateData.summary;
    }
    if (updateData.description !== undefined) {
        fields.description = typeof updateData.description === 'string'
            ? {
                  type: 'doc',
                  version: 1,
                  content: [
                      {
                          type: 'paragraph',
                          content: [{ type: 'text', text: updateData.description }],
                      },
                  ],
              }
            : updateData.description;
    }
    if (updateData.priority !== undefined) {
        const normPriority = updateData.priority.charAt(0).toUpperCase() + updateData.priority.slice(1).toLowerCase();
        fields.priority = { name: normPriority };
    }

    if (Object.keys(fields).length > 0) {
        await withRetry(
            () => axios.put(`${baseURL}/issue/${issueKeyOrId}`, { fields }, { auth }),
            { maxAttempts: 3, baseMs: 1000 }
        );
    }

    if (updateData.assigneeAccountId !== undefined) {
        await assignIssue(issueKeyOrId, updateData.assigneeAccountId);
    }

    if (updateData.status) {
        await transitionIssue(issueKeyOrId, updateData.status);
    }

    return fetchIssue(issueKeyOrId);
}

async function assignIssue(issueKeyOrId, accountId) {
    return withRetry(
        () =>
            axios.put(
                `${baseURL}/issue/${issueKeyOrId}/assignee`,
                { accountId: accountId || null },
                { auth }
            ),
        { maxAttempts: 3, baseMs: 1000 }
    ).then((r) => r.data);
}

async function getTransitions(issueKeyOrId) {
    const res = await axios.get(`${baseURL}/issue/${issueKeyOrId}/transitions`, { auth });
    return res.data.transitions || [];
}

async function transitionIssue(issueKeyOrId, targetStatus) {
    if (!targetStatus) return null;
    try {
        const transitions = await getTransitions(issueKeyOrId);
        const lower = targetStatus.toLowerCase().trim();

        // Status mapping to common Jira workflow names
        const statusAliases = {
            'todo': 'To Do',
            'to do': 'To Do',
            'pending': 'To Do',
            'allocated': 'In Progress',
            'in progress': 'In Progress',
            'in_progress': 'In Progress',
            'in review': 'In Review',
            'in_review': 'In Review',
            'done': 'Done',
            'completed': 'Done',
            'closed': 'Done',
        };

        const targetCanonical = statusAliases[lower] || targetStatus;

        let match = transitions.find(
            (t) =>
                t.name.toLowerCase() === lower ||
                t.to?.name?.toLowerCase() === lower ||
                t.name.toLowerCase() === targetCanonical.toLowerCase() ||
                t.to?.name?.toLowerCase() === targetCanonical.toLowerCase()
        );

        if (!match && transitions.length > 0) {
            // Fuzzy match
            match = transitions.find(
                (t) =>
                    t.name.toLowerCase().includes(lower) ||
                    t.to?.name?.toLowerCase().includes(lower)
            );
        }

        if (match) {
            await withRetry(
                () =>
                    axios.post(
                        `${baseURL}/issue/${issueKeyOrId}/transitions`,
                        { transition: { id: match.id } },
                        { auth }
                    ),
                { maxAttempts: 3, baseMs: 1000 }
            );
            return match;
        } else {
            console.warn(`No matching transition found for status "${targetStatus}" on ${issueKeyOrId}. Available:`, transitions.map((t) => t.name));
            return null;
        }
    } catch (err) {
        console.error(`Failed to transition issue ${issueKeyOrId} to ${targetStatus}:`, err.message);
        return null;
    }
}

async function moveIssuesToSprint(sprintId, issueKeys) {
    return withRetry(
        () =>
            axios.post(
                `${agileURL}/sprint/${sprintId}/issue`,
                { issues: issueKeys },
                { auth }
            ),
        { maxAttempts: 3, baseMs: 1000 }
    );
}

async function getMyself() {
    const res = await axios.get(`${baseURL}/myself`, { auth });
    return res.data;
}

async function searchUsers(query) {
    const res = await axios.get(`${baseURL}/user/search`, {
        auth,
        params: { query },
    });
    return res.data || [];
}

module.exports = {
    searchIssues,
    fetchIssue,
    fetchSprints,
    fetchProjects,
    fetchBoards,
    createSprint,
    createIssue,
    updateIssue,
    assignIssue,
    getTransitions,
    transitionIssue,
    getAssignableUsers,
    moveIssuesToSprint,
    getMyself,
    searchUsers,
};
