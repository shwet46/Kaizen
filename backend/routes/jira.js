const express = require('express');
const router = express.Router();
const axios = require('axios');
const Task = require('../models/Task');

// ============= TEAM MEMBERS =============
const TEAM = [
    { name: 'Shweta', accountId: '712020:f4133ad3-9b22-491e-8260-37d3ce9dcf04', role: 'AWS Solutions Architect' },
    { name: 'Maitri', accountId: '712020:88eb9ecb-d9f0-40ee-a5d0-9cbe35c6ac8f', role: 'AWS Backend Developer' },
    { name: 'Ojasvi', accountId: '712020:27f806c7-3623-4153-bb5b-0f60bb121dec', role: 'AWS DevOps Engineer' },
    { name: 'Riya', accountId: '712020:a0876b3e-cc7b-403e-8aac-a8929a1c080e', role: 'AWS Cloud Engineer' }
];

/**
 * Map task role to team member
 */
function mapRoleToTeamMember(roleRequired) {
    const roleMap = {
        // AWS roles
        'aws solutions architect': 'Shweta',
        'aws architect': 'Shweta',
        'solutions architect': 'Shweta',
        'cloud architect': 'Shweta',
        'aws backend developer': 'Maitri',
        'backend developer': 'Maitri',
        'backend engineer': 'Maitri',
        'aws developer': 'Maitri',
        'backend': 'Maitri',
        'aws devops engineer': 'Ojasvi',
        'devops engineer': 'Ojasvi',
        'devops': 'Ojasvi',
        'cloud devops': 'Ojasvi',
        'aws cloud engineer': 'Riya',
        'cloud engineer': 'Riya',
        'infrastructure engineer': 'Riya',
        'sre': 'Riya',
        // Generic AWS - distribute among team
        'aws': 'Shweta',
        // Fallback mappings
        'frontend': 'Shweta',
        'qa': 'Riya'
    };

    const normalizedRole = roleRequired?.toLowerCase() || '';
    const memberName = roleMap[normalizedRole];

    if (memberName) {
        return TEAM.find(m => m.name === memberName);
    }

    // Round-robin if no match
    return TEAM[Math.floor(Math.random() * TEAM.length)];
}

async function resolveJiraAssignee(member, jiraConfig) {
    if (!member) return null;

    try {
        const response = await axios.get(`${jiraConfig.baseUrl}/rest/api/3/user/search`, {
            auth: {
                username: jiraConfig.email,
                password: jiraConfig.apiToken,
            },
            params: { query: member.name, maxResults: 10 },
        });
        const normalizedName = member.name.toLowerCase();
        const user = response.data.find((candidate) =>
            candidate.active && candidate.displayName?.toLowerCase().startsWith(normalizedName)
        );

        return user ? { ...member, accountId: user.accountId } : null;
    } catch (error) {
        console.warn(`Unable to resolve Jira user ${member.name}:`, error.message);
        return null;
    }
}

/**
 * Create a Jira issue
 */
async function createJiraIssue(task, assignee, jiraConfig) {
    const body = {
        fields: {
            project: { key: jiraConfig.projectKey },
            summary: task.title,
            description: {
                type: 'doc',
                version: 1,
                content: [
                    {
                        type: 'paragraph',
                        content: [{
                            type: 'text',
                            text: task.description || `Task ID: ${task.task_id}\nDeadline: ${task.deadline}\nPriority: ${task.priority}`
                        }]
                    }
                ]
            },
            issuetype: { name: 'Task' },
        }
    };

    if (assignee?.accountId) {
        body.fields.assignee = { accountId: assignee.accountId };
    }

    const auth = {
        username: jiraConfig.email,
        password: jiraConfig.apiToken,
    };

    try {
        const res = await axios.post(`${jiraConfig.baseUrl}/rest/api/3/issue`, body, { auth });
        return res.data;
    } catch (error) {
        const jiraError = error.response?.data?.errors;
        const jiraMessage = error.response?.data?.errorMessages;
        const details = [...(jiraMessage || []), ...Object.values(jiraError || {})].filter(Boolean);
        throw new Error(details.length > 0 ? details.join('; ') : error.message);
    }
}

/**
 * POST /api/jira/sync-tasks
 * Sync pending tasks to Jira (creates issues and assigns to team members)
 */
