import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, CheckCircle, Clock, Calendar, PieChart as PieIcon, List } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './Dashboard.css';

interface CategoryData {
    name: string;
    value: number;
}

interface Stats {
    tasksCompletedToday: number;
    tasksCompletedThisWeek: number;
    totalSecondsToday: number;
    totalSecondsThisWeek: number;
    categoryDistribution: CategoryData[];
}

interface Task {
    id: string;
    title: string;
    status: 'incomplete' | 'completed';
    totalTimeSpent: number;
    category: string;
    priority: 'low' | 'medium' | 'high';
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#3b82f6'];

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, tasksRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/dashboard/stats`),
                    axios.get(`${import.meta.env.VITE_API_URL}/tasks`)
                ]);
                setStats(statsRes.data);
                setTasks(tasksRes.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatHours = (seconds: number) => {
        const hours = seconds / 3600;
        return hours.toFixed(1);
    };

    const formatTimeDetailed = (seconds: number) => {
        if (seconds === 0) return '0s';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        const parts = [];
        if (h > 0) parts.push(`${h}h`);
        if (m > 0) parts.push(`${m}m`);
        if (s > 0 || parts.length === 0) parts.push(`${s}s`);
        return parts.join(' ');
    };

    const formatTimeHms = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="dashboard fade-in">
            <header>
                <h1>Productivity Dashboard</h1>
                <p className="text-secondary">Summary of your tasks and performance</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card glass-morphism">
                    <div className="stat-header" style={{ color: 'var(--secondary)' }}>
                        <CheckCircle size={20} />
                        <span className="stat-tag">TODAY</span>
                    </div>
                    <div className="stat-body">
                        <div className="stat-value">{stats?.tasksCompletedToday || 0}</div>
                        <div className="stat-label">Tasks Completed</div>
                    </div>
                </div>

                <div className="stat-card glass-morphism">
                    <div className="stat-header" style={{ color: 'var(--primary)' }}>
                        <TrendingUp size={20} />
                        <span className="stat-tag">WEEKLY</span>
                    </div>
                    <div className="stat-body">
                        <div className="stat-value">{stats?.tasksCompletedThisWeek || 0}</div>
                        <div className="stat-label">Tasks Completed</div>
                    </div>
                </div>

                <div className="stat-card glass-morphism">
                    <div className="stat-header" style={{ color: 'var(--warning)' }}>
                        <Clock size={20} />
                        <span className="stat-tag">HOURS TODAY</span>
                    </div>
                    <div className="stat-body">
                        <div className="stat-value">{formatHours(stats?.totalSecondsToday || 0)}h</div>
                        <div className="stat-label">Time Focused</div>
                    </div>
                </div>

                <div className="stat-card glass-morphism">
                    <div className="stat-header" style={{ color: '#a855f7' }}>
                        <Calendar size={20} />
                        <span className="stat-tag">HOURS WEEKLY</span>
                    </div>
                    <div className="stat-body">
                        <div className="stat-value">{formatHours(stats?.totalSecondsThisWeek || 0)}h</div>
                        <div className="stat-label">Time Focused</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-main-content">
                <div className="dashboard-left">
                    <div className="tasks-summary-card glass-morphism">
                        <div className="section-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <List size={20} className="text-primary" />
                                <h3>Tasks Overview</h3>
                            </div>
                        </div>
                        <div className="tasks-table-container">
                            <table className="tasks-table">
                                <thead>
                                    <tr>
                                        <th>Task</th>
                                        <th>Status</th>
                                        <th>Time Spent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.length > 0 ? (
                                        tasks.map(task => (
                                            <tr key={task.id}>
                                                <td>
                                                    <div className="task-cell-info">
                                                        <span className="task-cell-title">{task.title}</span>
                                                        <span className="task-cell-category">{task.category || 'Uncategorized'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${task.status}`}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td className="time-cell">
                                                    <Clock size={14} />
                                                    {formatTimeHms(task.totalTimeSpent)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="empty-table">No tasks found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="dashboard-right">
                    <div className="chart-container glass-morphism">
                        <div className="section-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <PieIcon size={20} className="text-primary" />
                                <h3>Time Distribution</h3>
                            </div>
                        </div>
                        <div className="chart-wrapper">
                            {stats && stats.categoryDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={stats.categoryDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ cx = 0, cy = 0, midAngle = 0, outerRadius = 0, name, value, fill }) => {
                                                const RADIAN = Math.PI / 180;
                                                const radius = outerRadius * 1.2;
                                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                                return (
                                                    <text
                                                        x={x}
                                                        y={y}
                                                        fill={fill}
                                                        textAnchor={x > cx ? 'start' : 'end'}
                                                        dominantBaseline="central"
                                                        fontSize="10px"
                                                        fontWeight="600"
                                                    >
                                                        {`${name}`}
                                                    </text>
                                                );
                                            }}
                                        >
                                            {stats.categoryDistribution.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: any) => [formatTimeDetailed(Number(value) || 0), 'Time Spent']}
                                            contentStyle={{
                                                background: 'var(--bg-card)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '8px',
                                                color: 'var(--text-primary)'
                                            }}
                                            itemStyle={{ color: 'var(--text-primary)' }}
                                            labelStyle={{ color: 'var(--text-primary)' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-chart">
                                    <p>No data available yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="progress-section glass-morphism">
                        <div className="section-header">
                            <h3>Weekly Goals</h3>
                        </div>

                        <div className="progress-items">
                            <div className="progress-item">
                                <div className="progress-info">
                                    <span className="progress-label">Task Completion</span>
                                    <span className="progress-percent">{Math.min(100, Math.round(((stats?.tasksCompletedThisWeek || 0) / 10) * 100))}%</span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill" style={{ width: `${Math.min(100, ((stats?.tasksCompletedThisWeek || 0) / 10) * 100)}%` }}></div>
                                </div>
                            </div>

                            <div className="progress-item">
                                <div className="progress-info">
                                    <span className="progress-label">Focused Time</span>
                                    <span className="progress-percent">{Math.min(100, Math.round(((stats?.totalSecondsThisWeek || 0) / (40 * 3600)) * 100))}%</span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill purple" style={{ width: `${Math.min(100, ((stats?.totalSecondsThisWeek || 0) / (40 * 3600)) * 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

