/**
 * Test script for Hierarchical LLM Task Allocation
 * 
 * This demonstrates the two-level LLM approach:
 * 1. PM Level: Categorize tasks by department
 * 2. Team Level: Assign tasks to specific members
 */

const { allocateTaskHierarchical } = require('../services/taskAllocator');

async function runTest() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTING HIERARCHICAL LLM TASK ALLOCATION');
  console.log('='.repeat(80));
  console.log('\nThis will demonstrate the two-level LLM approach:');
  console.log('  1️⃣  PM Level: Categorize tasks by department (Tech, Marketing, Editing)');
  console.log('  2️⃣  Team Level: Assign tasks to specific members based on skills\n');

  const testTask = "Launch a new AI-powered chatbot feature for our mobile app";

  try {
    const result = await allocateTaskHierarchical(testTask);

    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(80));
    console.log(`\n✅ Task Type: ${result.task_type}`);
    console.log(`📋 PM Analysis: ${result.pm_analysis}`);
    console.log(`\n🏢 Departments Involved: ${result.departments_involved?.join(', ') || 'N/A'}`);

    console.log('\n📦 TEAM ALLOCATIONS:');
    for (const [teamKey, teamData] of Object.entries(result.teams)) {
      console.log(`\n${'─'.repeat(70)}`);
      console.log(`🔹 ${teamData.team_name.toUpperCase()}`);
      console.log(`${'─'.repeat(70)}`);
      console.log(`💭 Strategy: ${teamData.thinking}`);
      console.log(`📋 Tasks (${teamData.tasks.length}):`);
      
      teamData.tasks.forEach((task, idx) => {
        console.log(`\n   ${idx + 1}. ${task.title}`);
        console.log(`      👤 Assigned to: ${task.assigned_to.name} (${task.assigned_to.role})`);
        console.log(`      📊 Score: ${Math.round(task.score.total * 100)}%`);
        console.log(`      💡 Reasoning: ${task.reasoning[0]?.substring(0, 120)}...`);
        console.log(`      🔧 Skills: ${task.required_skills.slice(0, 3).join(', ')}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ HIERARCHICAL ALLOCATION COMPLETE');
    console.log('='.repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`   • Total Teams: ${Object.keys(result.teams).length}`);
    console.log(`   • Total Tasks: ${Object.values(result.teams).reduce((sum, t) => sum + t.tasks.length, 0)}`);
    console.log(`   • LLM Steps: ${result.llm_steps?.length || 0}`);
    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }

  process.exit(0);
}

runTest();