router.post('/sync-tasks', async (req, res) => {
    try {
        const requestedTaskIds = Array.isArray(req.body?.task_ids)
            ? req.body.task_ids.filter((taskId) => typeof taskId === 'string' && taskId.trim())
            : null;

        // Get Jira config from env
        const JIRA_DOMAIN = process.env.JIRA_BASE_URL?.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const JIRA_EMAIL = process.env.JIRA_EMAIL;
        const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
        const PROJECT_KEY = process.env.JIRA_PROJECT_KEY;

        if (!JIRA_DOMAIN || !JIRA_EMAIL || !JIRA_API_TOKEN || !PROJECT_KEY) {
            return res.status(400).json({ 
                success: false, 
                error: 'Jira configuration is incomplete. Set JIRA_BASE_URL, JIRA_PROJECT_KEY, JIRA_EMAIL, and JIRA_API_TOKEN.'
            });
        }

        const jiraConfig = {
            baseUrl: `https://${JIRA_DOMAIN}`,
            email: JIRA_EMAIL,
            apiToken: JIRA_API_TOKEN,
            projectKey: PROJECT_KEY
        };

        // Fetch all pending tasks that are not synced to Jira
        const taskFilter = requestedTaskIds
            ? {
                task_id: { $in: requestedTaskIds },
                $or: [
                    { synced_to_jira: false },
                    { synced_to_jira: { $exists: false } }
                ]
            }
            : {
                status: 'pending',
                $or: [
                    { synced_to_jira: false },
                    { synced_to_jira: { $exists: false } }
                ]
            };

        const tasks = await Task.find(taskFilter).sort({ deadline: 1 });

        console.log(`Found ${tasks.length} tasks to sync to Jira`);

        const results = {
            total: tasks.length,
            created: 0,
            skipped: 0,
            failed: 0,
            tickets: []
        };

        for (const task of tasks) {
            // Skip if already synced (double check)
            if (task.synced_to_jira && task.jira_issue_key) {
                console.log(`⏭️  ${task.task_id}: Already synced as ${task.jira_issue_key}`);
                results.skipped++;
                continue;
            }

            // Find team member for this task
            const mappedMember = mapRoleToTeamMember(task.role_required);

            try {
                const assignee = await resolveJiraAssignee(mappedMember, jiraConfig);
                console.log(`📝 Creating Jira issue: ${task.title}${assignee ? ` for ${assignee.name}` : ' (unassigned)'}`);
                
                const issue = await createJiraIssue(task, assignee, jiraConfig);

                // Update task in MongoDB with Jira info
                await Task.findByIdAndUpdate(task._id, {
                    jira_issue_key: issue.key,
                    jira_issue_id: issue.id,
                    synced_to_jira: true,
                    status: 'allocated'
                });

                results.created++;
                results.tickets.push({
                    task_id: task.task_id,
                    jira_key: issue.key,
                    jira_id: issue.id,
                    assignee: assignee?.name || null,
                    title: task.title
                });

                console.log(`   ✅ Created: ${issue.key}${assignee ? ` → Assigned to ${assignee.name}` : ' (unassigned)'}`);
            } catch (err) {
                console.error(`   ❌ Failed to create Jira issue for ${task.task_id}:`, err.message);
                results.failed++;
                results.tickets.push({
                    task_id: task.task_id,
                    error: err.message,
                    assignee: mappedMember?.name || null,
                    title: task.title
                });
            }
        }

        res.json({
            success: true,
            message: `Synced ${results.created} tasks to Jira`,
            results
        });

    } catch (error) {
        console.error('Error syncing tasks to Jira:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/jira/sync-status
 * Get sync status of tasks
 */
router.get('/sync-status', async (req, res) => {
    try {
        const total = await Task.countDocuments({});
        const synced = await Task.countDocuments({ synced_to_jira: true });
        const pending = await Task.countDocuments({ 
            status: 'pending',
            $or: [
                { synced_to_jira: false },
                { synced_to_jira: { $exists: false } }
            ]
        });

        res.json({
            success: true,
            status: {
                total,
                synced,
                pending,
                syncedPercent: total > 0 ? Math.round((synced / total) * 100) : 0
            }
        });
    } catch (error) {
        console.error('Error getting sync status:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
