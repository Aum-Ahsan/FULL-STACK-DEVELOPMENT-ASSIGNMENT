import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, LayoutDashboard, ListTodo, LogOut, Sun, Moon } from 'lucide-react';
import './Layout.css';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <div className="layout">
            <nav className="navbar glass-morphism">
                <div className="logo">
                    <CheckCircle2 size={24} />
                    <span>My Tracker</span>
                </div>

                {user && (
                    <div className="nav-links">
                        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <LayoutDashboard size={18} />
                                Dashboard
                            </div>
                        </NavLink>
                        <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <ListTodo size={18} />
                                Tasks
                            </div>
                        </NavLink>
                    </div>
                )}

                <div className="user-info">
                    <button onClick={toggleTheme} className="theme-toggle" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {user ? (
                        <>
                            <span className="text-secondary user-email">{user.email}</span>
                            <button onClick={handleLogout} className="btn-logout" title="Logout">
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <div className="nav-links">
                            <NavLink to="/login" className="nav-link">Login</NavLink>
                            <NavLink to="/register" className="nav-link">Register</NavLink>
                        </div>
                    )}
                </div>
            </nav>

            <main className="main-content container fade-in">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
