const express = require('express');
const router = express.Router();
const featherlessService = require('../services/featherlessService');

// Mock team members aligned with employee_data.json
const MOCK_TEAM_MEMBERS = [
    { name: 'Henry Cavill', email: 'henry.cavill@company.com', role: 'Product Manager', skills: ['Product Strategy', 'Roadmap Planning', 'Agile'], seniority: 4 },
    { name: 'Leonard Hofstadter', email: 'leonard.hofstadter@company.com', role: 'Senior Frontend Developer', skills: ['React', 'TypeScript', 'Node.js', 'CSS'], seniority: 3 },
    { name: 'Sheldon Cooper', email: 'sheldon.cooper@company.com', role: 'Backend Engineer', skills: ['Python', 'Neo4j', 'AWS', 'Docker'], seniority: 4 },
    { name: 'Penny Hofstadter', email: 'penny.hofstadter@company.com', role: 'Full Stack Developer', skills: ['JavaScript', 'Express', 'PostgreSQL', 'React'], seniority: 2 },
    { name: 'Raj Koothrappali', email: 'raj.koothrappali@company.com', role: 'DevOps Lead', skills: ['Kubernetes', 'Docker', 'CI/CD', 'Terraform'], seniority: 4 },
    { name: 'Emily Carter', email: 'emily.carter@company.com', role: 'Marketing Lead', skills: ['Campaign Strategy', 'SEO/SEM', 'Analytics'], seniority: 3 },
    { name: 'Nicole Kidman', email: 'nicole.kidman@company.com', role: 'Digital Marketing Specialist', skills: ['Google Ads', 'Social Media', 'Email Marketing'], seniority: 2 },
    { name: 'Bernard Shaw', email: 'bernard.shaw@company.com', role: 'Analytics & Insights Manager', skills: ['Google Analytics', 'Tableau', 'SQL'], seniority: 3 },
    { name: 'Howard Wolowitz', email: 'howard.wolowitz@company.com', role: 'Senior Content Editor', skills: ['Technical Writing', 'Content Editing', 'Documentation'], seniority: 4 },
    { name: 'Amy Farrah Fowler', email: 'amy.fowler@company.com', role: 'Content Writer', skills: ['Blog Writing', 'SEO Writing', 'Research'], seniority: 2 },
    { name: 'Amy Santiago', email: 'amy.santiago@company.com', role: 'UX Writer & Editor', skills: ['UX Writing', 'Microcopy', 'Accessibility Writing'], seniority: 3 }
];

// Generate random metrics for mock users (seeded by index for consistency)
const generateMockMetrics = (seniority, index) => {
    // Use index to create pseudo-random but consistent values
    const seed = (index * 7 + 13) % 100;
    const baseCommits = 15 + seniority * 12 + (seed % 25);
    const baseTickets = 8 + seniority * 4 + (seed % 10);
    const completionRate = 55 + seniority * 8 + (seed % 15);
    
    return {
        commits: {
            total: baseCommits,
            additions: baseCommits * (600 + (seed * 10)),
            deletions: baseCommits * (150 + (seed * 3)),
            avg_size: 250 + (seed * 5),
            last_commit: new Date(Date.now() - ((seed % 7) + 1) * 24 * 60 * 60 * 1000).toISOString()
        },
        tasks: {
            total: baseTickets,
            completed: Math.floor(baseTickets * completionRate / 100),
            in_progress: Math.max(1, Math.floor(baseTickets * 0.2)),
            pending: Math.max(0, Math.ceil(baseTickets * (1 - completionRate / 100) * 0.5)),
            overdue: seed % 4,
            completion_rate: completionRate
        },
        hours: {
            total_estimated: baseTickets * 8,
            completed: Math.floor(baseTickets * completionRate / 100) * 8
        },
        performance: {
            workload_score: 25 + (seed % 45),
            stress_level: 15 + (seed % 35),
            efficiency: completionRate,
            productivity_score: 50 + seniority * 10 + (seed % 20)
        }
    };
};

/**
 * GET /api/hr/employees
 * Get all employees (mock team with random metrics)
 */
