/**
 * Direct test of hierarchical LLM allocation
 * Run with: node test/test_llm_direct.js
 */

require('dotenv').config();
const { runHierarchicalAllocation } = require('../services/hierarchicalLLM');

// Load employee data
const fs = require('fs');
const path = require('path');
const employeeData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'employee_data.json'), 'utf-8')
);

async function testHierarchicalLLM() {
  console.log('='.repeat(70));
  console.log('🧪 TESTING HIERARCHICAL LLM ALLOCATION');
  console.log('='.repeat(70));
  console.log(`\n📋 GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'SET (' + process.env.GEMINI_API_KEY.substring(0, 10) + '...)' : 'NOT SET!'}\n`);

  const taskDescription = "Build a real-time analytics dashboard for tracking user engagement";

  console.log(`📋 Task: "${taskDescription}"\n`);

  try {
    const result = await runHierarchicalAllocation(taskDescription, employeeData.teams);

    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL RESULT');
    console.log('='.repeat(70));

    if (result.success) {
      console.log('\n✅ SUCCESS!');
      console.log(`\n📝 PM Analysis: ${result.pm_analysis}`);
      console.log(`\n🏢 Departments: ${result.departments_involved.join(', ')}`);

      console.log('\n📦 ALLOCATIONS:');
      for (const [teamKey, allocation] of Object.entries(result.allocations)) {
        console.log(`\n--- ${teamKey.toUpperCase()} TEAM ---`);
        console.log(`Requirements: ${allocation.requirements}`);
        console.log(`Strategy: ${allocation.team_analysis}`);
        console.log('Work Assignments:');
        allocation.work_assignments.forEach((a, i) => {
          console.log(`  ${i + 1}. ${a.work_item}`);
          console.log(`     → Assigned to: ${a.assigned_to_name}`);
          console.log(`     → Reason: ${a.reasoning.substring(0, 100)}...`);
        });
      }

      console.log('\n\n📋 LLM Steps:');
      result.steps.forEach(step => {
        console.log(`  ${step.success ? '✅' : '❌'} ${step.step}`);
      });

    } else {
      console.log('\n❌ FAILED!');
      console.log(`Error: ${result.error}`);
      console.log('\nSteps:');
      result.steps.forEach(step => {
        console.log(`  ${step.success ? '✅' : '❌'} ${step.step}: ${step.data?.error || 'OK'}`);
      });
    }

  } catch (error) {
    console.error('\n❌ EXCEPTION:', error.message);
    console.error(error.stack);
  }

  console.log('\n' + '='.repeat(70));
}

testHierarchicalLLM();
