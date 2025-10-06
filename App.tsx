
import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Planner from './components/Planner';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { SunIcon, MoonIcon, ClipboardListIcon, LayoutDashboardIcon, SettingsIcon } from './components/ui/Icons';
import { Theme } from './types';

const Header: React.FC = () => {
    const activeLinkStyle = {
        background: 'rgba(0, 239, 255, 0.1)',
        boxShadow: '0 0 15px rgba(0, 239, 255, 0.4)',
        color: '#00EFFF'
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 dark:bg-black/20 backdrop-blur-lg border-b border-white/20">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="font-bold text-xl text-brand-cyan-500 tracking-wider">
                            NEET Futura
                        </span>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <NavLink
                            to="/"
                            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-brand-cyan-400 transition-all duration-300"
                            style={({ isActive }) => isActive ? activeLinkStyle : {}}
                        >
                           <ClipboardListIcon className="w-5 h-5 mr-2" /> Planner
                        </NavLink>
                        <NavLink
                            to="/dashboard"
                            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-brand-cyan-400 transition-all duration-300"
                            style={({ isActive }) => isActive ? activeLinkStyle : {}}
                        >
                            <LayoutDashboardIcon className="w-5 h-5 mr-2" /> Dashboard
                        </NavLink>
                        <NavLink
                            to="/settings"
                            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-brand-cyan-400 transition-all duration-300"
                            style={({ isActive }) => isActive ? activeLinkStyle : {}}
                        >
                            <SettingsIcon className="w-5 h-5 mr-2" /> Settings
                        </NavLink>
                    </div>
                </div>
            </nav>
        </header>
    );
};


const ThemeToggle: React.FC<{ theme: Theme, toggleTheme: () => void }> = ({ theme, toggleTheme }) => (
    <button
        onClick={toggleTheme}
        className="fixed bottom-5 right-5 z-50 w-12 h-12 bg-white/20 dark:bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-brand-cyan-500 shadow-glow-cyan hover:shadow-glow-cyan-light transition-all duration-300"
        aria-label="Toggle theme"
    >
        {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
    </button>
);


const App: React.FC = () => {
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    return (
        <div className="min-h-screen text-gray-800 dark:text-gray-200 font-sans transition-colors duration-500">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-brand-blue-900 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <Routes>
                    <Route path="/" element={<Planner />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </main>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
    );
}

export default App;