router.get('/employees', async (req, res) => {
    try {
        const employees = MOCK_TEAM_MEMBERS.map((member, index) => {
            const metrics = generateMockMetrics(member.seniority, index);
            const hourlyRates = { 1: 55, 2: 70, 3: 85, 4: 100 };
            
            return {
                _id: `emp_${index + 1}`,
                user_id: `user_${index + 1}`,
                employee_id: `EMP${String(index + 1).padStart(3, '0')}`,
                name: member.name,
                email: member.email,
                role: member.role,
                department: 'Engineering',
                team: 'Core Team',
                skills: member.skills,
                seniority_level: member.seniority,
                hourly_rate: hourlyRates[member.seniority] || 75,
                years_of_experience: member.seniority + ((index * 3) % 4),
                availability: 'full-time',
                jira_linked: true,
                github_linked: true,
                source: 'mock',
                metrics
            };
        });
        
        console.log(`HR /employees: Returning ${employees.length} mock team members`);
        res.json(employees);
    } catch (err) {
        console.error('HR employees error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/hr/employee/:id
 */
router.get('/employee/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const index = parseInt(id.replace('emp_', '')) - 1;
        
        if (index >= 0 && index < MOCK_TEAM_MEMBERS.length) {
            const member = MOCK_TEAM_MEMBERS[index];
            const metrics = generateMockMetrics(member.seniority, index);
            
            return res.json({
                employee: {
                    _id: `emp_${index + 1}`,
                    name: member.name,
                    email: member.email,
                    role: member.role,
                    team: 'Core Team',
                    skills: member.skills
                },
                commits: {
                    total: metrics.commits.total,
                    recent_30_days: Math.floor(metrics.commits.total * 0.3),
                    by_week: [],
                    tech_distribution: {}
                },
                tasks: metrics.tasks,
                issues: { total: metrics.tasks.total, linked_to_commits: metrics.tasks.completed }
            });
        }
        
        return res.status(404).json({ error: 'Employee not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/hr/retention-analysis
 */
router.get('/retention-analysis', async (req, res) => {
    try {
        const retentionAnalysis = MOCK_TEAM_MEMBERS.map((member, index) => {
            const metrics = generateMockMetrics(member.seniority, index);
            const seed = (index * 7 + 13) % 100;
            
            const workloadFactor = metrics.performance.workload_score / 100;
            const activityTrend = 0.5 + (seed % 40) / 100;
            const overdueStress = metrics.tasks.overdue / Math.max(1, metrics.tasks.total);
            
            const riskScore = Math.round(
                (workloadFactor * 40) + 
                ((1 - activityTrend) * 30) + 
                (overdueStress * 30)
            );
            
            let riskLevel = 'low';
            if (riskScore >= 70) riskLevel = 'critical';
            else if (riskScore >= 50) riskLevel = 'high';
            else if (riskScore >= 30) riskLevel = 'medium';
            
            const recommendations = [];
            if (workloadFactor > 0.6) {
                recommendations.push({ type: 'workload', message: 'Consider redistributing tasks to reduce workload', priority: 'high' });
            }
            if (overdueStress > 0.2) {
                recommendations.push({ type: 'deadline', message: 'Review and extend deadlines for overdue tasks', priority: 'high' });
            }
            if (riskScore < 30) {
                recommendations.push({ type: 'positive', message: 'Employee shows healthy engagement levels', priority: 'info' });
            }
            
            return {
                employee: {
                    _id: `emp_${index + 1}`,
                    name: member.name,
                    email: member.email,
                    role: member.role,
                    team: 'Core Team',
                    department: 'Engineering'
                },
                metrics: {
                    workload_factor: Math.round(workloadFactor * 100),
                    activity_trend: Math.round(activityTrend * 100),
                    overdue_stress: Math.round(overdueStress * 100),
                    recent_commits: Math.floor(metrics.commits.total * 0.3),
                    active_tasks: metrics.tasks.in_progress + metrics.tasks.pending,
                    overdue_tasks: metrics.tasks.overdue,
                    completed_tasks: metrics.tasks.completed
                },
                risk: { score: riskScore, level: riskLevel },
                recommendations,
                jira_linked: true,
                github_linked: true
            };
        });
        
        retentionAnalysis.sort((a, b) => b.risk.score - a.risk.score);
        
        const summary = {
            total_employees: MOCK_TEAM_MEMBERS.length,
            critical_risk: retentionAnalysis.filter(e => e.risk.level === 'critical').length,
            high_risk: retentionAnalysis.filter(e => e.risk.level === 'high').length,
            medium_risk: retentionAnalysis.filter(e => e.risk.level === 'medium').length,
            low_risk: retentionAnalysis.filter(e => e.risk.level === 'low').length,
            avg_risk_score: Math.round(retentionAnalysis.reduce((sum, e) => sum + e.risk.score, 0) / MOCK_TEAM_MEMBERS.length)
        };
        
        console.log(`HR /retention-analysis: Returning ${retentionAnalysis.length} employees`);
        res.json({ summary, employees: retentionAnalysis });
    } catch (err) {
        console.error('HR retention-analysis error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/hr/team-stats
 */
router.get('/team-stats', async (req, res) => {
    try {
        let totalCommits = 0;
        let totalTasks = 0;
        let completedTasks = 0;
        let totalHours = 0;
        let totalCost = 0;
        
        const hourlyRates = { 1: 55, 2: 70, 3: 85, 4: 100 };
        
        MOCK_TEAM_MEMBERS.forEach((member, index) => {
            const metrics = generateMockMetrics(member.seniority, index);
            totalCommits += metrics.commits.total;
            totalTasks += metrics.tasks.total;
            completedTasks += metrics.tasks.completed;
            totalHours += metrics.hours.completed;
            totalCost += metrics.hours.completed * (hourlyRates[member.seniority] || 75);
        });
        
        const teamStats = {
            'Core Team': {
                name: 'Core Team',
                member_count: MOCK_TEAM_MEMBERS.length,
                total_commits: totalCommits,
                total_tasks: totalTasks,
                completed_tasks: completedTasks,
                completion_rate: Math.round((completedTasks / totalTasks) * 100),
                total_hours: totalHours,
                total_cost: totalCost,
                avg_commits_per_member: Math.round(totalCommits / MOCK_TEAM_MEMBERS.length),
                avg_tasks_per_member: Math.round(totalTasks / MOCK_TEAM_MEMBERS.length)
            }
        };
        
        res.json({
            teams: Object.values(teamStats),
            summary: {
                total_teams: 1,
                total_members: MOCK_TEAM_MEMBERS.length,
                total_commits: totalCommits,
                total_tasks: totalTasks,
                overall_completion_rate: Math.round((completedTasks / totalTasks) * 100)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/hr/sprint-analysis
 */
router.get('/sprint-analysis', async (req, res) => {
    try {
        const sprints = [];
        const now = new Date();
        
        // Generate 6 sprints of mock data
        for (let i = 5; i >= 0; i--) {
            const sprintStart = new Date(now.getTime() - (i + 1) * 14 * 24 * 60 * 60 * 1000);
            const sprintEnd = new Date(sprintStart.getTime() + 13 * 24 * 60 * 60 * 1000);
            const seed = (i * 17 + 23) % 100;
            
            const planned = 25 + (seed % 15);
            const completed = Math.floor(planned * (0.7 + (seed % 20) / 100));
            const carried = planned - completed;
            
            sprints.push({
                sprint_id: `sprint_${6 - i}`,
                name: `Sprint ${6 - i}`,
                start_date: sprintStart.toISOString(),
                end_date: sprintEnd.toISOString(),
                status: i === 0 ? 'active' : 'completed',
                planned_points: planned,
                completed_points: completed,
                carried_over: carried,
                velocity: completed,
                completion_rate: Math.round((completed / planned) * 100),
                team_capacity: MOCK_TEAM_MEMBERS.length * 40,
                utilized_capacity: Math.floor(MOCK_TEAM_MEMBERS.length * 40 * (0.75 + (seed % 15) / 100)),
                blockers: (seed % 4),
                bugs_found: 2 + (seed % 5),
                bugs_fixed: 1 + (seed % 4)
            });
        }
        
        const avgVelocity = Math.round(sprints.reduce((sum, s) => sum + s.velocity, 0) / sprints.length);
        const avgCompletion = Math.round(sprints.reduce((sum, s) => sum + s.completion_rate, 0) / sprints.length);
        
        res.json({
            sprints,
            summary: {
                total_sprints: sprints.length,
                avg_velocity: avgVelocity,
                avg_completion_rate: avgCompletion,
                total_points_completed: sprints.reduce((sum, s) => sum + s.completed_points, 0),
                velocity_trend: 'stable'
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/hr/daily-progress
 */
router.get('/daily-progress', async (req, res) => {
    try {
        const dailyProgress = [];
        const now = new Date();
        
        // Generate 14 days of mock data
        for (let i = 13; i >= 0; i--) {
            const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayOfWeek = day.getDay();
            const seed = (i * 11 + 7) % 100;
            
            // Less activity on weekends
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const multiplier = isWeekend ? 0.3 : 1;
            
            dailyProgress.push({
                date: day.toISOString().split('T')[0],
                day_name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
                commits: Math.floor((12 + (seed % 20)) * multiplier),
                tasks_completed: Math.floor((4 + (seed % 6)) * multiplier),
                tasks_started: Math.floor((3 + (seed % 5)) * multiplier),
                code_reviews: Math.floor((2 + (seed % 4)) * multiplier),
                bugs_fixed: Math.floor((1 + (seed % 3)) * multiplier),
                hours_logged: Math.floor((MOCK_TEAM_MEMBERS.length * 7 + (seed % 20)) * multiplier),
                active_developers: Math.floor(MOCK_TEAM_MEMBERS.length * (isWeekend ? 0.2 : 0.9))
            });
        }
        
        const totalCommits = dailyProgress.reduce((sum, d) => sum + d.commits, 0);
        const totalTasksCompleted = dailyProgress.reduce((sum, d) => sum + d.tasks_completed, 0);
        const avgDailyCommits = Math.round(totalCommits / 14);
        
        res.json({
            daily_progress: dailyProgress,
            summary: {
                total_commits: totalCommits,
                total_tasks_completed: totalTasksCompleted,
                avg_daily_commits: avgDailyCommits,
                avg_daily_tasks: Math.round(totalTasksCompleted / 14),
                most_active_day: 'Wednesday',
                least_active_day: 'Sunday'
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/hr/delay-prediction-data
 */
router.get('/delay-prediction-data', async (req, res) => {
    try {
        const delayPredictionData = MOCK_TEAM_MEMBERS.map((member, index) => {
            const metrics = generateMockMetrics(member.seniority, index);
            const seed = (index * 7 + 13) % 100;
            
            const velocityScore = 50 + member.seniority * 10 + (seed % 20);
            const workloadScore = metrics.performance.workload_score;
            const productivityScore = metrics.performance.productivity_score;
            
            const delayImpact = Math.round((metrics.tasks.in_progress * 0.5 + metrics.tasks.pending * 0.3) * 10) / 10;
            
            return {
                id: `emp_${index + 1}`,
                name: member.name,
                email: member.email,
                role: member.role,
                source: 'mock',
                skills: member.skills,
                hourly_rate: { 1: 55, 2: 70, 3: 85, 4: 100 }[member.seniority] || 75,
                commit_metrics: {
                    total_commits: metrics.commits.total,
                    recent_commits_30d: Math.floor(metrics.commits.total * 0.3),
                    commits_per_week: Math.round(metrics.commits.total / 4 * 10) / 10,
                    avg_lines_per_commit: metrics.commits.avg_size,
                    velocity_score: velocityScore
                },
                jira_metrics: {
                    total_tickets: metrics.tasks.total,
                    open_tickets: metrics.tasks.in_progress + metrics.tasks.pending,
                    completed_tickets: metrics.tasks.completed,
                    in_progress_tickets: metrics.tasks.in_progress,
                    high_priority_open: seed % 3,
                    completion_rate: metrics.tasks.completion_rate
                },
                task_metrics: {
                    assigned_tasks: metrics.tasks.total,
                    completed_tasks: metrics.tasks.completed,
                    in_progress_tasks: metrics.tasks.in_progress,
                    overdue_tasks: metrics.tasks.overdue
                },
                scores: {
                    workload: workloadScore,
                    productivity: productivityScore,
                    velocity: velocityScore
                },
                delay_prediction: {
                    impact_if_removed_days: delayImpact,
                    replacement_difficulty: delayImpact > 3 ? 'hard' : delayImpact > 1.5 ? 'medium' : 'easy',
                    burnout_risk: workloadScore > 60 ? 'high' : workloadScore > 35 ? 'medium' : 'low',
                    single_point_of_failure: member.seniority >= 4 && delayImpact > 2
                },
                jira_linked: true,
                github_linked: true
            };
        });
        
        delayPredictionData.sort((a, b) => b.scores.productivity - a.scores.productivity);
        
        console.log(`HR /delay-prediction-data: Returning ${delayPredictionData.length} employees`);
        res.json({
            total: delayPredictionData.length,
            employees: delayPredictionData
        });
    } catch (err) {
        console.error('Error in delay-prediction-data:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/hr/burnout-analysis
 */
router.post('/burnout-analysis', async (req, res) => {
    try {
        const { employee_ids } = req.body;
        
        const analyses = (employee_ids || MOCK_TEAM_MEMBERS.map((_, i) => `emp_${i + 1}`)).map((id) => {
            const index = parseInt(id.replace('emp_', '')) - 1;
            if (index < 0 || index >= MOCK_TEAM_MEMBERS.length) return null;
            
            const member = MOCK_TEAM_MEMBERS[index];
            const metrics = generateMockMetrics(member.seniority, index);
            const seed = (index * 7 + 13) % 100;
            
            const burnoutScore = Math.min(100, metrics.performance.workload_score + (seed % 20));
            
            return {
                employee_id: id,
                name: member.name,
                role: member.role,
                burnout_score: burnoutScore,
                risk_level: burnoutScore > 70 ? 'high' : burnoutScore > 40 ? 'medium' : 'low',
                factors: {
                    workload: metrics.performance.workload_score,
                    overtime_hours: seed % 15,
                    consecutive_work_days: 5 + (seed % 8),
                    vacation_days_remaining: 10 - (seed % 6)
                },
                recommendations: burnoutScore > 50 ? [
                    'Consider taking time off',
                    'Redistribute some tasks to other team members'
                ] : ['Maintain current work-life balance']
            };
        }).filter(Boolean);
        
        res.json({
            analyses,
            team_avg_burnout: Math.round(analyses.reduce((sum, a) => sum + a.burnout_score, 0) / analyses.length)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
/**
 * Deterministic local analytics generator for employee performance reports.
 * Used when Gemini LLM credits are depleted (HTTP 402) or offline.
 */
function generateLocalPerformanceReport(employee, metrics, failureReason = '') {
    const emp = employee || {};
    const met = metrics || {};
    const commits = met.commits || {};
    const tasks = met.tasks || {};
    const perf = met.performance || {};

    const name = emp.name || 'Engineer';
    const role = emp.role || 'Software Engineer';
    const dept = emp.department || 'Engineering';
    const team = emp.team || 'Core Team';
    const seniority = Number(emp.seniority_level) || 3;
    const hourlyRate = Number(emp.hourly_rate) || 50;
    const skills = Array.isArray(emp.skills) && emp.skills.length > 0 ? emp.skills : ['Software Engineering', 'System Architecture'];

    const totalCommits = Number(commits.total) || 0;
    const additions = Number(commits.additions) || 0;
    const deletions = Number(commits.deletions) || 0;
    const avgCommitSize = Number(commits.avg_size) || (totalCommits > 0 ? Math.round(additions / totalCommits) : 150);

    const totalTasks = Number(tasks.total) || 10;
    const completedTasks = Number(tasks.completed) || 0;
    const overdueTasks = Number(tasks.overdue) || 0;
    const completionRate = Number(tasks.completion_rate) !== undefined 
        ? Number(tasks.completion_rate) 
        : (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 70);

    const workloadScore = Number(perf.workload_score) || 50;
    const stressLevel = Number(perf.stress_level) || 30;
    const efficiency = Number(perf.efficiency) || completionRate;
    const productivityScore = Number(perf.productivity_score) || (50 + seniority * 8);

    // Appraisal score calculation (weighted 0-100)
    let score = Math.round(
        (efficiency * 0.35) + 
        (productivityScore * 0.35) + 
        (completionRate * 0.25) + 
        (seniority * 2) - 
        (overdueTasks * 2.5) - 
        (stressLevel > 70 ? 4 : 0)
    );
    score = Math.max(35, Math.min(98, score));

    // Budget impact & ROI calculation
    const monthlyHours = 160;
    const currentCost = Math.round(hourlyRate * monthlyHours);
    const valueMultiplier = 1.15 + (score / 100) * 0.5 + (seniority * 0.05);
    const projectedValue = Math.round(currentCost * valueMultiplier);
    const roiPercent = Math.round(((projectedValue - currentCost) / currentCost) * 100);

    let roiAssessment = '';
    if (roiPercent >= 40) {
        roiAssessment = `High positive ROI with an estimated +${roiPercent}% value return above base compensation, driven by high code velocity and reliable task execution.`;
    } else if (roiPercent >= 15) {
        roiAssessment = `Solid positive ROI (+${roiPercent}%), demonstrating steady sprint output and balanced technical contribution across assigned deliverables.`;
    } else {
        roiAssessment = `Neutral to moderate ROI (+${roiPercent}%); performance can be optimized by clearing delivery bottlenecks and balancing workload.`;
    }

    // Promotion readiness
    let promotionReadiness = '';
    if (score >= 85 && overdueTasks <= 1 && completionRate >= 80) {
        promotionReadiness = `Ready - Demonstrates superior technical ownership across ${skills.slice(0, 2).join(' and ')}, consistent delivery velocity, and autonomy with minimal oversight.`;
    } else if (score >= 70) {
        promotionReadiness = `Developing - Consistent core contributor meeting role benchmarks; recommend taking on cross-module architecture and peer mentorship to qualify for higher band.`;
    } else {
        promotionReadiness = `Not ready - Needs focus on stabilizing sprint completion rate (${completionRate}%), resolving ${overdueTasks} overdue tasks, and balancing active work streams.`;
    }

    // Dynamic Strengths
    const strengths = [];
    if (completionRate >= 75) {
        strengths.push(`High delivery velocity with a ${completionRate}% task completion rate (${completedTasks} of ${totalTasks} tasks closed).`);
    } else {
        strengths.push(`Active contribution across sprint commitments with ${completedTasks} completed work items.`);
    }

    if (totalCommits > 0) {
        strengths.push(`Strong engineering cadence with ${totalCommits} commits (+${additions.toLocaleString()} / -${deletions.toLocaleString()} lines) maintaining steady repository activity.`);
    } else {
        strengths.push(`Consistent participation across core team workflows and sprint planning objectives.`);
    }

    strengths.push(`Demonstrated proficiency in ${skills.slice(0, 3).join(', ')} with solid domain problem-solving.`);

    // Dynamic Areas for Improvement
    const areasForImprovement = [];
    if (overdueTasks > 0) {
        areasForImprovement.push(`Clear current backlog of ${overdueTasks} overdue deliverables through proactive re-estimation and sprint alignment.`);
    } else {
        areasForImprovement.push(`Maintain rigorous cycle-time tracking to ensure zero overdue task slippage on complex deliverables.`);
    }

    if (stressLevel >= 60 || workloadScore >= 70) {
        areasForImprovement.push(`Address elevated workload stress (score: ${stressLevel}/100) by redistributing parallel tasks and establishing work-in-progress (WIP) caps.`);
    } else {
        areasForImprovement.push(`Deconstruct larger changes (avg size: ${avgCommitSize} lines) into more focused pull requests to streamline review throughput.`);
    }

    // Dynamic Recommendations
    const recommendations = [
        `Align on quarterly technical milestones focusing on ${skills[0] || 'core architecture'} and automated test coverage.`,
        overdueTasks > 0 
            ? `Schedule weekly backlog triage with the lead engineer to unblock dependent task dependencies early.` 
            : `Lead architectural design discussions and foster technical knowledge sharing across ${team}.`,
        stressLevel >= 55 
            ? `Calibrate sprint capacity to 80% to provide buffer for operational interruptions and prevent burnout.` 
            : `Explore cross-department mentoring opportunities to elevate junior team members' ramp-up speed.`
    ];

    // Executive summary
    const summary = `${name} is currently performing as a ${role} in ${dept} with an overall appraisal score of ${score}/100. They have demonstrated an efficiency rating of ${efficiency}% and a task completion rate of ${completionRate}% across ${totalTasks} assigned deliverables. Their productivity and technical engagement deliver an estimated ${roiPercent}% value above operational cost, making them a key contributor to ${team} delivery targets.`;

    return {
        summary,
        strengths,
        areas_for_improvement: areasForImprovement,
        recommendations,
        appraisal_score: score,
        budget_impact: {
            current_cost: currentCost,
            projected_value: projectedValue,
            roi_assessment: roiAssessment
        },
        promotion_readiness: promotionReadiness,
        is_fallback: true,
        source: 'Local Analytics Engine (Gemini Fallback)'
    };
}

/**
 * Deterministic local analytics generator for team retention insights.
 * Used when Gemini LLM credits are depleted (HTTP 402) or offline.
 */
function generateLocalRetentionInsight(summaryData, risksData, failureReason = '') {
    const summary = summaryData || {};
    const risks = Array.isArray(risksData) ? risksData : [];
    
    const totalEmployees = summary.total_employees || 10;
    const criticalRisk = summary.critical_risk || 0;
    const highRisk = summary.high_risk || 0;
    const lowRisk = summary.low_risk || 0;
    const avgRiskScore = summary.avg_risk_score || 40;

    const highRiskCount = criticalRisk + highRisk;
    const healthStatus = avgRiskScore > 65 ? 'elevated retention concern' : avgRiskScore > 40 ? 'moderate retention risk' : 'healthy retention profile';

    const overallAssessment = `Team retention diagnostics indicate a ${healthStatus} across ${totalEmployees} monitored members, with an average risk score of ${avgRiskScore}/100. Currently, ${highRiskCount} employee(s) sit in critical or high risk tiers due to workload concentration and overdue deliverables, while ${lowRisk} members maintain stable, low-risk engagement patterns. Immediate operational rebalancing will stabilize team retention and prevent preventable turnover.`;

    const criticalActions = [
        `Schedule confidential 1-on-1 check-ins within 48 hours for the ${Math.max(1, highRiskCount)} highest-risk team member(s) to evaluate bandwidth bottlenecks.`,
        `Reallocate or re-estimate overdue tasks currently assigned to overloaded engineers to restore delivery momentum.`,
        `Enforce work-in-progress (WIP) limits across active sprints to prevent concurrent task overload on critical-path contributors.`
    ];

    const teamRecommendations = [
        `Establish cross-training pairs on mission-critical services to eliminate single points of failure and reduce lone-contributor stress.`,
        `Incorporate a 15-20% buffer in sprint capacity planning to absorb production incidents without infringing on engineer recovery time.`
    ];

    const wellnessInitiatives = [
        `Institute bi-weekly 'Focus Days' with zero scheduled internal meetings to provide uninterrupted deep engineering time.`,
        `Implement proactive burnout alerts in management dashboards when an engineer's workload index exceeds 75% for two consecutive cycles.`,
        `Reinforce recognition programs acknowledging peer unblocking, on-call support, and high-impact non-feature contributions.`
    ];

    return {
        overall_assessment: overallAssessment,
        critical_actions: criticalActions,
        team_recommendations: teamRecommendations,
        wellness_initiatives: wellnessInitiatives,
        is_fallback: true,
        source: 'Local Analytics Engine (Gemini Fallback)'
    };
}

/**
 * POST /api/hr/generate-report
 * Generate AI performance report using server-side proxy with automatic local intelligence fallback
 */
router.post('/generate-report', async (req, res) => {
    try {
        const { employee, metrics } = req.body;
        
        if (!employee || !metrics) {
            return res.status(400).json({ error: 'Missing employee or metrics data' });
        }

        // Try Gemini completion if billing is not depleted
        if (!featherlessService.isDepleted() && process.env.GEMINI_API_KEY) {
            try {
                const prompt = `You are an HR analytics expert. Analyze the following employee performance data and generate a comprehensive performance report.

EMPLOYEE DATA:
- Name: ${employee.name}
- Role: ${employee.role}
- Department: ${employee.department || 'N/A'} 
- Team: ${employee.team || 'N/A'}
- Seniority Level: ${employee.seniority_level}/5
- Years of Experience: ${employee.years_of_experience || 'N/A'}
- Skills: ${employee.skills?.join(', ') || 'N/A'}
- Hourly Rate: $${employee.hourly_rate || 0}

PERFORMANCE METRICS:
- Total Commits: ${metrics.commits.total}
- Code Added: ${metrics.commits.additions} lines
- Code Removed: ${metrics.commits.deletions} lines
- Avg Commit Size: ${metrics.commits.avg_size} lines
- Last Commit: ${metrics.commits.last_commit || 'N/A'}

- Total Tasks Assigned: ${metrics.tasks.total}
- Tasks Completed: ${metrics.tasks.completed}
- Tasks In Progress: ${metrics.tasks.in_progress}
- Tasks Pending: ${metrics.tasks.pending}
- Overdue Tasks: ${metrics.tasks.overdue}
- Task Completion Rate: ${metrics.tasks.completion_rate}%

- Total Estimated Hours: ${metrics.hours.total_estimated}
- Hours Completed: ${metrics.hours.completed}

- Workload Score: ${metrics.performance.workload_score}/100
- Stress Level: ${metrics.performance.stress_level}/100
- Efficiency Score: ${metrics.performance.efficiency}/100
- Productivity Score: ${metrics.performance.productivity_score}/100

Generate a JSON response with EXACTLY this structure (no markdown, just valid JSON):
{
  "summary": "2-3 sentence executive summary of performance",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areas_for_improvement": ["area 1", "area 2"],
  "recommendations": ["specific recommendation 1", "specific recommendation 2", "specific recommendation 3"],
  "appraisal_score": <number 1-100>,
  "budget_impact": {
    "current_cost": <monthly cost based on hourly rate>,
    "projected_value": <estimated value delivered based on metrics>,
    "roi_assessment": "positive/neutral/negative with brief explanation"
  },
  "promotion_readiness": "ready/developing/not ready - with brief explanation"
}

Base your analysis ONLY on the provided metrics. Be specific and quantifiable.`;

                const response = await featherlessService.generateCompletion([
                    { role: 'system', content: 'You are an HR analytics expert. Respond only with valid JSON, no markdown.' },
                    { role: 'user', content: prompt }
                ], {
                    temperature: 0.3,
                    max_tokens: 1500
                });

                const content = response.choices?.[0]?.message?.content || '';
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (parsed.summary && parsed.appraisal_score !== undefined) {
                        return res.json(parsed);
                    }
                }
            } catch (llmErr) {
                console.warn('⚠️ [HR Report] Gemini API call bypassed/failed:', llmErr.message);
                console.warn('ℹ️ [HR Report] Seamlessly generating report using local analytics engine.');
            }
        }

        // Automatic fallback: local deterministic performance analytics
        const fallbackReport = generateLocalPerformanceReport(employee, metrics);
        return res.json(fallbackReport);

    } catch (err) {
        console.error('Report Generation Error:', err);
        try {
            const fallbackReport = generateLocalPerformanceReport(req.body?.employee, req.body?.metrics);
            return res.json(fallbackReport);
        } catch (fallbackErr) {
            return res.status(500).json({ error: err.message });
        }
    }
});

/**
 * POST /api/hr/generate-retention-insight
 * Generate AI retention insights using server-side proxy with automatic local intelligence fallback
 */
router.post('/generate-retention-insight', async (req, res) => {
    try {
        const { summary, employees, risks } = req.body;
        
        if (!summary) {
            return res.status(400).json({ error: 'Missing retention data' });
        }

        // Try Gemini completion if billing is not depleted
        if (!featherlessService.isDepleted() && process.env.GEMINI_API_KEY) {
            try {
                const prompt = `You are an HR retention expert. Analyze this team retention data and provide actionable insights.

RETENTION SUMMARY:
- Total Employees: ${summary.total_employees}
- Critical Risk: ${summary.critical_risk} employees
- High Risk: ${summary.high_risk} employees  
- Medium Risk: ${summary.medium_risk} employees
- Low Risk: ${summary.low_risk} employees
- Average Risk Score: ${summary.avg_risk_score}/100

HIGH-RISK EMPLOYEES:
${(risks || []).map(e => `
- ${e.name} (${e.role}, ${e.team || 'No Team'})
  Risk Score: ${e.risk_score}/100
  Workload: ${e.workload}%
  Activity Trend: ${e.activity_trend}%
  Overdue Tasks: ${e.overdue}
  Active Tasks: ${e.active}
`).join('')}

Generate a JSON response with EXACTLY this structure (no markdown, just valid JSON):
{
  "overall_assessment": "2-3 sentence assessment of team retention health",
  "critical_actions": ["immediate action 1", "immediate action 2", "immediate action 3"],
  "team_recommendations": ["team-level recommendation 1", "team-level recommendation 2"],
  "wellness_initiatives": ["wellness initiative 1", "wellness initiative 2", "wellness initiative 3"]
}

Base recommendations ONLY on the provided data. Be specific and actionable.`;

                const response = await featherlessService.generateCompletion([
                    { role: 'system', content: 'You are an HR retention expert. Respond only with valid JSON.' },
                    { role: 'user', content: prompt }
                ], {
                    temperature: 0.3,
                    max_tokens: 1000
                });

                const content = response.choices?.[0]?.message?.content || '';
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (parsed.overall_assessment && Array.isArray(parsed.critical_actions)) {
                        return res.json(parsed);
                    }
                }
            } catch (llmErr) {
                console.warn('⚠️ [HR Retention] Gemini API call bypassed/failed:', llmErr.message);
                console.warn('ℹ️ [HR Retention] Seamlessly generating insights using local analytics engine.');
            }
        }

        // Automatic fallback: local deterministic retention analytics
        const fallbackInsight = generateLocalRetentionInsight(summary, risks);
        return res.json(fallbackInsight);

    } catch (err) {
        console.error('Retention Insight Error:', err);
        try {
            const fallbackInsight = generateLocalRetentionInsight(req.body?.summary, req.body?.risks);
            return res.json(fallbackInsight);
        } catch (fallbackErr) {
            return res.status(500).json({ error: err.message });
        }
    }
});

// Helper function
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

module.exports = router;
