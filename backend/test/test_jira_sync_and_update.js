const axios = require('axios');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:8000/api';
const MONGODB_URI = process.env.MONGODB_URI;

async function runTests() {
    console.log('====================================================');
    console.log('🧪 JIRA TICKETS SYNC & UPDATE TEST SUITE');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`  ✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${message}`);
            failed++;
        }
    }

    try {
        await mongoose.connect(MONGODB_URI);
        const Task = require('../models/Task');
        const Issue = require('../models/Issue');

        // Test 1: GET /api/jira/users
        console.log('--- Test 1: GET /api/jira/users ---');
        try {
            const res = await axios.get(`${BASE_URL}/jira/users`);
            assert(res.status === 200 && res.data.success && Array.isArray(res.data.users), 'Fetches assignable Jira users');
            assert(res.data.users.length > 0, `Found ${res.data.users.length} assignable users`);
            console.log('  Users:', res.data.users.map(u => u.displayName));
        } catch (e) {
            assert(false, `GET /api/jira/users failed: ${e.message}`);
        }

        // Test 2: GET /api/jira/stats
        console.log('\n--- Test 2: GET /api/jira/stats ---');
        try {
            const res = await axios.get(`${BASE_URL}/jira/stats`);
            assert(res.status === 200 && res.data.success && res.data.stats, 'Fetches Jira ticket stats');
            assert(typeof res.data.stats.total === 'number', `Total tickets: ${res.data.stats.total}`);
        } catch (e) {
            assert(false, `GET /api/jira/stats failed: ${e.message}`);
        }

        // Test 3: POST /api/jira/sync (Two-way sync)
        console.log('\n--- Test 3: POST /api/jira/sync (Two-way sync) ---');
        try {
            const res = await axios.post(`${BASE_URL}/jira/sync`);
            assert(res.status === 200 && res.data.success, 'Two-way sync endpoint succeeds');
            assert(Array.isArray(res.data.recent) && res.data.recent.length > 0, `Returned ${res.data.recent?.length} recent Jira tickets`);
            assert(res.data.recent[0].key.startsWith('KAN-'), `Top ticket has valid Jira key: ${res.data.recent[0]?.key}`);
        } catch (e) {
            assert(false, `POST /api/jira/sync failed: ${e.message}`);
        }

        // Test 4: GET /api/jira/recent-activity
        console.log('\n--- Test 4: GET /api/jira/recent-activity ---');
        try {
            const res = await axios.get(`${BASE_URL}/jira/recent-activity?limit=5`);
            assert(res.status === 200 && Array.isArray(res.data.recent), 'Fetches recent Jira activity');
            assert(res.data.recent.length > 0, `Returned ${res.data.recent.length} recent tickets`);
            assert(res.data.recent[0].key.startsWith('KAN-'), `First ticket key is real Jira key: ${res.data.recent[0]?.key}`);
        } catch (e) {
            assert(false, `GET /api/jira/recent-activity failed: ${e.message}`);
        }

        // Test 5: PUT /api/jira/issue/:key (Update ticket on Jira dashboard)
        console.log('\n--- Test 5: PUT /api/jira/issue/:key ---');
        try {
            // Find a real issue key to update
            const recentRes = await axios.get(`${BASE_URL}/jira/recent-activity?limit=1`);
            const targetKey = recentRes.data.recent[0]?.key;
            if (targetKey) {
                const updatedSummary = recentRes.data.recent[0].summary;
                const res = await axios.put(`${BASE_URL}/jira/issue/${targetKey}`, {
                    summary: updatedSummary,
                    description: 'Updated via Kaizen dashboard sync test',
                    priority: 'High',
                    status: 'In Progress',
                });
                assert(res.status === 200 && res.data.success, `Successfully updated ${targetKey} on Jira dashboard`);
                assert(res.data.issue?.key === targetKey, `Returned updated issue key: ${res.data.issue?.key}`);
            } else {
                assert(false, 'No issue key available to update');
            }
        } catch (e) {
            assert(false, `PUT /api/jira/issue/:key failed: ${e.message}`);
        }

        // Test 6: POST /api/jira/sync-tasks (Task synchronization to Jira)
        console.log('\n--- Test 6: POST /api/jira/sync-tasks ---');
        try {
            // Create a test pending task
            const testTaskId = `test-sync-${Date.now()}`;
            await Task.create({
                task_id: testTaskId,
                title: `Auto Test Jira Sync ${Date.now()}`,
                description: 'Verifying Jira ticket creation and dashboard synchronization',
                role_required: 'backend',
                priority: 'medium',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                estimated_hours: 12,
                status: 'pending',
                synced_to_jira: false,
            });

            const res = await axios.post(`${BASE_URL}/jira/sync-tasks`, {
                task_ids: [testTaskId]
            });

            assert(res.status === 200 && res.data.success, 'POST /api/jira/sync-tasks succeeds');
            assert(res.data.results.created > 0 || res.data.results.updated > 0, `Synced task (created: ${res.data.results.created}, updated: ${res.data.results.updated})`);

            // Verify in MongoDB
            const syncedTask = await Task.findOne({ task_id: testTaskId });
            assert(syncedTask && syncedTask.synced_to_jira === true, 'Task in MongoDB marked synced_to_jira: true');
            assert(syncedTask && syncedTask.jira_issue_key?.startsWith('KAN-'), `Task in MongoDB has genuine Jira key: ${syncedTask?.jira_issue_key}`);
            assert(Boolean(syncedTask?.jira_assignee), `Task assigned to Jira assignee: ${syncedTask?.jira_assignee}`);

            // Clean up test task in DB
            await Task.deleteOne({ task_id: testTaskId });
        } catch (e) {
            assert(false, `POST /api/jira/sync-tasks failed: ${e.message}`);
        }

        // Test 7: GET /api/jira/sync-status
        console.log('\n--- Test 7: GET /api/jira/sync-status ---');
        try {
            const res = await axios.get(`${BASE_URL}/jira/sync-status`);
            assert(res.status === 200 && res.data.success && res.data.status, 'Fetches sync status');
            assert(typeof res.data.status.synced === 'number', `Synced count: ${res.data.status.synced}/${res.data.status.total}`);
        } catch (e) {
            assert(false, `GET /api/jira/sync-status failed: ${e.message}`);
        }

    } catch (err) {
        console.error('Test suite error:', err);
        failed++;
    } finally {
        await mongoose.disconnect();
        console.log('\n====================================================');
        console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
        console.log('====================================================\n');
        process.exit(failed > 0 ? 1 : 0);
    }
}

runTests();
