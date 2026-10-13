"""
MongoDB Service - Business Data Queries with Resilient Fallback
Connects to MongoDB with fast timeout and provides rich mock fallback data
"""

from pymongo import MongoClient
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import os

MOCK_TEAM_MEMBERS = {
    'shweta': {
        'name': 'Shweta',
        'role': 'AWS Solutions Architect',
        'jira': {
            'total_tickets': 8,
            'completed': 6,
            'in_progress': 2,
            'tickets': [
                {'key': 'KAN-101', 'summary': 'Design VPC Multi-Tier Architecture', 'status': 'Done', 'priority': 'High'},
                {'key': 'KAN-102', 'summary': 'Setup IAM Least-Privilege Policies', 'status': 'Done', 'priority': 'Medium'},
                {'key': 'KAN-103', 'summary': 'CloudFront Distribution & WAF Setup', 'status': 'In Progress', 'priority': 'High'},
            ]
        },
        'github': {
            'total_commits': 48,
            'lines_added': 3240,
            'lines_deleted': 610,
            'total_lines_changed': 3850,
            'commits': [
                {'hash': 'a1b2c3d', 'message': 'feat: terraform AWS VPC module with public/private subnets'},
                {'hash': 'e4f5g6h', 'message': 'security: tighten S3 bucket policies and KMS encryption'}
            ]
        }
    },
    'maitri': {
        'name': 'Maitri',
        'role': 'AWS Backend Developer',
        'jira': {
            'total_tickets': 10,
            'completed': 7,
            'in_progress': 3,
            'tickets': [
                {'key': 'KAN-104', 'summary': 'Implement REST API Endpoints with FastAPI', 'status': 'Done', 'priority': 'High'},
                {'key': 'KAN-105', 'summary': 'Async Task Processing with Celery & SQS', 'status': 'In Progress', 'priority': 'High'},
                {'key': 'KAN-106', 'summary': 'JWT Authentication & Role Middleware', 'status': 'Done', 'priority': 'Critical'}
            ]
        },
        'github': {
            'total_commits': 62,
            'lines_added': 5120,
            'lines_deleted': 1240,
            'total_lines_changed': 6360,
            'commits': [
                {'hash': 'b2c3d4e', 'message': 'feat: add authentication middleware and token refresh'},
                {'hash': 'f5g6h7i', 'message': 'perf: optimize MongoDB aggregation pipelines for dashboard'}
            ]
        }
    },
    'ojasvi': {
        'name': 'Ojasvi',
        'role': 'AWS DevOps Engineer',
        'jira': {
            'total_tickets': 9,
            'completed': 8,
            'in_progress': 1,
            'tickets': [
                {'key': 'KAN-107', 'summary': 'Configure GitHub Actions CI/CD Pipeline', 'status': 'Done', 'priority': 'High'},
                {'key': 'KAN-108', 'summary': 'EKS Cluster Provisioning with Helm Charts', 'status': 'Done', 'priority': 'Critical'},
                {'key': 'KAN-109', 'summary': 'Prometheus & Grafana Monitoring Alerts', 'status': 'In Progress', 'priority': 'Medium'}
            ]
        },
        'github': {
            'total_commits': 41,
            'lines_added': 2890,
            'lines_deleted': 430,
            'total_lines_changed': 3320,
            'commits': [
                {'hash': 'c3d4e5f', 'message': 'ci: add lint, test and docker build workflow'},
                {'hash': 'g6h7i8j', 'message': 'infra: configure Kubernetes Horizontal Pod Autoscaler'}
            ]
        }
    },
    'riya': {
        'name': 'Riya',
        'role': 'AWS Cloud Engineer',
        'jira': {
            'total_tickets': 7,
            'completed': 5,
            'in_progress': 2,
            'tickets': [
                {'key': 'KAN-110', 'summary': 'RDS Aurora PostgreSQL Multi-AZ Setup', 'status': 'Done', 'priority': 'High'},
                {'key': 'KAN-111', 'summary': 'ElastiCache Redis Cluster Configuration', 'status': 'Done', 'priority': 'Medium'},
                {'key': 'KAN-112', 'summary': 'AWS Backup & Disaster Recovery Automation', 'status': 'In Progress', 'priority': 'High'}
            ]
        },
        'github': {
            'total_commits': 33,
            'lines_added': 1980,
            'lines_deleted': 310,
            'total_lines_changed': 2290,
            'commits': [
                {'hash': 'd4e5f6g', 'message': 'infra: Terraform scripts for Aurora Postgres multi-AZ'},
                {'hash': 'h7i8j9k', 'message': 'chore: Redis cache eviction policies and health checks'}
            ]
        }
    }
}


