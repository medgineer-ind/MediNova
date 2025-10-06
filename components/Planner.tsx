
import React, { useState, useMemo } from 'react';
import { Task, TaskType, SubjectName } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { syllabus } from '../data/syllabus';
import { cn } from '../lib/utils';
import { PlusIcon, BookOpenIcon, RepeatIcon, TargetIcon, Trash2Icon } from './ui/Icons';

// --- Reusable UI Components ---

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={cn("bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 rounded-lg shadow-lg animate-fadeIn", className)}>
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

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, className, ...props }) => (
    <select {...props} className={cn("w-full bg-white/10 dark:bg-black/30 border border-white/20 rounded-md px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-cyan-500", className)}>
        {children}
    </select>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
     <input {...props} className={cn("w-full bg-white/10 dark:bg-black/30 border border-white/20 rounded-md px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-cyan-500", className)} />
);

// --- TaskForm Component ---

const TaskForm: React.FC<{ onAddTask: (task: Omit<Task, 'id' | 'status'>) => void }> = ({ onAddTask }) => {
    const [subject, setSubject] = useState<SubjectName>('Physics');
    const [chapter, setChapter] = useState<string>(Object.keys(syllabus.Physics)[0]);
    const [microtopic, setMicrotopic] = useState<string>(syllabus.Physics[Object.keys(syllabus.Physics)[0]][0]);
    const [taskType, setTaskType] = useState<TaskType>('Study');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSubject = e.target.value as SubjectName;
        setSubject(newSubject);
        const newChapter = Object.keys(syllabus[newSubject])[0];
        setChapter(newChapter);
        setMicrotopic(syllabus[newSubject][newChapter][0]);
    };

    const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newChapter = e.target.value;
        setChapter(newChapter);
        setMicrotopic(syllabus[subject][newChapter][0]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddTask({ subject, chapter, microtopic, taskType, date });
    };

    return (
        <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold text-brand-cyan-400 mb-4">Plan a New Task</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Subject</label>
                        <Select value={subject} onChange={handleSubjectChange}>{Object.keys(syllabus).map(s => <option key={s} value={s}>{s}</option>)}</Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Chapter</label>
                        <Select value={chapter} onChange={handleChapterChange}>{Object.keys(syllabus[subject]).map(c => <option key={c} value={c}>{c}</option>)}</Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Microtopic</label>
                        <Select value={microtopic} onChange={e => setMicrotopic(e.target.value)}>{syllabus[subject][chapter]?.map(m => <option key={m} value={m}>{m}</option>)}</Select>
                    </div>
                </div>
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Task Type</label>
                        <Select value={taskType} onChange={e => setTaskType(e.target.value as TaskType)}>
                            <option value="Study">Study</option>
                            <option value="Revision">Revision</option>
                            <option value="Practice">Practice</option>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div className="md:col-start-3 flex items-end">
                        <Button type="submit" className="w-full"><PlusIcon className="w-5 h-5"/> Add Task</Button>
                    </div>
                </div>
            </form>
        </Card>
    );
};

// --- TaskItem Component ---

