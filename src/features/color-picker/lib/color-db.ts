import Dexie, { type EntityTable } from "dexie";

export interface RecentColor {
  id?: number;
  color: string;
  timestamp: number;
}

const db = new Dexie("ColorPickerDB") as Dexie & {
  recentColors: EntityTable<RecentColor, "id">;
};

db.version(1).stores({
  recentColors: "++id, color, timestamp",
});

export class ColorDB {
  static async addRecentColor(color: string): Promise<void> {
    try {
      // Check if color already exists
      const existingColor = await db.recentColors
        .where("color")
        .equals(color)
        .first();

      if (existingColor) {
        // Update timestamp if color already exists
        await db.recentColors.update(existingColor.id!, {
          timestamp: Date.now(),
        });
      } else {
        // Add new color
        await db.recentColors.add({
          color,
          timestamp: Date.now(),
        });
      }

      // Keep only the most recent 24 colors
      const allColors = await db.recentColors
        .orderBy("timestamp")
        .reverse()
        .toArray();

      if (allColors.length > 24) {
        const colorsToDelete = allColors.slice(24);
        await db.recentColors.bulkDelete(
          colorsToDelete.map((c) => c.id!).filter(Boolean)
        );
      }
    } catch (error) {
      console.error("Failed to add recent color:", error);
    }
  }

  static async getRecentColors(): Promise<string[]> {
    try {
      const colors = await db.recentColors
        .orderBy("timestamp")
        .reverse()
        .limit(24)
        .toArray();

      return colors.map((c) => c.color);
    } catch (error) {
      console.error("Failed to get recent colors:", error);
      return [];
    }
  }

  static async clearRecentColors(): Promise<void> {
    try {
      await db.recentColors.clear();
    } catch (error) {
      console.error("Failed to clear recent colors:", error);
    }
  }
}

export default db;