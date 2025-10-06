export type SubjectName = 'Physics' | 'Chemistry' | 'Botany' | 'Zoology';
export type TaskType = 'Study' | 'Revision' | 'Practice';
export type TaskStatus = 'Pending' | 'Completed';
export type Theme = 'light' | 'dark';

export interface Task {
  id: string;
  subject: SubjectName;
  chapter: string;
  microtopic: string;
  taskType: TaskType;
  date: string; // YYYY-MM-DD
  status: TaskStatus;
  difficulty?: number; // 1-5
  totalQuestions?: number;
  correctAnswers?: number;
}

export type Syllabus = {
  [key in SubjectName]: {
    [chapter: string]: string[];
  };
};

export interface MicrotopicStats {
  total: number;
  completed: number;
  completionRate: number;
  avgDifficulty: number;
  avgAccuracy: number;
  difficulties: number[];
  accuracies: number[];
}

export interface ChapterStats {
  total: number;
  completed: number;
  completionRate: number;
  avgDifficulty: number;
  avgAccuracy: number;
  difficulties: number[];
  accuracies: number[];
  microtopics: {
    [microtopic: string]: MicrotopicStats;
  };
}

export interface SubjectStats {
  total: number;
  completed: number;
  completionRate: number;
  avgDifficulty: number;
  avgAccuracy: number;
  difficulties: number[];
  accuracies: number[];
  chapters: {
    [chapter: string]: ChapterStats;
  };
}

export interface ProgressStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  subjects: {
    [key in SubjectName]: SubjectStats;
  };
}
