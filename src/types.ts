export const FieldList = {
  riderName: "Rider name",
  requestId: "Proximity request ID",
  acceptanceId: "Tent acceptance ID",
  hasMedicalDevice: "Medical device",

}

export type FieldMap = {
  [p in keyof typeof FieldList]?: number
}

export type AppState = 'preProcess' | 'processing' | 'complete'