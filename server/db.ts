import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, favorites } from "../drizzle/schema";
import { ENV } from './_core/env';
import fs from "fs/promises";
import path from "path";

let _db: ReturnType<typeof drizzle> | null = null;

const DEV_DB_PATH = path.resolve(import.meta.dirname, "..", "..", "server_data.json");

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// --- Simple file-backed dev database
type DevUser = {
  id: number;
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  lastSignedIn?: string;
};

type DevFavorite = {
  id: number;
  userId: number;
  ghibliMovieId: string;
  movieTitle?: string | null;
  movieDescription?: string | null;
  releaseDate?: string | null;
  runningTime?: string | null;
  createdAt?: string;
};

type DevDb = {
  users: DevUser[];
  favorites: DevFavorite[];
  nextUserId: number;
  nextFavoriteId: number;
};

async function readDevDb(): Promise<DevDb> {
  try {
    const raw = await fs.readFile(DEV_DB_PATH, "utf-8");
    return JSON.parse(raw) as DevDb;
  } catch (e) {
    const initial: DevDb = { users: [], favorites: [], nextUserId: 1, nextFavoriteId: 1 };
    await fs.writeFile(DEV_DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
}

async function writeDevDb(db: DevDb) {
  await fs.writeFile(DEV_DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

function toIso(date?: Date) {
  return date ? date.toISOString() : new Date().toISOString();
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (db) {
    // Real database
    try {
      const values: InsertUser = {
        openId: user.openId,
      };
      const updateSet: Record<string, unknown> = {};

      const textFields = ["name", "email", "loginMethod"] as const;
      type TextField = (typeof textFields)[number];

      const assignNullable = (field: TextField) => {
        const value = user[field];
        if (value === undefined) return;
        const normalized = value ?? null;
        values[field] = normalized;
        updateSet[field] = normalized;
      };

      textFields.forEach(assignNullable);

      if (user.lastSignedIn !== undefined) {
        values.lastSignedIn = user.lastSignedIn;
        updateSet.lastSignedIn = user.lastSignedIn;
      }
      if (user.role !== undefined) {
        values.role = user.role;
        updateSet.role = user.role;
      } else if (user.openId === ENV.ownerOpenId) {
        values.role = 'admin';
        updateSet.role = 'admin';
      }

      if (!values.lastSignedIn) {
        values.lastSignedIn = new Date();
      }

      if (Object.keys(updateSet).length === 0) {
        updateSet.lastSignedIn = new Date();
      }

      await db.insert(users).values(values).onDuplicateKeyUpdate({
        set: updateSet,
      });
    } catch (error) {
      console.error("[Database] Failed to upsert user:", error);
      throw error;
    }
    return;
  }

  // Fallback: file-backed dev DB
  try {
    const dev = await readDevDb();
    let existing = dev.users.find(u => u.openId === user.openId);
    const now = toIso(new Date());

    if (!existing) {
      existing = {
        id: dev.nextUserId++,
        openId: user.openId,
        name: (user as any).name ?? null,
        email: (user as any).email ?? null,
        loginMethod: (user as any).loginMethod ?? null,
        role: (user as any).role ?? (user.openId === ENV.ownerOpenId ? 'admin' : 'user'),
        createdAt: now,
        updatedAt: now,
        lastSignedIn: ((user as any).lastSignedIn ?? new Date()).toString(),
      } as DevUser;
      dev.users.push(existing);
    } else {
      // update fields if provided
      if ((user as any).name !== undefined) existing.name = (user as any).name ?? null;
      if ((user as any).email !== undefined) existing.email = (user as any).email ?? null;
      if ((user as any).loginMethod !== undefined) existing.loginMethod = (user as any).loginMethod ?? null;
      if ((user as any).role !== undefined) existing.role = (user as any).role;
      existing.updatedAt = now;
      existing.lastSignedIn = ((user as any).lastSignedIn ?? new Date()).toString();
    }

    await writeDevDb(dev);
  } catch (error) {
    console.warn("[Database] Cannot upsert user: dev file error", error);
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (db) {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  try {
    const dev = await readDevDb();
    const u = dev.users.find(x => x.openId === openId);
    if (!u) return undefined;
    return {
      id: u.id,
      openId: u.openId,
      name: u.name,
      email: u.email,
      loginMethod: u.loginMethod,
      role: u.role,
      createdAt: new Date(u.createdAt || undefined),
      updatedAt: new Date(u.updatedAt || undefined),
      lastSignedIn: new Date(u.lastSignedIn || undefined),
    } as any;
  } catch (error) {
    console.warn("[Database] Cannot get user: dev file error", error);
    return undefined;
  }
}

/**
 * Get all favorites for a user
 */
export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      const result = await db
        .select()
        .from(favorites)
        .where(eq(favorites.userId, userId))
        .orderBy(favorites.createdAt);
      return result;
    } catch (error) {
      console.error("[Database] Failed to get favorites:", error);
      throw error;
    }
  }

  try {
    const dev = await readDevDb();
    return dev.favorites
      .filter(f => f.userId === userId)
      .sort((a, b) => (a.createdAt && b.createdAt ? a.createdAt.localeCompare(b.createdAt) : 0));
  } catch (error) {
    console.error("[Database] Failed to get favorites (dev):", error);
    throw error;
  }
}

/**
 * Add a movie to user's favorites
 */
export async function addFavorite(
  userId: number,
  ghibliMovieId: string,
  movieData: {
    title?: string;
    description?: string;
    releaseDate?: string;
    runningTime?: string;
  }
) {
  const db = await getDb();
  if (db) {
    try {
      await db.insert(favorites).values({
        userId,
        ghibliMovieId,
        movieTitle: movieData.title,
        movieDescription: movieData.description,
        releaseDate: movieData.releaseDate,
        runningTime: movieData.runningTime,
      });
    } catch (error) {
      console.error("[Database] Failed to add favorite:", error);
      throw error;
    }
    return;
  }

  try {
    const dev = await readDevDb();
    const now = toIso(new Date());
    const fav: DevFavorite = {
      id: dev.nextFavoriteId++,
      userId,
      ghibliMovieId,
      movieTitle: movieData.title ?? null,
      movieDescription: movieData.description ?? null,
      releaseDate: movieData.releaseDate ?? null,
      runningTime: movieData.runningTime ?? null,
      createdAt: now,
    };
    dev.favorites.push(fav);
    await writeDevDb(dev);
  } catch (error) {
    console.error("[Database] Failed to add favorite (dev):", error);
    throw error;
  }
}

/**
 * Remove a movie from user's favorites
 */
export async function removeFavorite(userId: number, ghibliMovieId: string) {
  const db = await getDb();
  if (db) {
    try {
      await db
        .delete(favorites)
        .where(
          and(
            eq(favorites.userId, userId),
            eq(favorites.ghibliMovieId, ghibliMovieId)
          )
        );
    } catch (error) {
      console.error("[Database] Failed to remove favorite:", error);
      throw error;
    }
    return;
  }

  try {
    const dev = await readDevDb();
    const before = dev.favorites.length;
    dev.favorites = dev.favorites.filter(f => !(f.userId === userId && f.ghibliMovieId === ghibliMovieId));
    if (dev.favorites.length !== before) {
      await writeDevDb(dev);
    }
  } catch (error) {
    console.error("[Database] Failed to remove favorite (dev):", error);
    throw error;
  }
}

/**
 * Check if a movie is in user's favorites
 */
export async function isFavorited(userId: number, ghibliMovieId: string) {
  const db = await getDb();
  if (db) {
    try {
      const result = await db
        .select()
        .from(favorites)
        .where(
          and(
            eq(favorites.userId, userId),
            eq(favorites.ghibliMovieId, ghibliMovieId)
          )
        )
        .limit(1);
      return result.length > 0;
    } catch (error) {
      console.error("[Database] Failed to check favorite:", error);
      throw error;
    }
  }

  try {
    const dev = await readDevDb();
    return dev.favorites.some(f => f.userId === userId && f.ghibliMovieId === ghibliMovieId);
  } catch (error) {
    console.error("[Database] Failed to check favorite (dev):", error);
    throw error;
  }
}
