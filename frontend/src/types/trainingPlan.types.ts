export interface TrainingPlanEntry {
  id?: string;
  trainingPlanId?: string;
  exerciseId: string;
  dayOfWeek: string;
  setsCount: number;
  repsRange: string;
  weight: number | null;
  isCompleted?: boolean;
}

export interface TrainingPlan {
  id: string;
  name?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  progress?: number;
  entries: TrainingPlanEntry[];
}