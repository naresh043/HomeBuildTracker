export const CONSTRUCTION_STAGE_STATUS = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  ON_HOLD: "ON_HOLD",
} as const;

export type ConstructionStageStatus =
  (typeof CONSTRUCTION_STAGE_STATUS)[keyof typeof CONSTRUCTION_STAGE_STATUS];

export interface ConstructionStage {
  _id: string;
  name: string;
  description?: string;
  status: ConstructionStageStatus;
  order: number;
  startDate?: string;
  completionDate?: string;
  notes?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConstructionStagesResponse {
  success: boolean;
  message: string;
  data: ConstructionStage[];
}

export interface ConstructionStageResponse {
  success: boolean;
  message: string;
  data: ConstructionStage;
}

export interface CreateStageRequest {
  name: string;
  description?: string;
  status: ConstructionStageStatus;
  order: number;
  startDate?: string;
  completionDate?: string;
  notes?: string;
}

export interface UpdateStageRequest {
  name?: string;
  status?: ConstructionStageStatus;
  startDate?: string;
  completionDate?: string;
  notes?: string;
}

export interface ReorderStagesRequest {
  stageIds: string[];
}