class MongoDBService:
    def __init__(self):
        self.connected = False
        self.client = None
        self.db = None
        
        mongo_uri = os.getenv('MONGODB_URI')
        if mongo_uri:
            try:
                self.client = MongoClient(
                    mongo_uri,
                    tlsAllowInvalidCertificates=True,
                    serverSelectionTimeoutMS=2000,
                    connectTimeoutMS=2000,
                    socketTimeoutMS=2000
                )
                # Quick ping to verify connectivity
                self.client.admin.command('ping')
                self.db = self.client['mern-app']
                self.jira_data = self.db['jira_all_data_Datathon']
                self.github_data = self.db['github_all_data_Datathon']
                self.tasks = self.db['tasks']
                self.users = self.db['users']
                self.projects = self.db['projects']
                self.connected = True
                print("MongoDB connected successfully.")
            except Exception as e:
                print(f"MongoDB connection notice: {e}. Using resilient mock data fallback.")
                self.connected = False
        else:
            print("MONGODB_URI not provided. Using mock data fallback.")

    def get_user_status(self, user_name: str) -> Optional[Dict[str, Any]]:
        """Get status for a specific user"""
        if self.connected and self.db is not None:
            try:
                jira_user = self.jira_data.find_one({'name': {'$regex': user_name, '$options': 'i'}})
                github_user = self.github_data.find_one({'name': {'$regex': user_name, '$options': 'i'}})
                user_tasks = list(self.tasks.find({'assignee_name': {'$regex': user_name, '$options': 'i'}}))
                if jira_user or github_user:
                    return {
                        'name': user_name,
                        'jira': jira_user,
                        'github': github_user,
                        'tasks': user_tasks
                    }
            except Exception as e:
                print(f"MongoDB error in get_user_status: {e}")

        # Fallback to mock data
        key = user_name.lower().strip()
        for member_key, member_data in MOCK_TEAM_MEMBERS.items():
            if member_key in key or key in member_key:
                return {
                    'name': member_data['name'],
                    'role': member_data['role'],
                    'jira': member_data['jira'],
                    'github': member_data['github'],
                    'tasks': member_data['jira']['tickets']
                }

        return None

    def get_team_performance(self, days: int = 7) -> Dict[str, Any]:
        """Get team performance metrics"""
        if self.connected and self.db is not None:
            try:
                contributors = list(self.github_data.find())
                all_tasks = list(self.tasks.find())
                if contributors or all_tasks:
                    total_commits = sum(c.get('total_commits', 0) for c in contributors)
                    total_lines_added = sum(c.get('total_lines_added', 0) for c in contributors)
                    total_lines_deleted = sum(c.get('total_lines_deleted', 0) for c in contributors)
                    completed_tasks = [t for t in all_tasks if t.get('status') in ['completed', 'Done']]
                    in_progress_tasks = [t for t in all_tasks if t.get('status') in ['in_progress', 'In Progress']]
                    pending_tasks = [t for t in all_tasks if t.get('status') in ['pending', 'To Do']]

                    return {
                        'total_commits': total_commits,
                        'total_lines_added': total_lines_added,
                        'total_lines_deleted': total_lines_deleted,
                        'total_lines_changed': total_lines_added + total_lines_deleted,
                        'top_contributors': sorted(contributors, key=lambda x: x.get('total_commits', 0), reverse=True)[:5],
                        'tasks': {
                            'completed': len(completed_tasks),
                            'in_progress': len(in_progress_tasks),
                            'pending': len(pending_tasks),
                            'total': len(all_tasks)
                        },
                        'completion_rate': len(completed_tasks) / len(all_tasks) * 100 if all_tasks else 76.0
                    }
            except Exception as e:
                print(f"MongoDB error in get_team_performance: {e}")

        # Fallback to calculated mock data
        total_commits = sum(m['github']['total_commits'] for m in MOCK_TEAM_MEMBERS.values())
        total_added = sum(m['github']['lines_added'] for m in MOCK_TEAM_MEMBERS.values())
        total_deleted = sum(m['github']['lines_deleted'] for m in MOCK_TEAM_MEMBERS.values())
        completed_tickets = sum(m['jira']['completed'] for m in MOCK_TEAM_MEMBERS.values())
        in_progress_tickets = sum(m['jira']['in_progress'] for m in MOCK_TEAM_MEMBERS.values())
        total_tickets = sum(m['jira']['total_tickets'] for m in MOCK_TEAM_MEMBERS.values())

        return {
            'total_commits': total_commits,
            'total_lines_added': total_added,
            'total_lines_deleted': total_deleted,
            'total_lines_changed': total_added + total_deleted,
            'top_contributors': [
                {'name': m['name'], 'role': m['role'], 'total_commits': m['github']['total_commits']}
                for m in sorted(MOCK_TEAM_MEMBERS.values(), key=lambda x: x['github']['total_commits'], reverse=True)
            ],
            'tasks': {
                'completed': completed_tickets,
                'in_progress': in_progress_tickets,
                'pending': total_tickets - (completed_tickets + in_progress_tickets),
                'total': total_tickets
            },
            'completion_rate': round((completed_tickets / total_tickets) * 100, 1) if total_tickets else 76.0
        }

    def get_project_health(self) -> Dict[str, Any]:
        """Get project health metrics"""
        perf = self.get_team_performance()
        tasks = perf.get('tasks', {})
        rate = perf.get('completion_rate', 0)

        return {
            'total_tasks': tasks.get('total', 0),
            'completed': tasks.get('completed', 0),
            'in_progress': tasks.get('in_progress', 0),
            'pending': tasks.get('pending', 0),
            'completion_percentage': rate,
            'overdue_count': 0,
            'overdue_tasks': [],
            'status': 'on_track' if rate >= 60 else 'at_risk' if tasks.get('total', 0) else 'unknown'
        }

    def get_blockers(self) -> List[Dict[str, Any]]:
        """Identify potential blockers"""
        if self.connected and self.db is not None:
            try:
                return list(self.tasks.find({
                    'status': {'$in': ['blocked', 'Blocked', 'blocked_by']}
                }, {'_id': 0}))
            except Exception as e:
                print(f"MongoDB error in get_blockers: {e}")
        return []

    def get_individual_contribution(self, user_name: str) -> Dict[str, Any]:
        """Get detailed contribution for a user"""
        status = self.get_user_status(user_name)
        if not status:
            return {'status': 'user_not_found'}

        return {
            'name': status.get('name', user_name),
            'role': status.get('role', 'Engineer'),
            'github': status.get('github', {}),
            'jira': status.get('jira', {})
        }

    def close(self):
        """Close MongoDB connection"""
        if self.client:
            try:
                self.client.close()
            except Exception:
                pass
