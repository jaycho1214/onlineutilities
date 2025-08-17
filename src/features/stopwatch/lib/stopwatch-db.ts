"use client";

import Dexie, { Table } from "dexie";
import { Stopwatch } from "../types";
import { nanoid } from "nanoid";

export class StopwatchDatabase extends Dexie {
  stopwatches!: Table<Stopwatch>;

  constructor() {
    super("StopwatchDatabase");

    this.version(1).stores({
      stopwatches: "id, title, isRunning, createdAt, updatedAt",
    });
  }
}

export const stopwatchDb = new StopwatchDatabase();

export const stopwatchService = {
  async getAll(): Promise<Stopwatch[]> {
    return await stopwatchDb.stopwatches
      .orderBy("createdAt")
      .reverse()
      .toArray();
  },

  async get(id: string): Promise<Stopwatch | undefined> {
    return await stopwatchDb.stopwatches.get(id);
  },

  async create(
    stopwatch: Omit<Stopwatch, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const id = nanoid();
    const now = Date.now();

    await stopwatchDb.stopwatches.add({
      ...stopwatch,
      id,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },

  async update(id: string, updates: Partial<Stopwatch>): Promise<void> {
    await stopwatchDb.stopwatches.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  async delete(id: string): Promise<void> {
    await stopwatchDb.stopwatches.delete(id);
  },

  async updateRunningStopwatches(): Promise<void> {
    // Update all running stopwatches when the app starts
    const runningStopwatches = await stopwatchDb.stopwatches
      .where("isRunning")
      .equals(1)
      .toArray();

    const now = Date.now();

    for (const stopwatch of runningStopwatches) {
      if (stopwatch.startTime) {
        // Calculate the current elapsed time and store it as pausedTime
        const elapsedTime = stopwatch.pausedTime + (now - stopwatch.startTime);
        await this.update(stopwatch.id, {
          startTime: now,
          pausedTime: elapsedTime,
        });
      }
    }
  },
};