const TaskItem: React.FC<{ task: Task; onUpdateTask: (task: Task) => void; onDeleteTask: (id: string) => void }> = ({ task, onUpdateTask, onDeleteTask }) => {
    const iconMap: Record<TaskType, React.ReactElement> = {
        Study: <BookOpenIcon className="w-5 h-5 text-brand-cyan-400" />,
        Revision: <RepeatIcon className="w-5 h-5 text-green-400" />,
        Practice: <TargetIcon className="w-5 h-5 text-purple-400" />,
    };

    return (
        <div className="p-4 bg-white/5 dark:bg-black/20 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
            <div className="flex items-center gap-4">
                {iconMap[task.taskType]}
                <div>
                    <p className="font-semibold">{task.microtopic}</p>
                    <p className="text-xs text-gray-400">{task.subject} &gt; {task.chapter}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
                 {task.status === 'Pending' ? (
                    <Button onClick={() => onUpdateTask(task)} variant="secondary" className="text-xs px-2 py-1">Complete</Button>
                ) : (
                    <span className="text-xs font-bold text-green-400 px-2 py-1 bg-green-500/20 rounded-full">Completed</span>
                )}
                <button onClick={() => onDeleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2Icon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// --- Modal Components ---

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={onClose}>
            <div className="bg-brand-blue-900/80 border border-brand-cyan-700 rounded-lg shadow-glow-cyan p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-brand-cyan-400 mb-4">{title}</h3>
                {children}
            </div>
        </div>
    );
};

const CompleteStudyModal: React.FC<{ task: Task | null; onComplete: (difficulty: number) => void; onClose: () => void }> = ({ task, onComplete, onClose }) => {
    const [difficulty, setDifficulty] = useState(3);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(difficulty);
    };

    return (
        <Modal isOpen={!!task} onClose={onClose} title={`Complete: ${task?.microtopic}`}>
            <form onSubmit={handleSubmit}>
                <label className="block mb-2">How difficult was this topic? (1: Easy - 5: Hard)</label>
                <div className="flex items-center gap-4 my-4">
                    <span>1</span>
                    <input type="range" min="1" max="5" value={difficulty} onChange={e => setDifficulty(Number(e.target.value))} className="w-full" />
                    <span>5</span>
                    <span className="font-bold text-brand-cyan-400 w-4">{difficulty}</span>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

const CompletePracticeModal: React.FC<{ task: Task | null; onComplete: (total: number, correct: number) => void; onClose: () => void }> = ({ task, onComplete, onClose }) => {
    const [total, setTotal] = useState('');
    const [correct, setCorrect] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const totalNum = Number(total);
        const correctNum = Number(correct);
        if (totalNum > 0 && correctNum <= totalNum && correctNum >= 0) {
            onComplete(totalNum, correctNum);
        }
    };

    return (
        <Modal isOpen={!!task} onClose={onClose} title={`Practice Feedback: ${task?.microtopic}`}>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-1">Total Questions Attempted</label>
                        <Input type="number" value={total} onChange={e => setTotal(e.target.value)} min="1" required />
                    </div>
                    <div>
                        <label className="block mb-1">Number of Correct Answers</label>
                        <Input type="number" value={correct} onChange={e => setCorrect(e.target.value)} min="0" max={total || undefined} required />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};


// --- Main Planner Component ---

const Planner: React.FC = () => {
    const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
    const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

    const addTask = (taskData: Omit<Task, 'id' | 'status'>) => {
        const newTask: Task = {
            ...taskData,
            id: crypto.randomUUID(),
            status: 'Pending',
        };
        setTasks(prevTasks => [...prevTasks, newTask].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    };

    const handleUpdateTask = (updatedTask: Task) => {
        if (updatedTask.status === 'Pending') {
            setTaskToComplete(updatedTask);
        }
    };
    
    const handleDeleteTask = (id: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            setTasks(tasks.filter(task => task.id !== id));
        }
    };

    const handleCompleteStudy = (difficulty: number) => {
        if (!taskToComplete) return;
        setTasks(tasks.map(t => t.id === taskToComplete.id ? { ...t, status: 'Completed', difficulty } : t));
        setTaskToComplete(null);
    };

    const handleCompletePractice = (total: number, correct: number) => {
        if (!taskToComplete) return;
        setTasks(tasks.map(t => t.id === taskToComplete.id ? { ...t, status: 'Completed', totalQuestions: total, correctAnswers: correct } : t));
        setTaskToComplete(null);
    };
    
    const groupedTasks = useMemo(() => {
        return tasks.reduce((acc, task) => {
            const date = new Date(task.date).toDateString();
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(task);
            return acc;
        }, {} as Record<string, Task[]>);
    }, [tasks]);

    return (
        <div>
            <TaskForm onAddTask={addTask} />

            <h2 className="text-2xl font-bold text-brand-cyan-400 mb-4">Your Plan</h2>
            {Object.keys(groupedTasks).length === 0 ? (
                 <Card className="p-6 text-center text-gray-400">
                    <p>Your planner is empty. Add a new task to get started!</p>
                 </Card>
            ) : (
                <div className="space-y-6">
                {Object.entries(groupedTasks).map(([date, dateTasks]) => (
                    <div key={date}>
                        <h3 className="font-semibold text-lg mb-2 border-b border-white/20 pb-1">{date}</h3>
                        <div className="space-y-2">
                           {dateTasks.map(task => (
                                <TaskItem key={task.id} task={task} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask}/>
                           ))}
                        </div>
                    </div>
                ))}
                </div>
            )}
            
            <CompleteStudyModal 
                task={taskToComplete && (taskToComplete.taskType === 'Study' || taskToComplete.taskType === 'Revision') ? taskToComplete : null}
                onComplete={handleCompleteStudy}
                onClose={() => setTaskToComplete(null)}
            />
            <CompletePracticeModal 
                task={taskToComplete && taskToComplete.taskType === 'Practice' ? taskToComplete : null}
                onComplete={handleCompletePractice}
                onClose={() => setTaskToComplete(null)}
            />
        </div>
    );
};

export default Planner;
