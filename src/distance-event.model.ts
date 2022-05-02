export interface CombatActor {
  formId: number;
  name?: string | undefined;
  level?: number;
  distance?: number;
}

export const htmlEscapes: Record<string, string> = {
  '"': '\\"',
  "'": "\\'",
  "\\": "\\\\",
  "<": "\\<",
  ">": "\\>",
};

export const htmlEscaper = /[&<>"'\\\/]/;

export enum ZonesAnimEvent {
  CLOSE_RANGE = "StartCloseRange",
  MEDIUM_RANGE = "StartMediumRange",
  LONG_RANGE = "StartLongRange",
  NO_RANGE = "StartNoRange",
}

export enum ZonesBorders {
  CLOSE_RANGE = 90,
  MEDIUM_RANGE = 250,
  LONG_RANGE = 5000,
}
