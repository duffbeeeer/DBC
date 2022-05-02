import {
  Actor,
  Debug,
  Game,
  ObjectReference,
  printConsole,
} from "@skyrim-platform/skyrim-platform";
import {
  CombatActor,
  ZonesAnimEvent,
  ZonesBorders,
} from "./distance-event.model";

export function isInRange(CombatActor: CombatActor): boolean {
  const distance = getDistanceFromActor(
    Game.getPlayer()?.getFormID() as number,
    CombatActor.formId
  ) as number;
  return distance < ZonesBorders.LONG_RANGE;
}

export function getDistanceFromActor(
  emitterFormId: number,
  receiverFormId: number
): number | undefined {
  const receiverActor = getActorFromFormId(receiverFormId);
  const emitterActor = getActorFromFormId(emitterFormId);
  return emitterActor.getDistance(receiverActor);
}

export function isAlive(CombatActor: CombatActor) {
  const actor = getActorFromFormId(CombatActor.formId);
  return !actor?.isDead();
}

export function getActorFromFormId(formId: number): Actor {
  const actorForm = Game.getFormEx(formId);
  const actor = Actor.from(actorForm);
  return actor as Actor;
}

export function getObjRefFromId(formId: number): ObjectReference {
  const objForm = Game.getFormEx(formId);
  return ObjectReference.from(objForm) as ObjectReference;
}

export function sendZoneChangeEvent(
  receiverFrmId: number,
  emitterFormId: number,
  previousDistance: number,
  currentDistance: number
) {
  const receiverActor = getActorFromFormId(receiverFrmId);
  const event = getZoneEvent(currentDistance, previousDistance);
  const emitterActor = getObjRefFromId(emitterFormId);

  if (event !== ZonesAnimEvent.NO_RANGE && receiverActor.hasLOS(emitterActor)) {
    if (!isPlayerInKillmove()) {
      Debug.sendAnimationEvent(receiverActor, event);
      Debug.sendAnimationEvent(receiverActor, event);
    }
  }
}

export function isHostileToPlayer(CombatActor: CombatActor): boolean {
  const actor = getActorFromFormId(CombatActor.formId) as Actor;
  const isHostile = actor?.isHostileToActor(Game.getPlayer()) as boolean;
  return isHostile;
}

export function getZoneEvent(
  currentDistance: number,
  previousDistance: number
): ZonesAnimEvent {
  if (
    currentDistance < ZonesBorders.CLOSE_RANGE &&
    previousDistance > ZonesBorders.CLOSE_RANGE
  ) {
    return ZonesAnimEvent.CLOSE_RANGE;
  }
  if (
    (currentDistance > ZonesBorders.CLOSE_RANGE &&
      previousDistance < ZonesBorders.CLOSE_RANGE) ||
    (currentDistance < ZonesBorders.MEDIUM_RANGE &&
      previousDistance > ZonesBorders.MEDIUM_RANGE)
  ) {
    return ZonesAnimEvent.MEDIUM_RANGE;
  }
  if (
    currentDistance > ZonesBorders.MEDIUM_RANGE &&
    previousDistance < ZonesBorders.MEDIUM_RANGE
  ) {
    return ZonesAnimEvent.LONG_RANGE;
  } else return ZonesAnimEvent.NO_RANGE;
}

export function isDetectedBy(CombatActor: CombatActor): boolean {
  const player = Game.getPlayer();
  const actor = getActorFromFormId(CombatActor.formId) as Actor;
  return player?.isDetectedBy(actor) as boolean;
}

export function isPlayerTeammate(CombatActor: CombatActor): boolean {
  const actor = getActorFromFormId(CombatActor.formId);
  return actor.isPlayerTeammate();
}
export function isNotPlayerTeammate(CombatActor: CombatActor): boolean {
  const actor = getActorFromFormId(CombatActor.formId);
  return !actor.isPlayerTeammate();
}

export function isInCombatWithPlayer(CombatActor: CombatActor): boolean {
  const actor = getActorFromFormId(CombatActor.formId);
  const combatCombatActor = actor.getCombatTarget();
  return combatCombatActor?.getFormID() === Game.getPlayer()?.getFormID();
}

export function isInCombat(combatActor: CombatActor): boolean {
  const actor = getActorFromFormId(combatActor.formId);
  return actor.isInCombat();
}

export function isPlayerInKillmove(): boolean {
  return Game.getPlayer()?.isInKillMove() as boolean;
}
