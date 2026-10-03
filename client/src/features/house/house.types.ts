export const HOUSE_STATUS = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

export type HouseStatus = (typeof HOUSE_STATUS)[keyof typeof HOUSE_STATUS];

export interface HouseRoom {
  name: string;
  _id: string;
}

export interface HouseFloor {
  name: string;
  rooms: HouseRoom[];
  _id: string;
}

export interface House {
  _id: string;
  singletonKey: string;
  name: string;
  startDate: string;
  status: HouseStatus;
  floors: HouseFloor[];
  budgetMin: number;
  budgetMax: number;
  createdAt: string;
  updatedAt: string;
}

export interface HouseResponse {
  success: boolean;
  message: string;
  data: House;
}

export interface InitializeHouseRequest {
  name: string;
  status: HouseStatus;
  startDate: string;
  budgetMinPaise?: number;
  budgetMaxPaise?: number;
}

export interface UpdateHouseRequest {
  name?: string;
  status?: HouseStatus;
  startDate?: string;
  budgetMin?: number;
  budgetMax?: number;
}

export interface UpdateCurrentStageRequest {
  stageId: string;
}
