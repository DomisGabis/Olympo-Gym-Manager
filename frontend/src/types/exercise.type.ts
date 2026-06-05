export type ExerciseCategory = 'Nogi' | 'Klatka piersiowa' | 'Plecy' | 'Brzuch';
export type MusclePart = 'Czworogłowy ud' | 'Triceps' | 'Biceps';
export type ExerciseDifficultyLevel = 'Niski' | 'Średni' | 'Wysoki';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleParts: MusclePart[];
  level: ExerciseDifficultyLevel;
  videoUrl?: string;
  description?: string;
  createdAt: string;
}

// export type CreateUserData = Omit<User, 'id' | 'createdAt'>;