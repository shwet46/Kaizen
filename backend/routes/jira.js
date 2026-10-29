const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Issue = require('../models/Issue');
const User = require('../models/User');
const {
    searchIssues,
    fetchIssue,
    createIssue,
    updateIssue,
    assignIssue,
    transitionIssue,
    getAssignableUsers,
} = require('../services/jiraClient');
const { ingestIssues } = require('../services/jiraIngestion');

// Helper to get sanitized Jira config
function getJiraConfig() {
    const domain = (process.env.JIRA_DOMAIN || process.env.JIRA_BASE_URL || '')
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '');
    const email = process.env.JIRA_EMAIL;
    const token = process.env.JIRA_API_TOKEN;
    const projectKey = process.env.JIRA_PROJECT_KEY || 'KAN';

    const isConfigured = Boolean(domain && email && token && projectKey);
    return { domain, email, token, projectKey, isConfigured };
}

// In-memory cache for assignable Jira users
let cachedAssignableUsers = [];
let cacheExpiry = 0;

async function getProjectAssignableUsers(projectKey) {
    const now = Date.now();
    if (cachedAssignableUsers.length > 0 && cacheExpiry > now) {
        return cachedAssignableUsers;
    }
    try {
        const users = await getAssignableUsers(projectKey);
        if (users && users.length > 0) {
            cachedAssignableUsers = users;
            cacheExpiry = now + 5 * 60 * 1000; // 5 min TTL
            return users;
        }
    } catch (err) {
        console.warn(`[Jira] Could not fetch assignable users for ${projectKey}:`, err.message);
    }
    return cachedAssignableUsers;
}

/**
 * Resolve a Jira assignee dynamically from task assignee name, email, or role
 */
async function resolveJiraAssignee(task, projectKey) {
    const users = await getProjectAssignableUsers(projectKey);
    if (!users || users.length === 0) {
        return null;
    }

    const candidateName = (task.jira_assignee || task.assignee || task.allocated_to?.display_name || task.allocated_to?.name || '').toLowerCase().trim();
    const candidateEmail = (task.allocated_to?.email || '').toLowerCase().trim();
    const roleStr = (task.role_required || '').toLowerCase();

    // 1. Exact or partial match on email
    if (candidateEmail) {
        const emailMatch = users.find(u => u.emailAddress && u.emailAddress.toLowerCase() === candidateEmail);
        if (emailMatch) return emailMatch;
    }

    // 2. Exact or substring match on display name
    if (candidateName) {
        const nameMatch = users.find(u => {
            const dn = (u.displayName || '').toLowerCase();
            return dn === candidateName || dn.includes(candidateName) || candidateName.includes(dn);
        });
        if (nameMatch) return nameMatch;

        // Match first name or last name tokens
        const tokens = candidateName.split(/\s+/).filter(t => t.length > 1);
        for (const token of tokens) {
            const tokenMatch = users.find(u => (u.displayName || '').toLowerCase().includes(token));
            if (tokenMatch) return tokenMatch;
        }
    }

    // 3. Fallback to role-based mapping among available users
    if (roleStr.includes('devops') || roleStr.includes('infra') || roleStr.includes('cloud')) {
        const devopsUser = users.find(u => /ojasvi/i.test(u.displayName)) || users.find(u => /riya/i.test(u.displayName));
        if (devopsUser) return devopsUser;
    }
    if (roleStr.includes('backend') || roleStr.includes('api') || roleStr.includes('database')) {
        const backendUser = users.find(u => /maitri/i.test(u.displayName));
        if (backendUser) return backendUser;
    }
    if (roleStr.includes('frontend') || roleStr.includes('ui') || roleStr.includes('architect')) {
        const frontendUser = users.find(u => /shweta/i.test(u.displayName));
        if (frontendUser) return frontendUser;
    }

    // 4. Fallback to the first available assignable user
    return users[0] || null;
}

/**
 * Check if a Jira key is valid (not a fake/mock key like PROJ-1001)
 */
function isValidJiraKey(key, projectKey) {
    if (!key || typeof key !== 'string') return false;
    const cleanKey = key.trim().toUpperCase();
    if (cleanKey.startsWith('PROJ-')) return false;
    if (cleanKey.startsWith(`${projectKey.toUpperCase()}-`)) return true;
    return /^[A-Z][A-Z0-9]+-\d+$/.test(cleanKey);
}

