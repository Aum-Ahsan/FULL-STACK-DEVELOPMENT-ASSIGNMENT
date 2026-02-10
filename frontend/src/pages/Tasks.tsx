import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Plus, Play, Square, Check, Trash2, Edit2, Clock, Search, Filter, ArrowUpDown, Download, Tag } from 'lucide-react';
import './Tasks.css';

interface Task {
    id: string;
    title: string;
    description: string;
    status: 'incomplete' | 'completed';
    priority: 'low' | 'medium' | 'high';
    category: string;
    totalTimeSpent: number;
    createdAt: string;
}

const Tasks: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTimerTask, setActiveTimerTask] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Search and Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'incomplete' | 'completed'>('all');
    const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
    const [sortBy, setSortBy] = useState<'createdAt' | 'totalTimeSpent' | 'priority'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Create/Edit task state
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        category: ''
    });

    const fetchTasks = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/tasks`);
            setTasks(response.data);
        } catch (err) {
            console.error('Failed to fetch tasks', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchActiveTimer = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/tasks/active-timer`);
            if (response.data) {
                setActiveTimerTask(response.data.taskId);
                const startTime = new Date(response.data.startTime).getTime();
                const now = new Date().getTime();
                setElapsedSeconds(Math.floor((now - startTime) / 1000));
            }
        } catch (err) {
            console.error('Failed to fetch active timer', err);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
        fetchActiveTimer();
    }, [fetchTasks, fetchActiveTimer]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeTimerTask) {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        } else {
            setElapsedSeconds(0);
        }
        return () => clearInterval(interval);
    }, [activeTimerTask]);

    const handleOpenModal = (task?: Task) => {
        if (task) {
            setEditingTask(task);
            setTaskForm({
                title: task.title,
                description: task.description || '',
                priority: task.priority,
                category: task.category || ''
            });
        } else {
            setEditingTask(null);
            setTaskForm({
                title: '',
                description: '',
                priority: 'medium',
                category: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmitTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTask) {
                await axios.patch(`${import.meta.env.VITE_API_URL}/tasks/${editingTask.id}`, taskForm);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/tasks`, taskForm);
            }
            setShowModal(false);
            fetchTasks();
        } catch (err) {
            console.error('Failed to save task', err);
        }
    };

    const handleToggleComplete = async (task: Task) => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/tasks/${task.id}`, {
                status: task.status === 'completed' ? 'incomplete' : 'completed',
            });
            fetchTasks();
        } catch (err) {
            console.error('Failed to update task', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${id}`);
                fetchTasks();
            } catch (err) {
                console.error('Failed to delete task', err);
            }
        }
    };

    const handleStartTimer = async (id: string) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/tasks/${id}/start-timer`);
            setActiveTimerTask(id);
            setElapsedSeconds(0);
        } catch (err: unknown) {
            const message = (err as any).response?.data?.message || 'Failed to start timer';
            alert(message);
        }
    };

    const handleStopTimer = async (id: string) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/tasks/${id}/stop-timer`);
            setActiveTimerTask(null);
            setElapsedSeconds(0);
            fetchTasks();
        } catch (err) {
            console.error('Failed to stop timer', err);
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const exportToCSV = () => {
        const headers = ['Title', 'Description', 'Category', 'Status', 'Priority', 'Time Spent (s)', 'Created At'];
        const csvContent = [
            headers.join(','),
            ...tasks.map(t => [
                `"${t.title.replace(/"/g, '""')}"`,
                `"${(t.description || '').replace(/"/g, '""')}"`,
                `"${(t.category || '').replace(/"/g, '""')}"`,
                t.status,
                t.priority,
                t.totalTimeSpent,
                t.createdAt
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `tasks_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredAndSortedTasks = useMemo(() => {
        return tasks
            .filter(task => {
                const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (task.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (task.category || '').toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
                const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
                return matchesSearch && matchesStatus && matchesPriority;
            })
            .sort((a, b) => {
                let comparison = 0;
                if (sortBy === 'createdAt') {
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                } else if (sortBy === 'totalTimeSpent') {
                    comparison = a.totalTimeSpent - b.totalTimeSpent;
                } else if (sortBy === 'priority') {
                    const priorityMap = { low: 1, medium: 2, high: 3 };
                    comparison = priorityMap[a.priority] - priorityMap[b.priority];
                }
                return sortOrder === 'desc' ? -comparison : comparison;
            });
    }, [tasks, searchQuery, filterStatus, filterPriority, sortBy, sortOrder]);

    if (loading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="tasks-page fade-in">
            <header className="tasks-header">
                <div>
                    <h1>Your Tasks</h1>
                    <p className="text-secondary">Manage your daily goals and track time</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={exportToCSV}>
                        <Download size={18} />
                        Export CSV
                    </button>
                    <button className="btn-add-task" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        Add Task
                    </button>
                </div>
            </header>

            <div className="controls-section glass-morphism">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search tasks, categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filters">
                    <div className="filter-group">
                        <Filter size={16} />
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as 'all' | 'incomplete' | 'completed')}>
                            <option value="all">All Status</option>
                            <option value="incomplete">Incomplete</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <Tag size={16} />
                        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as 'all' | 'low' | 'medium' | 'high')}>
                            <option value="all">All Priority</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <ArrowUpDown size={16} />
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'totalTimeSpent' | 'priority')}>
                            <option value="createdAt">Date Created</option>
                            <option value="totalTimeSpent">Time Spent</option>
                            <option value="priority">Priority</option>
                        </select>
                        <button
                            className="sort-order-btn"
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="tasks-grid">
                {filteredAndSortedTasks.length > 0 ? (
                    filteredAndSortedTasks.map((task) => (
                        <div key={task.id} className={`task-card glass-morphism ${task.status === 'completed' ? 'completed' : ''}`}>
                            <div className="task-card-header">
                                <div className="task-badges">
                                    <span className={`task-badge badge-${task.priority}`}>{task.priority}</span>
                                    <span className={`task-badge badge-${task.status}`}>{task.status}</span>
                                    {task.category && <span className="task-badge category-badge">{task.category}</span>}
                                </div>
                                <div className="task-card-actions">
                                    <button onClick={() => handleOpenModal(task)} className="btn-icon">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleToggleComplete(task)} className={`btn-icon ${task.status === 'completed' ? 'active' : ''}`}>
                                        <Check size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(task.id)} className="btn-icon delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="task-info">
                                <h3 className={task.status === 'completed' ? 'text-strikethrough' : ''}>{task.title}</h3>
                                <p className="task-desc">{task.description}</p>
                            </div>

                            <div className="task-actions">
                                <div className="time-display">
                                    <Clock size={16} />
                                    <span>{formatTime(task.id === activeTimerTask ? task.totalTimeSpent + elapsedSeconds : task.totalTimeSpent)}</span>
                                </div>

                                <div className="timer-controls">
                                    {activeTimerTask === task.id ? (
                                        <button className="btn-timer btn-stop pulse" onClick={() => handleStopTimer(task.id)}>
                                            <Square size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            className="btn-timer btn-start"
                                            onClick={() => handleStartTimer(task.id)}
                                            disabled={activeTimerTask !== null || task.status === 'completed'}
                                        >
                                            <Play size={16} fill="currentColor" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state glass-morphism">
                        <p>No tasks found. Try changing your filters or add a new task!</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content glass-morphism" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
                        <form className="task-form" onSubmit={handleSubmitTask}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                    placeholder="What needs to be done?"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <input
                                    value={taskForm.category}
                                    onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                                    placeholder="e.g. Work, Personal, Fitness"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                    placeholder="Add more details..."
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Priority</label>
                                    <select
                                        value={taskForm.priority}
                                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">{editingTask ? 'Save Changes' : 'Create Task'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;

