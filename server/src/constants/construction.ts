export const CONSTRUCTION_STAGE_STATUS = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  ON_HOLD: "ON_HOLD",
} as const;

export type ConstructionStageStatus =
  (typeof CONSTRUCTION_STAGE_STATUS)[keyof typeof CONSTRUCTION_STAGE_STATUS];

/*
=====================================================
DEFAULT CONSTRUCTION STAGES
=====================================================

These are initial/default stages only.

They are stored in MongoDB and can later be:
- renamed
- reordered
- completed
- put on hold
- extended with additional stages

The application must NOT depend on these names being
permanently fixed.
=====================================================
*/

export const DEFAULT_CONSTRUCTION_STAGES = [
  "Site Preparation",
  "Foundation",
  "Ground Floor Structure",
  "Walls",
  "Roof / Mould",
  "First Floor Rooms",
  "Electrical",
  "Plumbing",
  "Flooring / Tiles",
  "Doors & Windows",
  "Painting",
  "Final Works",
  "Completed",
] as const;