/**
 * POST /api/jira/sync-tasks
 * Sync tasks to Jira: creates new issues or updates existing issues on Jira dashboard
 */
router.post('/sync-tasks', async (req, res) => {
    try {
        const config = getJiraConfig();
        if (!config.isConfigured) {
            return res.status(400).json({
                success: false,
                error: 'Jira configuration is incomplete. Set JIRA_BASE_URL, JIRA_PROJECT_KEY, JIRA_EMAIL, and JIRA_API_TOKEN.'
            });
        }

        const requestedTaskIds = Array.isArray(req.body?.task_ids)
            ? req.body.task_ids.filter((id) => typeof id === 'string' && id.trim())
            : null;

        let taskFilter;
        if (requestedTaskIds && requestedTaskIds.length > 0) {
            taskFilter = { task_id: { $in: requestedTaskIds } };
        } else {
            taskFilter = {
                $or: [
                    { synced_to_jira: false },
                    { synced_to_jira: { $exists: false } },
                    { jira_issue_key: { $exists: false } },
                    { jira_issue_key: null },
                    { jira_issue_key: /^PROJ-/i },
                    { status: 'allocated' },
                ]
            };
        }

        const tasks = await Task.find(taskFilter).populate('allocated_to').sort({ deadline: 1 });

        console.log(`[Jira Sync] Found ${tasks.length} tasks to sync with Jira`);

        const results = {
            total: tasks.length,
            created: 0,
            updated: 0,
            skipped: 0,
            failed: 0,
            tickets: []
        };

        for (const task of tasks) {
            const hasExistingRealKey = isValidJiraKey(task.jira_issue_key, config.projectKey);
            const assignee = await resolveJiraAssignee(task, config.projectKey);

            try {
                if (hasExistingRealKey) {
                    // Update existing Jira issue
                    console.log(`[Jira Sync] 🔄 Updating existing Jira issue ${task.jira_issue_key}: "${task.title}"`);

                    const targetStatus = task.status === 'done' ? 'Done' : (task.status === 'in_progress' || task.status === 'allocated') ? 'In Progress' : 'To Do';

                    await updateIssue(task.jira_issue_key, {
                        summary: task.title,
                        description: task.description || `Task ID: ${task.task_id}\nPriority: ${task.priority}\nEstimated Hours: ${task.estimated_hours}`,
                        priority: task.priority || 'Medium',
                        assigneeAccountId: assignee?.accountId,
                        status: targetStatus,
                    });

                    await Task.findByIdAndUpdate(task._id, {
                        synced_to_jira: true,
                        jira_assignee: assignee?.displayName || task.jira_assignee,
                    });

                    // Also update Issue collection
                    await Issue.findOneAndUpdate(
                        { key: task.jira_issue_key },
                        {
                            key: task.jira_issue_key,
                            title: task.title,
                            status: targetStatus,
                            priority: task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase() : 'Medium',
                            updated_at: new Date(),
                            project_id: config.projectKey,
                        },
                        { upsert: true }
                    );

                    results.updated++;
                    results.tickets.push({
                        task_id: task.task_id,
                        jira_key: task.jira_issue_key,
                        action: 'updated',
                        assignee: assignee?.displayName || 'Unassigned',
                        title: task.title,
                        status: targetStatus,
                    });
                    console.log(`   ✅ Updated: ${task.jira_issue_key} → ${assignee ? assignee.displayName : 'Unassigned'}`);
                } else {
                    // Create new issue in Jira
                    console.log(`[Jira Sync] 📝 Creating new Jira issue: "${task.title}" in ${config.projectKey}`);

                    const descriptionText = task.description || `Task ID: ${task.task_id}\nDeadline: ${task.deadline}\nPriority: ${task.priority}\nEstimated Hours: ${task.estimated_hours || 8}`;
                    const created = await createIssue(
                        config.projectKey,
                        task.title,
                        descriptionText,
                        'Task',
                        assignee?.accountId,
                        task.priority || 'Medium'
                    );

                    // If task was already allocated or in progress, transition the Jira issue
                    const targetStatus = task.status === 'done' ? 'Done' : (task.status === 'in_progress' || task.status === 'allocated') ? 'In Progress' : 'To Do';
                    if (targetStatus !== 'To Do') {
                        try {
                            await transitionIssue(created.key, targetStatus);
                        } catch (tErr) {
                            console.warn(`[Jira Sync] Could not transition ${created.key} to ${targetStatus}:`, tErr.message);
                        }
                    }

                    // Update task in MongoDB
                    await Task.findByIdAndUpdate(task._id, {
                        jira_issue_key: created.key,
                        jira_issue_id: created.id,
                        jira_assignee: assignee?.displayName || null,
                        synced_to_jira: true,
                        status: task.status === 'pending' ? 'allocated' : task.status,
                    });

                    // Upsert into Issue collection
                    await Issue.findOneAndUpdate(
                        { key: created.key },
                        {
                            key: created.key,
                            issue_id: created.id,
                            title: task.title,
                            status: targetStatus,
                            priority: task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase() : 'Medium',
                            created_at: new Date(),
                            updated_at: new Date(),
                            project_id: config.projectKey,
                        },
                        { upsert: true }
                    );

                    results.created++;
                    results.tickets.push({
                        task_id: task.task_id,
                        jira_key: created.key,
                        jira_id: created.id,
                        action: 'created',
                        assignee: assignee?.displayName || 'Unassigned',
                        title: task.title,
                        status: targetStatus,
                    });
                    console.log(`   ✅ Created: ${created.key} → Assigned to ${assignee ? assignee.displayName : 'Unassigned'}`);
                }
            } catch (err) {
                console.error(`   ❌ Failed Jira sync for task ${task.task_id}:`, err.message);
                results.failed++;
                results.tickets.push({
                    task_id: task.task_id,
                    error: err.message,
                    title: task.title,
                });
            }
        }

        res.json({
            success: true,
            message: `Synced ${results.created + results.updated} tasks to Jira (${results.created} created, ${results.updated} updated)`,
            results,
        });

    } catch (error) {
        console.error('[Jira Sync] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/jira/sync
 * Two-way sync: in-gest from Jira to DB, then sync tasks to Jira
 */
router.post('/sync', async (req, res) => {
    try {
        const config = getJiraConfig();
        if (!config.isConfigured) {
            return res.status(400).json({
                success: false,
                error: 'Jira configuration is incomplete.'
            });
        }

        // 1. Ingest latest Jira issues into MongoDB Issue, User, and Task collections
        const ingestResult = await ingestIssues(config.projectKey);

        // 2. Fetch fresh recent activity
        const recentResult = await searchIssues(
            `project = ${config.projectKey} ORDER BY updated DESC`,
            undefined,
            10
        );

        const recentTickets = (recentResult.issues || []).map((issue) => ({
            id: issue.id || issue.key,
            key: issue.key,
            summary: issue.fields?.summary || 'Jira Issue',
            status: issue.fields?.status?.name || 'Unknown',
            priority: issue.fields?.priority?.name || 'Medium',
            assignee: issue.fields?.assignee?.displayName || 'Unassigned',
            created: issue.fields?.created,
            updated: issue.fields?.updated || issue.fields?.created,
        }));

        res.json({
            success: true,
            message: `Synchronized with Jira (${ingestResult.success} tickets processed)`,
            ingested: ingestResult.success,
            recent: recentTickets,
        });
    } catch (error) {
        console.error('[Jira Full Sync] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/jira/recent-activity
 * Return recent Jira tickets (live from Jira API, falling back to MongoDB)
 */
router.get('/recent-activity', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
        const shouldSync = req.query.sync === 'true';
        const config = getJiraConfig();

        if (config.isConfigured) {
            if (shouldSync) {
                try {
                    await ingestIssues(config.projectKey);
                } catch (syncErr) {
                    console.warn('[Jira] Background ingest failed during recent-activity:', syncErr.message);
                }
            }

            try {
                const result = await searchIssues(
                    `project = ${config.projectKey} ORDER BY updated DESC`,
                    undefined,
                    limit
                );

                if (result.issues && result.issues.length > 0) {
                    return res.json({
                        source: 'jira',
                        recent: result.issues.map((issue) => ({
                            id: issue.id || issue.key,
                            key: issue.key,
                            summary: issue.fields?.summary || 'Jira Issue',
                            status: issue.fields?.status?.name || 'Unknown',
                            priority: issue.fields?.priority?.name || 'Medium',
                            assignee: issue.fields?.assignee?.displayName || 'Unassigned',
                            created: issue.fields?.created,
                            updated: issue.fields?.updated || issue.fields?.created,
                        })),
                    });
                }
            } catch (jiraErr) {
                console.warn('[Jira] Live search failed, falling back to DB:', jiraErr.message);
            }
        }

        // Fallback: Query Issue collection first, then Task collection
        let tickets = [];
        const dbIssues = await Issue.find({})
            .sort({ updated_at: -1, updatedAt: -1, _id: -1 })
            .limit(limit)
            .populate('assignee_id', 'display_name email')
            .lean();

        if (dbIssues && dbIssues.length > 0) {
            tickets = dbIssues.map((issue) => ({
                id: issue.issue_id || issue.key || String(issue._id),
                key: issue.key,
                summary: issue.title || 'Jira Issue',
                status: issue.status || 'To Do',
                priority: issue.priority ? issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1).toLowerCase() : 'Medium',
                assignee: issue.assignee_id?.display_name || 'Unassigned',
                created: issue.created_at || issue.createdAt,
                updated: issue.updated_at || issue.updatedAt || new Date(),
            }));
        } else {
            const dbTasks = await Task.find({
                $or: [
                    { synced_to_jira: true },
                    { jira_issue_key: { $exists: true, $ne: '' } },
                ]
            })
                .sort({ updatedAt: -1, updated_at: -1, _id: -1 })
                .limit(limit)
                .populate('allocated_to', 'display_name email')
                .lean();

            tickets = dbTasks.map((task) => ({
                id: task.jira_issue_id || task.jira_issue_key || task.task_id || String(task._id),
                key: task.jira_issue_key,
                summary: task.title,
                status: task.status === 'in_progress' ? 'In Progress' : task.status === 'done' ? 'Done' : 'Allocated',
                priority: task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase() : 'Medium',
                assignee: task.jira_assignee || task.allocated_to?.display_name || 'Unassigned',
                created: task.createdAt || task.created_at,
                updated: task.updatedAt || task.updated_at || task.created_at,
            }));
        }

        return res.json({
            source: 'database',
            recent: tickets,
        });

    } catch (error) {
        console.error('Error getting recent Jira activity:', error);
        res.status(500).json({ success: false, error: 'Unable to fetch recent Jira tickets.' });
    }
});

/**
 * PUT /api/jira/issue/:key
 * Update a ticket directly in Jira dashboard and sync to MongoDB
 */
router.put('/issue/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const config = getJiraConfig();
        if (!config.isConfigured) {
            return res.status(400).json({ success: false, error: 'Jira configuration is incomplete.' });
        }

        const { summary, description, priority, assigneeAccountId, status } = req.body;

        const updatedIssue = await updateIssue(key, {
            summary,
            description,
            priority,
            assigneeAccountId,
            status,
        });

        // Update MongoDB Issue
        const statusName = updatedIssue.fields?.status?.name || status;
        const assigneeName = updatedIssue.fields?.assignee?.displayName;
        await Issue.findOneAndUpdate(
            { key },
            {
                title: updatedIssue.fields?.summary || summary,
                status: statusName,
                priority: updatedIssue.fields?.priority?.name || priority,
                updated_at: new Date(),
            },
            { upsert: true }
        );

        // Update matching Task
        await Task.updateMany(
            { jira_issue_key: key },
            {
                $set: {
                    title: updatedIssue.fields?.summary || summary,
                    jira_assignee: assigneeName,
                    status: (statusName || '').toLowerCase() === 'done' ? 'done' : /progress|review/i.test(statusName) ? 'in_progress' : 'allocated',
                    synced_to_jira: true,
                }
            }
        );

        res.json({
            success: true,
            message: `Updated issue ${key} in Jira dashboard`,
            issue: {
                key: updatedIssue.key,
                summary: updatedIssue.fields?.summary,
                status: statusName,
                assignee: assigneeName || 'Unassigned',
            }
        });
    } catch (error) {
        console.error(`[Jira] Error updating issue ${req.params.key}:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/jira/create-issue
 * Create an issue directly in Jira and save to MongoDB
 */
router.post('/create-issue', async (req, res) => {
    try {
        const config = getJiraConfig();
        if (!config.isConfigured) {
            return res.status(400).json({ success: false, error: 'Jira configuration is incomplete.' });
        }

        const { summary, description, issueType, assigneeAccountId, priority } = req.body;
        if (!summary) {
            return res.status(400).json({ success: false, error: 'Summary is required.' });
        }

        const created = await createIssue(
            config.projectKey,
            summary,
            description,
            issueType || 'Task',
            assigneeAccountId,
            priority || 'Medium'
        );

        await Issue.create({
            key: created.key,
            issue_id: created.id,
            title: summary,
            status: 'To Do',
            priority: priority || 'Medium',
            project_id: config.projectKey,
            created_at: new Date(),
            updated_at: new Date(),
        });

        res.status(201).json({
            success: true,
            issue: {
                key: created.key,
                id: created.id,
                summary,
            }
        });
    } catch (error) {
        console.error('[Jira] Error creating issue:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/jira/users
 * Return assignable Jira users
 */
router.get('/users', async (req, res) => {
    try {
        const config = getJiraConfig();
        const users = await getProjectAssignableUsers(config.projectKey);
        res.json({
            success: true,
            users: users.map(u => ({
                accountId: u.accountId,
                displayName: u.displayName,
                emailAddress: u.emailAddress || '',
                active: u.active,
            }))
        });
    } catch (error) {
        console.error('[Jira] Error fetching users:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/jira/stats
 * Return Jira ticket statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const config = getJiraConfig();
        let total = 0;
        let completed = 0;
        let in_progress = 0;
        let to_do = 0;

        if (config.isConfigured) {
            try {
                const searchRes = await searchIssues(`project = ${config.projectKey}`, undefined, 100);
                const issues = searchRes.issues || [];
                total = issues.length;
                for (const i of issues) {
                    const statusLower = (i.fields?.status?.name || '').toLowerCase();
                    if (['done', 'closed', 'resolved'].includes(statusLower)) completed++;
                    else if (['in progress', 'in review', 'testing'].includes(statusLower)) in_progress++;
                    else to_do++;
                }
            } catch (err) {
                console.warn('[Jira Stats] Live search failed, using DB:', err.message);
            }
        }

        if (total === 0) {
            const issues = await Issue.find({}).lean();
            total = issues.length;
            for (const i of issues) {
                const statusLower = (i.status || '').toLowerCase();
                if (['done', 'closed', 'resolved'].includes(statusLower)) completed++;
                else if (['in progress', 'in review', 'testing'].includes(statusLower)) in_progress++;
                else to_do++;
            }
        }

        res.json({
            success: true,
            stats: {
                total,
                completed,
                in_progress,
                to_do,
                completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
            }
        });
    } catch (error) {
        console.error('[Jira Stats] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/jira/combined
 * Return combined Jira stats and recent tickets
 */
router.get('/combined', async (req, res) => {
    try {
        const config = getJiraConfig();
        const users = await getProjectAssignableUsers(config.projectKey);
        const searchRes = await searchIssues(`project = ${config.projectKey} ORDER BY updated DESC`, undefined, 15);
        const issues = searchRes.issues || [];

        res.json({
            success: true,
            totalTickets: issues.length,
            usersCount: users.length,
            tickets: issues.map(i => ({
                key: i.key,
                summary: i.fields?.summary,
                status: i.fields?.status?.name,
                assignee: i.fields?.assignee?.displayName,
                updated: i.fields?.updated,
            }))
        });
    } catch (error) {
        console.error('[Jira Combined] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/jira/sync-status
 * Get sync status of tasks
 */
router.get('/sync-status', async (req, res) => {
    try {
        const total = await Task.countDocuments({});
        const synced = await Task.countDocuments({
            synced_to_jira: true,
            jira_issue_key: { $regex: /^[A-Z][A-Z0-9]+-\d+$/ }
        });
        const pending = await Task.countDocuments({
            $or: [
                { synced_to_jira: false },
                { synced_to_jira: { $exists: false } },
                { jira_issue_key: /^PROJ-/i },
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
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
