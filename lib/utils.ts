import { Task, ProgressStats, SubjectName, ChapterStats, MicrotopicStats, SubjectStats } from "../types";
import { syllabus } from "../data/syllabus";

export function cn(...inputs: (string | undefined | null | false)[]): string {
    return inputs.filter(Boolean).join(' ');
}

// Helper function to create an empty stats object
const createEmptyStats = () => ({
  total: 0,
  completed: 0,
  completionRate: 0,
  avgDifficulty: 0,
  avgAccuracy: 0,
  difficulties: [],
  accuracies: []
});

export function calculateProgress(tasks: Task[]): ProgressStats {
  // Initialize the stats object with the full syllabus structure
  const initialSubjects: { [key in SubjectName]: SubjectStats } = {
    Physics: { ...createEmptyStats(), chapters: {} },
    Chemistry: { ...createEmptyStats(), chapters: {} },
    Botany: { ...createEmptyStats(), chapters: {} },
    Zoology: { ...createEmptyStats(), chapters: {} },
  };

  const stats: ProgressStats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'Completed').length,
    completionRate: 0,
    subjects: initialSubjects
  };

  // Populate the structure based on the syllabus
  (Object.keys(syllabus) as SubjectName[]).forEach(subjectName => {
    stats.subjects[subjectName].chapters = Object.keys(syllabus[subjectName]).reduce((acc, chapterName) => {
      acc[chapterName] = {
        ...createEmptyStats(),
        microtopics: syllabus[subjectName][chapterName].reduce((mAcc, microtopicName) => {
          mAcc[microtopicName] = createEmptyStats() as MicrotopicStats;
          return mAcc;
        }, {} as { [key: string]: MicrotopicStats })
      };
      return acc;
    }, {} as { [key: string]: ChapterStats });
  });

  // Aggregate data from tasks
  tasks.forEach(task => {
    const subject = stats.subjects[task.subject];
    const chapter = subject.chapters[task.chapter];
    const microtopic = chapter?.microtopics[task.microtopic];

    if (!subject || !chapter || !microtopic) return;

    // Increment total counts
    subject.total++;
    chapter.total++;
    microtopic.total++;

    if (task.status === 'Completed') {
      subject.completed++;
      chapter.completed++;
      microtopic.completed++;
      
      if (task.difficulty) {
        subject.difficulties.push(task.difficulty);
        chapter.difficulties.push(task.difficulty);
        microtopic.difficulties.push(task.difficulty);
      }
      if (task.totalQuestions !== undefined && task.correctAnswers !== undefined && task.totalQuestions > 0) {
        const accuracy = (task.correctAnswers / task.totalQuestions) * 100;
        subject.accuracies.push(accuracy);
        chapter.accuracies.push(accuracy);
        microtopic.accuracies.push(accuracy);
      }
    }
  });

  // Calculate percentages and averages
  if (stats.totalTasks > 0) {
    stats.completionRate = (stats.completedTasks / stats.totalTasks) * 100;
  }
  
  Object.values(stats.subjects).forEach(subject => {
    // Process chapters
    Object.values(subject.chapters).forEach(chapter => {
      // Process microtopics
      Object.values(chapter.microtopics).forEach(microtopic => {
        if (microtopic.total > 0) {
          microtopic.completionRate = (microtopic.completed / microtopic.total) * 100;
        }
        if (microtopic.difficulties.length > 0) {
          microtopic.avgDifficulty = microtopic.difficulties.reduce((a, b) => a + b, 0) / microtopic.difficulties.length;
        }
        if (microtopic.accuracies.length > 0) {
          microtopic.avgAccuracy = microtopic.accuracies.reduce((a, b) => a + b, 0) / microtopic.accuracies.length;
        }
      });

      if (chapter.total > 0) {
        chapter.completionRate = (chapter.completed / chapter.total) * 100;
      }
      if (chapter.difficulties.length > 0) {
        chapter.avgDifficulty = chapter.difficulties.reduce((a, b) => a + b, 0) / chapter.difficulties.length;
      }
      if (chapter.accuracies.length > 0) {
        chapter.avgAccuracy = chapter.accuracies.reduce((a, b) => a + b, 0) / chapter.accuracies.length;
      }
    });

    if (subject.total > 0) {
      subject.completionRate = (subject.completed / subject.total) * 100;
    }
    if (subject.difficulties.length > 0) {
      subject.avgDifficulty = subject.difficulties.reduce((a, b) => a + b, 0) / subject.difficulties.length;
    }
    if (subject.accuracies.length > 0) {
      subject.avgAccuracy = subject.accuracies.reduce((a, b) => a + b, 0) / subject.accuracies.length;
    }
  });

  return stats;
}
