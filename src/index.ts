import {
  on,
  printConsole,
  browser,
  settings,
  once,
  Game,
  Actor,
} from "skyrimPlatform";
import { htmlEscaper, htmlEscapes, CombatActor } from "./distance-event.model";
import {
  getActorFromFormId,
  getDistanceFromActor,
  isAlive,
  isDetectedBy,
  isHostileToPlayer,
  isInCombat,
  isInCombatWithPlayer,
  isInRange,
  isNotPlayerTeammate,
  isPlayerTeammate,
  sendZoneChangeEvent,
} from "./distance-event.helpers";

export const UPDATE_COUNTER = settings["distance-event"]["framesPerUpdate"];

export const ENABLE_FOLLOWERS = settings["distance-event"]["enableFollowers"];

let combatActorList: CombatActor[] = [];
let followerList: CombatActor[] = [];
let counter: number = 0;

on("consoleMessage", (e: any) => {
  const msg = e.message.replace(
    htmlEscaper,
    (match: any) => htmlEscapes[match]
  );
  browser.executeJavaScript('console.table("' + msg + '")');
});

on("combatState", (event) => {
  if (event.actor) {
    const combatActorFormId = event.actor.getFormID();
    const isUnique = combatActorList.every(
      (combatActor) => combatActor.formId !== combatActorFormId
    );
    const isUniqueFollower = followerList.every(
      (follower) => follower.formId !== combatActorFormId
    );

    // collect followers in combat state
    if (
      isPlayerTeammate({
        formId: combatActorFormId,
      }) &&
      isUniqueFollower
    ) {
      followerList.push({
        formId: combatActorFormId,
        distance: getDistanceFromActor(
          Game.getPlayer()?.getFormID() as number,
          combatActorFormId
        ),
      });
      return;
    }

    // collect all other actors
    if (combatActorFormId && isUnique) {
      combatActorList.push({
        formId: combatActorFormId,
        distance: getDistanceFromActor(
          Game.getPlayer()?.getFormID() as number,
          combatActorFormId
        ),
      });
    }
  }
});

once("update", () => {
  printConsole("DBC - script intialized");
});

on("update", () => {
  counter++;
  if (counter === UPDATE_COUNTER) {
    // filter out dead actors
    combatActorList = combatActorList.filter(isAlive);
    // send events for player

    combatActorList
      .filter(isDetectedBy)
      .filter(isHostileToPlayer)
      .filter(isInRange)
      .filter(isInCombatWithPlayer)
      .filter(isNotPlayerTeammate)
      .forEach((combatActor) => {
        const currentDistance = getDistanceFromActor(
          combatActor.formId,
          Game.getPlayer()?.getFormID() as number
        ) as number;
        sendZoneChangeEvent(
          combatActor.formId,
          Game.getPlayer()?.getFormID() as number,
          combatActor.distance as number,
          currentDistance
        );
        combatActor.distance = currentDistance;
      });

    // send events for followers
    if (ENABLE_FOLLOWERS === true) {
      followerList.forEach((combatActor) => {
        const follower = getActorFromFormId(combatActor.formId);
        const combatTarget = follower.getCombatTarget() as Actor;
        if (!combatTarget || combatTarget === Game.getPlayer()) return;
        const combatTargetFrmId = combatTarget.getFormID() as number;
        const currentDistance = getDistanceFromActor(
          combatActor.formId as number,
          combatTargetFrmId
        ) as number;
        sendZoneChangeEvent(
          combatActor.formId as number,
          combatTargetFrmId,
          combatActor.distance as number,
          currentDistance
        );
        sendZoneChangeEvent(
          combatTargetFrmId,
          combatActor.formId as number,
          combatActor.distance as number,
          currentDistance
        );
        combatActor.distance = currentDistance;
      });
    }

    counter = 0;
  }
});
