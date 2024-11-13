import _ from "lodash";
import type { Tent, FieldNames } from './processCsv';
import { Grid } from "./processCsv";
/**
 * Assigns a team to the grid. Saves the tent ID to the rider record
 */
export const assignTeam = (team: Record<string, string>[], grid: Grid, fieldNames: FieldNames) => {
  console.log(`assigning ${team.length} rider(s)${fieldNames.requestId && ` to team ${team[0][fieldNames.requestId]}`}`)

  let tents: Tent[] = [];

  for (let i = 0; i < team.length; i++) {
    // Assign to last open tent, if acceptanceId matches and spot is open
    let tent = _.last(tents);

    // Assign rider to second bed in last existing tent if possible
    if (
      fieldNames.acceptanceId
      // bed 2 is empty
      && _.isUndefined(tent?.bed2)
      // acceptance IDs match
      && (tent?.bed1[fieldNames.acceptanceId] === team[i][fieldNames.acceptanceId])
      // bed 1 isn't part of a previous team
      && i !== 0
    ) {
      tent.bed2 = team[i];
      tent.isMedical = tent.isMedical || !!(fieldNames.hasMedicalDevice && team[i][fieldNames.hasMedicalDevice]);
      continue;
    }

    // Create a new tent and assign rider
    tents.push({
      bed1: team[i],
      isMedical: !!(fieldNames.hasMedicalDevice && team[i][fieldNames.hasMedicalDevice])
    });
    tent = _.last(tents);
  }

  // move medical tents
  let medicalTents = _.filter(tents, 'isMedical');
  tents = _.filter(tents, t => !t.isMedical);
  grid.placeTents(tents);
  grid.placeMedicalTents(medicalTents);
};