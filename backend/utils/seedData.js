const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');

const seedData = async () => {
    try {
        let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-app';
        
        console.log('Connecting to MongoDB:', mongoUri);
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        console.log('Connected. Clearing collection...');
        try { await User.collection.drop(); } catch(e) { console.log('User collection not found or dropped'); }
        try { await Task.collection.drop(); } catch(e) { console.log('Task collection not found or dropped'); }

        const users = [
            // Engineering leadership
            {
                employee_id: "PM001",
                name: "Henry Cavill",
                email: "henry.cavill@company.com",
                role: "Principal Software Engineer",
                team: "platform_engineering",
                years_of_experience: 12,
                skills: ["System Architecture", "Distributed Systems", "Technical Leadership", "Agile"],
                expertise: { "System Architecture": 1.0, "Distributed Systems": 0.9 },
                working_style: "Analytical, Systems-focused",
                availability: "Busy",
                free_slots_per_week: 5,
                past_performance_score: 0.95,
                jira_account_id: "jira-pm-001"
            },
            // Application engineering team
            {
                employee_id: "TECH001",
                name: "Leonard Hofstadter",
                email: "leonard.hofstadter@company.com",
                role: "Senior Frontend Developer",
                team: "application_engineering",
                years_of_experience: 5,
                skills: ["React", "TypeScript", "Node.js", "CSS"],
                expertise: { "Frontend Development": 0.95, "UI/UX Implementation": 0.90 },
                availability: "Partially Free",
                free_slots_per_week: 15,
                past_performance_score: 0.92,
                jira_account_id: "jira-tech-001"
            },
            {
                employee_id: "TECH002",
                name: "Sheldon Cooper",
                email: "sheldon.cooper@company.com",
                role: "Backend Engineer",
                team: "application_engineering",
                years_of_experience: 4,
                skills: ["Node.js", "Express", "MongoDB", "AWS"],
                expertise: { "Backend Architecture": 0.85, "Database Design": 0.90 },
                availability: "Free",
                free_slots_per_week: 25,
                past_performance_score: 0.88,
                jira_account_id: "jira-tech-002"
            },
            {
                employee_id: "TECH003",
                name: "Penny Hofstadter",
                email: "penny.hofstadter@company.com",
                role: "Full Stack Developer",
                team: "application_engineering",
                years_of_experience: 3,
                skills: ["React", "Node.js", "GraphQL", "PostgreSQL"],
                expertise: { "Full Stack Development": 0.80, "API Design": 0.85 },
                availability: "Partially Free",
                free_slots_per_week: 10,
                past_performance_score: 0.85,
                jira_account_id: "jira-tech-003"
            },
             {
                employee_id: "TECH004",
                name: "Raj Koothrappali",
                email: "raj.koothrappali@company.com",
                role: "DevOps Engineer",
                team: "platform_engineering",
                years_of_experience: 6,
                skills: ["Docker", "Kubernetes", "CI/CD", "AWS"],
                expertise: { "DevOps": 0.95, "Cloud Infrastructure": 0.90 },
                availability: "Busy",
                free_slots_per_week: 5,
                past_performance_score: 0.94,
                jira_account_id: "jira-tech-004"
            },
            // Data and reliability engineering team
            {
                employee_id: "MKT001",
                name: "Emily Carter",
                email: "emily.carter@company.com",
                role: "Data Engineering Lead",
                team: "data_engineering",
                years_of_experience: 8,
                skills: ["Python", "Spark", "SQL", "Data Pipelines"],
                expertise: { "Data Engineering": 0.95, "Data Pipelines": 0.85 },
                availability: "available",
                free_slots_per_week: 20,
                past_performance_score: 0.91,
                jira_account_id: "jira-mkt-001"
            },
            {
                employee_id: "MKT002",
                name: "Nicole Kidman",
                email: "nicole.kidman@company.com",
                role: "Site Reliability Engineer",
                team: "platform_engineering",
                years_of_experience: 4,
                skills: ["Linux", "Kubernetes", "Monitoring", "Incident Response"],
                expertise: { "Site Reliability": 0.90, "Observability": 0.85 },
                availability: "partially_available",
                free_slots_per_week: 12,
                past_performance_score: 0.87,
                jira_account_id: "jira-mkt-002"
            },
            {
                employee_id: "MKT003",
                name: "Bernard Shaw",
                email: "bernard.shaw@company.com",
                role: "Security Engineer",
                team: "security_engineering",
                years_of_experience: 2,
                skills: ["Application Security", "Threat Modeling", "Python", "OWASP"],
                expertise: { "Application Security": 0.88, "Threat Modeling": 0.85 },
                availability: "available",
                free_slots_per_week: 30,
                past_performance_score: 0.84,
                jira_account_id: "jira-mkt-003"
            },
            // QA and documentation engineering team
            {
                employee_id: "EDT001",
                name: "Howard Wolowitz",
                email: "howard.wolowitz@company.com",
                role: "QA Automation Lead",
                team: "quality_engineering",
                years_of_experience: 10,
                skills: ["Test Automation", "Playwright", "API Testing", "CI/CD"],
                expertise: { "Test Automation": 0.95, "Quality Engineering": 0.90 },
                availability: "partially_available",
                free_slots_per_week: 15,
                past_performance_score: 0.93,
                jira_account_id: "jira-edt-001"
            },
            {
                employee_id: "EDT002",
                name: "Amy Farrah Fowler",
                email: "amy.fowler@company.com",
                role: "Technical Support Engineer",
                team: "quality_engineering",
                years_of_experience: 3,
                skills: ["Debugging", "Python", "SQL", "Technical Documentation"],
                expertise: { "Debugging": 0.88, "Technical Documentation": 0.85 },
                availability: "available",
                free_slots_per_week: 25,
                past_performance_score: 0.89,
                jira_account_id: "jira-edt-002"
            }
        ];

        await User.insertMany(users);
        console.log(`Seeded ${users.length} users successfully.`);

        // Seed Tasks
        const tasks = [
            {
                task_id: "TASK-001",
                title: "Setup React Project",
                description: "Initialize the frontend repo with React, Typescript and Vite",
                role_required: "Senior Frontend Developer",
                priority: "high",
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
                estimated_hours: 8,
                status: "pending",
                jira_issue_key: "PROJ-1"
            },
            {
                task_id: "TASK-002",
                title: "Design Database Schema",
                description: "Create MongoDB schemas for Users and Tasks",
                role_required: "Backend Engineer",
                priority: "high",
                deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                estimated_hours: 6,
                status: "pending",
                jira_issue_key: "PROJ-2"
            },
             {
                task_id: "TASK-003",
                title: "Design Data Ingestion Pipeline",
                description: "Build a fault-tolerant Python and Spark pipeline for ingesting application telemetry.",
                role_required: "Data Engineering Lead",
                priority: "medium",
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                estimated_hours: 16,
                status: "pending",
                jira_issue_key: "PROJ-3"
            },
            {
                task_id: "TASK-004",
                title: "Optimize API Performance",
                description: "Identify bottlenecks in the legacy API and improve response times by 30%",
                role_required: "Backend Engineer",
                priority: "medium",
                deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                estimated_hours: 12,
                status: "pending",
                jira_issue_key: "PROJ-4"
            },
            {
                task_id: "TASK-005",
                title: "Implement API Security Tests",
                description: "Create automated OWASP-focused tests for authentication, authorization, and input validation.",
                role_required: "Security Engineer",
                priority: "low",
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                estimated_hours: 4,
                status: "pending",
                jira_issue_key: "PROJ-5"
            },
            {
                task_id: "TASK-006",
                title: "Build End-to-End Regression Suite",
                description: "Add Playwright coverage for the critical employee allocation and reporting workflows.",
                role_required: "QA Automation Lead",
                priority: "medium",
                deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                estimated_hours: 24,
                status: "pending",
                jira_issue_key: "PROJ-6"
            },
            {
                task_id: "TASK-007",
                title: "Security Audit",
                description: "Review current infrastructure for security vulnerabilities.",
                role_required: "DevOps Engineer",
                priority: "high",
                deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                estimated_hours: 16,
                status: "pending",
                jira_issue_key: "PROJ-7"
            },
             {
                task_id: "TASK-008",
                title: "Instrument Service Observability",
                description: "Add structured logging, metrics, and distributed tracing to the core backend services.",
                role_required: "Site Reliability Engineer",
                priority: "low",
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                estimated_hours: 8,
                status: "pending",
                jira_issue_key: "PROJ-8"
            }
        ];

        await Task.insertMany(tasks);
        console.log(`Seeded ${tasks.length} tasks successfully.`);

        mongoose.disconnect();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
