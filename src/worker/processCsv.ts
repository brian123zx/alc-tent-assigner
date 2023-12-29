/* eslint-disable no-restricted-globals */
import _ from "lodash";
import { FieldMap, TENT_ID_FIELD, WorkerData } from "../types";

type Tent = {
  /**
   * The acceptance ID of the rider in bed 1
   */
  bed1?: string;
  /**
   * The acceptance ID of the rider in bed 2
   */
  bed2?: string;
};

// type TentRow = {
//   numOpen: number,
//   tents: Tent[]
// }

const idOf = (i: number): string => {
  return (
    (i >= 26 ? idOf(((i / 26) >> 0) - 1) : "") +
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[i % 26 >> 0]
  );
}

class TentRow {
  rowId: string
  numOpen: number;
  tents: Tent[] = [];
  constructor(numTents: number, index: number) {
    this.numOpen = numTents;
    // Convert index to rowId
    this.rowId = idOf(index);
  }
}

type FieldNames = { [k in keyof FieldMap]: string }

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

self.onmessage = (e: MessageEvent<WorkerData>) => {
  const config = e.data as WorkerData;
  console.log("worker data", config);

  // setup grid datastore
  const tentRows: TentRow[] = [new TentRow(config.numCols, 0)];

  const fieldNames = _.mapValues(config.fields, (fieldIndex) => {
    // @ts-expect-error fields really does exist
    return config.csv.meta.fields[fieldIndex];
  });

  const sortedData = config.csv.data.sort(
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
    assignTeam(sortedData.slice(cur, i), tentRows, fieldNames, config.numCols);
    // reset cur and continue
    cur = i;
  }
  // One last assignment
  assignTeam(sortedData.slice(cur), tentRows, fieldNames, config.numCols);

  // Return result
  self.postMessage(sortedData);
};

/**
 * Assigns a team to the grid. Saves the tent ID to the rider record
 */
const assignTeam = (team: Record<string, string>[], grid: TentRow[], fieldNames: FieldNames, numCols: number) => {
  console.log(`assigning ${team.length} rider(s) to team ${team[0][fieldNames.requestId]}`)

  // how many tents do I need?
  const numAssignments = _.uniqBy(_.filter(team, fieldNames.acceptanceId), r => {
    return r[fieldNames.acceptanceId]
  }).length;
  const numUnassigned = _.filter(team, _.matchesProperty(fieldNames.acceptanceId, '')).length;

  const numTentsNeeded = numAssignments + Math.ceil(numUnassigned / 2);

  const createRow = () => {
    grid.push(new TentRow(numCols, grid.length));
    return grid[grid.length - 1];
  }

  // Find row that can fit
  let row;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].numOpen >= numTentsNeeded) {
      row = grid[i];
      break;
    }
  }
  if (!row) {
    // Create a new row
    row = createRow();
  }

  for (let i = 0; i < team.length; i++) {
    // Assign to last open tent, if acceptanceId matches and spot is open
    let tent = _.last(row.tents);

    // Assign rider to second bed in last existing tent if possible
    if (
      // bed 2 is empty
      _.isUndefined(tent?.bed2)
      // acceptance IDs match
      && (tent?.bed1 === team[i][fieldNames.acceptanceId])
      // bed 1 isn't part of a previous team
      && i !== 0
    ) {
      tent.bed2 = team[i][fieldNames.acceptanceId];
      team[i][TENT_ID_FIELD] = `${row.rowId}${row.tents.length}`
      console.log(`Rider assigned to ${team[i][TENT_ID_FIELD]}`)
      continue;
    }

    // Create a new tent and assign rider
    row.tents.push({
      bed1: team[i][fieldNames.acceptanceId]
    });
    row.numOpen -= 1;
    team[i][TENT_ID_FIELD] = `${row.rowId}${row.tents.length}`
    console.log(`Rider assigned to ${team[i][TENT_ID_FIELD]}`)
  }
};

export { };
