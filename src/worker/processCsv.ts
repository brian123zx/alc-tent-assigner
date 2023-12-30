/* eslint-disable no-restricted-globals */
import _ from "lodash";
import { FieldMap, TENT_ID_FIELD, WorkerData } from "../types";
import { assignTeam } from "./assignTeam";

export type Tent = {
  /**
   * The csv row object of the rider in bed 1
   */
  bed1: Record<string, string>;
  /**
   * The csv row object of the rider in bed 2
   */
  bed2?: Record<string, string>;
  /**
   * Whether one or more riders in this tent has a medical device
   */
  isMedical: boolean;
};

// type TentRow = {
//   numOpen: number,
//   tents: Tent[]
// }

export const idOf = (i: number): string => {
  return (
    (i >= 26 ? idOf(((i / 26) >> 0) - 1) : "") +
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[i % 26 >> 0]
  );
}

export class TentRow {
  rowId: string
  numOpen: number;
  tents: Tent[] = [];
  constructor(numTents: number, index: number) {
    this.numOpen = numTents;
    // Convert index to rowId
    this.rowId = idOf(index);
  }
}

export class Grid {
  rows: TentRow[] = [];
  medicalRows: TentRow[] = [];
  numTents: number;
  constructor(numTents: number) {
    this.numTents = numTents;
  }
  createRow = (group: TentRow[] = this.rows) => {
    group.push(new TentRow(this.numTents, group.length));
    return group[group.length - 1];
  }
  placeTents = (tents: Tent[]) => {
    // @ts-ignore
    let row: TentRow = _.find(this.rows, r => r.numOpen >= tents.length);
    if (!row) {
      row = this.createRow();
    }
    tents.forEach(t => {
      row.tents.push(t);
      row.numOpen -= 1;
      t.bed1[TENT_ID_FIELD] = `${row.rowId}${row.tents.length}`;
      if (t.bed2) t.bed2[TENT_ID_FIELD] = `${row.rowId}${row.tents.length}`;
      console.log(`Rider(s) assigned to ${t.bed1[TENT_ID_FIELD]}`)

    })
  }
  placeMedicalTents = (tents: Tent[]) => {
    for (let i = 0; i < tents.length; i++) {
      let row = _.find(this.medicalRows, r => r.numOpen >= 1);
      if (!row) {
        row = this.createRow(this.medicalRows);
      }
      row.tents.push(tents[i]);
      row.numOpen -= 1;
      tents[i].bed1[TENT_ID_FIELD] = `*${row.rowId}${row.tents.length}`;
      // @ts-ignore
      if (tents[i].bed2) tents[i].bed2[TENT_ID_FIELD] = `*${row.rowId}${row.tents.length}`;
      console.log(`Rider(s) assigned to ${tents[i].bed1[TENT_ID_FIELD]}`)

    }
  }
}

export type FieldNames = { [k in keyof FieldMap]: string }

export const sortFn = (fieldNames: FieldNames) => (a: Record<string, string>, b: Record<string, string>) => {
  // Coerce empty strings to a deep charcode character so they fall at the end of the sort
  const aReqId = a[fieldNames.requestId] || String.fromCharCode(100000);
  const bReqId = b[fieldNames.requestId] || String.fromCharCode(100000);
  const aAccId = a[fieldNames.acceptanceId] || String.fromCharCode(100000);
  const bAccId = b[fieldNames.acceptanceId] || String.fromCharCode(100000);
  return aReqId > bReqId
    ? 1
    : aReqId < bReqId
      ? -1
      : aAccId > bAccId
        ? 1
        : bAccId > aAccId
          ? -1
          : 0;
}

export const processCsv = (data: WorkerData) => {
  // setup grid datastore
  const tentRows = new Grid(data.numCols);

  const fieldNames = _.mapValues(data.fields, (fieldIndex) => {
    // @ts-expect-error fields really does exist
    return data.csv.meta.fields[fieldIndex];
  });

  const sortedData = data.csv.data.sort(
    sortFn(fieldNames)
  );

  let cur = 0;
  for (let i = 1; i < sortedData.length; i++) {
    const curRecord = sortedData[cur];
    const iRecord = sortedData[i];
    if (
      // iRecord[fieldNames.requestId] &&
      curRecord[fieldNames.requestId] === iRecord[fieldNames.requestId] && (curRecord[fieldNames.requestId] || i - cur < 2)
    ) {
      // Keep iterating until we find a new team
      continue;
    }

    // assign cur..i-1;
    assignTeam(sortedData.slice(cur, i), tentRows, fieldNames);
    // reset cur and continue
    cur = i;
  }
  // One last assignment
  assignTeam(sortedData.slice(cur), tentRows, fieldNames);
  return sortedData;
}



self.onmessage = (e: MessageEvent<WorkerData>) => {
  const config = e.data as WorkerData;
  console.log("worker data", config);

  const result = processCsv(config);

  // Return result
  self.postMessage(result);
};;