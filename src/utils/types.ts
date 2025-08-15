export type HandleNullString<T> = T extends "null" ? null : T;
