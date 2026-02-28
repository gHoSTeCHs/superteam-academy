export type ModuleType = 'text' | 'video' | 'assessment';

export interface Course {
  id: string;
  title: string;
  description: string;
  language: 'pt' | 'es' | 'en';
  thumbnail?: string;
  tags: string[];
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  type: ModuleType;
  sortOrder: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  xpReward: number;
  estimatedMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sortOrder: number;
}
