
import React, { useRef } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Task } from '../types';
import { cn } from '../lib/utils';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={cn("bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 rounded-lg shadow-lg p-6 animate-fadeIn", className)}>
        {children}
    </div>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ children, className, variant = 'primary', ...props }) => {
    const baseClasses = "px-4 py-2 rounded-md font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClasses = {
        primary: "bg-brand-cyan-500 text-brand-blue-900 hover:bg-brand-cyan-400 shadow-glow-cyan-light hover:shadow-glow-cyan",
        secondary: "bg-white/20 hover:bg-white/30 text-white",
        danger: "bg-red-500/80 hover:bg-red-500 text-white"
    };
    return <button className={cn(baseClasses, variantClasses[variant], className)} {...props}>{children}</button>;
};

const Settings: React.FC = () => {
    const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleReset = () => {
        if (window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
            setTasks([]);
            alert('All data has been reset.');
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.download = `neet-futura-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const importedTasks = JSON.parse(text);
                    // Basic validation
                    if (Array.isArray(importedTasks) && (importedTasks.length === 0 || 'id' in importedTasks[0])) {
                        if (window.confirm(`This will overwrite your current data with ${importedTasks.length} tasks. Continue?`)) {
                            setTasks(importedTasks);
                            alert('Data imported successfully!');
                        }
                    } else {
                        throw new Error('Invalid file format.');
                    }
                }
            } catch (error) {
                alert('Failed to import data. Please check the file format.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
        // Reset file input
        event.target.value = '';
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-brand-cyan-400 mb-8">Settings</h1>
            
            <Card className="mb-8">
                <h2 className="text-xl font-semibold text-brand-cyan-500 mb-2">Data Management</h2>
                <p className="text-gray-400 mb-6">Backup your data or start fresh.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleExport} variant="secondary" disabled={tasks.length === 0}>
                        Export Data
                    </Button>
                    <Button onClick={handleImportClick} variant="secondary">
                        Import Data
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        className="hidden"
                        accept="application/json"
                    />
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-semibold text-red-400 mb-2">Danger Zone</h2>
                <p className="text-gray-400 mb-6">This action is irreversible. Please be certain.</p>
                <Button onClick={handleReset} variant="danger">
                    Reset All Data
                </Button>
            </Card>
        </div>
    );
};

export default Settings;
