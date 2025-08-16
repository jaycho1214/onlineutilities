import Dexie, { type EntityTable } from "dexie";

export interface DatabaseCollections {}

export class AppDatabase extends Dexie {
  constructor() {
    super("onlineutilities");
    this.version(1).stores({});
  }
}

export const db = new AppDatabase();
