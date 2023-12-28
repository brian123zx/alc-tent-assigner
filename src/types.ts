export const FieldList = {
  requestId: "Proximity request ID",
  acceptanceId: "Tent acceptance ID",
  hasMedicalDevice: "Medical device",
};

export type FieldMap = {
  [p in keyof typeof FieldList]: number;
};
export type MaybeFieldMap = {
  [p in keyof typeof FieldList]?: number;
};

export type AppState = "preProcess" | "processing" | "complete";

export type WorkerData = {
  csv: Papa.ParseResult<Record<string, string>>;
  fields: FieldMap;
  numCols: number;
};

export const TENT_ID_FIELD = 'Tent ID'