import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useLocalStorage from '../hooks/useLocalStorage';
import { Task, ProgressStats, SubjectName } from '../types';
import { calculateProgress } from '../lib/utils';
import { cn } from '../lib/utils';
import { ChevronDownIcon } from './ui/Icons';

const COLORS: Record<SubjectName, string> = {
    Physics: '#00EFFF', // cyan
    Chemistry: '#8884d8', // purple
    Botany: '#82ca9c', // green
    Zoology: '#ffc658' // yellow
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={cn("bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 rounded-lg shadow-lg p-6 animate-fadeIn", className)}>
        {children}
    </div>
);

const StatsCard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <Card>
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-brand-cyan-400 mt-2">{value}</p>
        <p className="text-gray-500 text-xs mt-1">{description}</p>
    </Card>
);


const SubjectCompletionChart: React.FC<{ stats: ProgressStats }> = ({ stats }) => {
    const data = Object.entries(stats.subjects).map(([name, data]) => ({
        name,
        value: data.completed,
    })).filter(item => item.value > 0);

    if (data.length === 0) return <Card className="flex items-center justify-center h-64"><p>No completed tasks to show.</p></Card>

    return (
        <Card>
            <h3 className="text-lg font-semibold text-brand-cyan-400 mb-4">Completed Tasks by Subject</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name as SubjectName]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid #0097A7' }} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
};


const PerformanceChart: React.FC<{ stats: ProgressStats }> = ({ stats }) => {
    const data = Object.entries(stats.subjects).map(([name, data]) => ({
        name,
        'Avg Difficulty': data.avgDifficulty.toFixed(2),
        'Avg Accuracy (%)': data.avgAccuracy.toFixed(2)
    }));

    return (
        <Card>
            <h3 className="text-lg font-semibold text-brand-cyan-400 mb-4">Performance by Subject</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid #0097A7' }} cursor={{ fill: 'rgba(0, 239, 255, 0.1)' }} />
                    <Legend />
                    <Bar dataKey="Avg Difficulty" fill="#8884d8" name="Avg Difficulty (1-5)" />
                    <Bar dataKey="Avg Accuracy (%)" fill="#82ca9c" name="Avg Accuracy (%)" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

const DetailedStatsTable: React.FC<{ stats: ProgressStats }> = ({ stats }) => {
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

    const toggleExpand = (key: string) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const hasData = (data: { total: number }) => data.total > 0;

    return (
        <Card>
            <h3 className="text-lg font-semibold text-brand-cyan-400 mb-4">Detailed Breakdown</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-white/20 text-xs uppercase text-gray-400">
                        <tr>
                            <th className="p-3">Topic</th>
                            <th className="p-3 text-center">Completed / Total</th>
                            <th className="p-3 text-center">Completion %</th>
                            <th className="p-3 text-center">Avg. Difficulty</th>
                            <th className="p-3 text-center">Avg. Accuracy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(stats.subjects).filter(([,data]) => hasData(data)).map(([subjectName, subjectData]) => (
                            <React.Fragment key={subjectName}>
                                <tr className="border-b border-white/10 bg-white/5 cursor-pointer hover:bg-white/10" onClick={() => toggleExpand(subjectName)}>
                                    <td className="p-3 font-semibold flex items-center gap-2" style={{ color: COLORS[subjectName as SubjectName] }}>
                                        <ChevronDownIcon className={cn("w-4 h-4 transition-transform", expanded[subjectName] ? 'rotate-180' : '')}/>
                                        {subjectName}
                                    </td>
                                    <td className="p-3 text-center">{subjectData.completed} / {subjectData.total}</td>
                                    <td className="p-3 text-center">{subjectData.completionRate.toFixed(1)}%</td>
                                    <td className="p-3 text-center">{subjectData.avgDifficulty > 0 ? subjectData.avgDifficulty.toFixed(2) : 'N/A'}</td>
                                    <td className="p-3 text-center">{subjectData.avgAccuracy > 0 ? `${subjectData.avgAccuracy.toFixed(1)}%` : 'N/A'}</td>
                                </tr>
                                {expanded[subjectName] && Object.entries(subjectData.chapters).filter(([,data]) => hasData(data)).map(([chapterName, chapterData]) => (
                                    <React.Fragment key={chapterName}>
                                        <tr className="border-b border-white/10 bg-black/10 cursor-pointer hover:bg-black/20" onClick={() => toggleExpand(`${subjectName}-${chapterName}`)}>
                                            <td className="p-3 pl-10 font-medium flex items-center gap-2">
                                                <ChevronDownIcon className={cn("w-4 h-4 transition-transform", expanded[`${subjectName}-${chapterName}`] ? 'rotate-180' : '')} />
                                                {chapterName}
                                            </td>
                                            <td className="p-3 text-center">{chapterData.completed} / {chapterData.total}</td>
                                            <td className="p-3 text-center">{chapterData.completionRate.toFixed(1)}%</td>
                                            <td className="p-3 text-center">{chapterData.avgDifficulty > 0 ? chapterData.avgDifficulty.toFixed(2) : 'N/A'}</td>
                                            <td className="p-3 text-center">{chapterData.avgAccuracy > 0 ? `${chapterData.avgAccuracy.toFixed(1)}%` : 'N/A'}</td>
                                        </tr>
                                        {expanded[`${subjectName}-${chapterName}`] && Object.entries(chapterData.microtopics).filter(([,data]) => hasData(data)).map(([microtopicName, microtopicData]) => (
                                             <tr key={microtopicName} className="bg-black/20 text-gray-400">
                                                 <td className="py-2 px-3 pl-16 text-xs">{microtopicName}</td>
                                                 <td className="py-2 px-3 text-center">{microtopicData.completed} / {microtopicData.total}</td>
                                                 <td className="py-2 px-3 text-center">{microtopicData.completionRate.toFixed(1)}%</td>
                                                 <td className="py-2 px-3 text-center">{microtopicData.avgDifficulty > 0 ? microtopicData.avgDifficulty.toFixed(2) : 'N/A'}</td>
                                                 <td className="py-2 px-3 text-center">{microtopicData.avgAccuracy > 0 ? `${microtopicData.avgAccuracy.toFixed(1)}%` : 'N/A'}</td>
                                             </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    )
};


const Dashboard: React.FC = () => {
    const [tasks] = useLocalStorage<Task[]>('tasks', []);
    const stats = useMemo(() => calculateProgress(tasks), [tasks]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-brand-cyan-400">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatsCard
                    title="Overall Completion"
                    value={`${stats.completionRate.toFixed(1)}%`}
                    description={`${stats.completedTasks} of ${stats.totalTasks} tasks completed`}
                />
                <StatsCard
                    title="Total Tasks Completed"
                    value={stats.completedTasks.toString()}
                    description="Keep up the great work!"
                />
                <StatsCard
                    title="Pending Tasks"
                    value={(stats.totalTasks - stats.completedTasks).toString()}
                    description="Tasks remaining on your plan"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SubjectCompletionChart stats={stats} />
                <PerformanceChart stats={stats} />
            </div>

            <div className="mt-8">
                <DetailedStatsTable stats={stats} />
            </div>
        </div>
    );
};

export default Dashboard;
