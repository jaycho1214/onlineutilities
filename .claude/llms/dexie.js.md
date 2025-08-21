# llm.txt for Dexie.js in Next.js 15

## Overview

Dexie.js is a minimalist wrapper library for IndexedDB that provides a powerful, promise-based API for client-side data storage in web browsers. This document provides comprehensive information for working with Dexie.js in Next.js 15 applications without needing external documentation.

## Table of Contents

1. [Installation and Setup](#installation-and-setup)
2. [Database Creation and Schema](#database-creation-and-schema)
3. [TypeScript Integration](#typescript-integration)
4. [Next.js 15 Integration](#nextjs-15-integration)
5. [CRUD Operations](#crud-operations)
6. [Query API](#query-api)
7. [Transactions](#transactions)
8. [Advanced Features](#advanced-features)
9. [Error Handling](#error-handling)
10. [Performance Optimization](#performance-optimization)
11. [Testing Strategies](#testing-strategies)
12. [Common Patterns](#common-patterns)
13. [Debugging](#debugging)
14. [Browser Compatibility](#browser-compatibility)

## Installation and Setup

### NPM Installation

```bash
# Basic installation
npm install dexie

# For React hooks
npm install dexie dexie-react-hooks

# For testing
npm install --save-dev fake-indexeddb jest
```

### Basic Database Setup

```javascript
import Dexie from "dexie";

// Create database instance
const db = new Dexie("MyDatabase");

// Define schema
db.version(1).stores({
  friends: "++id, name, age, *tags", // ++id = auto-increment
  posts: "id, title, *categories", // *tags = multi-entry index for arrays
});

// Open database
db.open();
```

## Database Creation and Schema

### Schema Syntax

| Symbol          | Meaning                        | Example                |
| --------------- | ------------------------------ | ---------------------- |
| `++`            | Auto-incremented primary key   | `++id`                 |
| `&`             | Unique index                   | `&email`               |
| `*`             | Multi-entry index (for arrays) | `*tags`                |
| `[prop1+prop2]` | Compound index                 | `[firstName+lastName]` |

### Schema Examples

```javascript
db.version(1).stores({
  // Auto-increment with indexes
  users: "++id, name, email, age",

  // Unique indexes
  accounts: "++id, &username, &email",

  // Compound indexes
  people: "++id, [firstName+lastName], age",

  // Multi-entry indexes for arrays
  posts: "++id, title, *tags, publishDate",
});
```

### Database Versioning and Migrations

```javascript
// Version 1
db.version(1).stores({
  friends: "++id, name, age",
});

// Version 2 with migration
db.version(2)
  .stores({
    friends: "++id, firstName, lastName, yearOfBirth",
  })
  .upgrade((tx) => {
    return tx.table("friends").modify((friend) => {
      const [firstName, lastName] = friend.name.split(" ");
      friend.firstName = firstName;
      friend.lastName = lastName;
      friend.yearOfBirth = new Date().getFullYear() - friend.age;
      delete friend.name;
      delete friend.age;
    });
  });
```

## TypeScript Integration

### Modern TypeScript Setup (Dexie 4.x)

```typescript
import Dexie, { type EntityTable } from "dexie";

// Define interfaces
interface Friend {
  id: number;
  name: string;
  age: number;
  tags?: string[];
}

interface Post {
  id: number;
  title: string;
  content: string;
  categories: string[];
}

// Create typed database
const db = new Dexie("MyTypedDB") as Dexie & {
  friends: EntityTable<Friend, "id">;
  posts: EntityTable<Post, "id">;
};

// Define schema
db.version(1).stores({
  friends: "++id, name, age, *tags",
  posts: "++id, title, *categories",
});

export type { Friend, Post };
export { db };
```

### Class-based Approach

```typescript
export class AppDB extends Dexie {
  friends!: EntityTable<Friend, "id">;
  posts!: EntityTable<Post, "id">;

  constructor() {
    super("AppDatabase");
    this.version(1).stores({
      friends: "++id, name, age, *tags",
      posts: "++id, title, *categories",
    });
  }
}

const db = new AppDB();
```

## Next.js 15 Integration

### Key Principles for Next.js 15

1. **IndexedDB is client-side only** - Cannot be used in Server Components
2. **Use Client Components** - Add `'use client'` directive
3. **Handle hydration carefully** - Use conditional rendering
4. **Dynamic imports recommended** - Avoid SSR issues

### Database Singleton for Next.js

```typescript
// lib/db.ts
import Dexie, { type EntityTable } from "dexie";

export interface User {
  id?: number;
  name: string;
  email: string;
  createdAt: Date;
}

class AppDatabase extends Dexie {
  users!: EntityTable<User, "id">;

  constructor() {
    super("NextJSAppDB");
    this.version(1).stores({
      users: "++id, name, email, createdAt",
    });
  }
}

// Singleton pattern
export const db = new AppDatabase();
```

### Client Component with Hydration Handling

```typescript
// app/components/UserList.tsx
'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export function UserList() {
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Query database only on client
  const users = useLiveQuery(
    () => isClient ? db.users.orderBy('createdAt').reverse().toArray() : [],
    [isClient]
  );

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {users?.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
}
```

### Next.js App Router Layout

```typescript
// app/layout.tsx
import { IndexedDBProvider } from '@/components/IndexedDBProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <IndexedDBProvider>
          {children}
        </IndexedDBProvider>
      </body>
    </html>
  );
}

// components/IndexedDBProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { AppDatabase } from '@/lib/db';

const DBContext = createContext<AppDatabase | null>(null);

export function IndexedDBProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<AppDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initDB = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { db: database } = await import('@/lib/db');
          setDb(database);
        } catch (error) {
          console.error('Failed to initialize database:', error);
        }
      }
      setIsLoading(false);
    };

    initDB();
  }, []);

  if (isLoading) {
    return <div>Initializing database...</div>;
  }

  return (
    <DBContext.Provider value={db}>
      {children}
    </DBContext.Provider>
  );
}

export const useDatabase = () => {
  const db = useContext(DBContext);
  if (!db) {
    throw new Error('useDatabase must be used within IndexedDBProvider');
  }
  return db;
};
```

### Dynamic Import Pattern

```typescript
// For components that might SSR
import dynamic from 'next/dynamic';

const DatabaseComponent = dynamic(
  () => import('./DatabaseComponent'),
  {
    ssr: false,
    loading: () => <p>Loading database...</p>
  }
);
```

### Hybrid Data Strategy (Server + Client)

```typescript
// app/posts/page.tsx (Server Component)
export default async function PostsPage() {
  // Fetch initial data from API (SEO-friendly)
  const serverPosts = await fetch('https://api.example.com/posts').then(r => r.json());

  return <PostList serverPosts={serverPosts} />;
}

// app/posts/components/PostList.tsx (Client Component)
'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export function PostList({ serverPosts }: { serverPosts: Post[] }) {
  const [hasMounted, setHasMounted] = useState(false);

  const localPosts = useLiveQuery(
    () => hasMounted ? db.posts.toArray() : []
  );

  useEffect(() => {
    setHasMounted(true);
    // Sync server data to IndexedDB
    syncToIndexedDB(serverPosts);
  }, [serverPosts]);

  const posts = hasMounted ? (localPosts || serverPosts) : serverPosts;

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

## CRUD Operations

### Create Operations

```javascript
// Add single item
const id = await db.friends.add({ name: "Alice", age: 25 });

// Add with specific key
await db.friends.add({ id: 1, name: "Alice", age: 25 });

// Bulk add
await db.friends.bulkAdd([
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 35 },
]);

// Put (insert or replace)
await db.friends.put({ id: 1, name: "Alice Updated", age: 26 });

// Bulk put
await db.friends.bulkPut([
  { id: 1, name: "Alice", age: 25 },
  { id: 2, name: "Bob", age: 30 },
]);
```

### Read Operations

```javascript
// Get by primary key
const friend = await db.friends.get(1);

// Get multiple by keys
const friends = await db.friends.bulkGet([1, 2, 3]);

// Get all
const allFriends = await db.friends.toArray();

// Get first matching
const youngFriend = await db.friends.where("age").below(30).first();

// Get with filter
const adults = await db.friends.where("age").aboveOrEqual(18).toArray();
```

### Update Operations

```javascript
// Update by key
await db.friends.update(1, { age: 26 });

// Bulk update
await db.friends.bulkUpdate([
  { key: 1, changes: { age: 26 } },
  { key: 2, changes: { name: "Robert" } },
]);

// Update with query
await db.friends.where("age").above(65).modify({ discount: 0.5 });

// Update with function
await db.friends
  .where("name")
  .equals("Alice")
  .modify((friend) => {
    friend.age++;
    friend.tags.push("updated");
  });
```

### Delete Operations

```javascript
// Delete by key
await db.friends.delete(1);

// Bulk delete
await db.friends.bulkDelete([1, 2, 3]);

// Delete with query
await db.friends.where("age").below(18).delete();

// Clear table
await db.friends.clear();
```

## Query API

### WhereClause Methods

```javascript
// Comparison operators
await db.friends.where("age").equals(25).toArray();
await db.friends.where("age").above(25).toArray();
await db.friends.where("age").aboveOrEqual(25).toArray();
await db.friends.where("age").below(65).toArray();
await db.friends.where("age").belowOrEqual(65).toArray();
await db.friends.where("age").between(25, 65).toArray();
await db.friends.where("age").notEqual(25).toArray();

// String operators
await db.friends.where("name").startsWith("Al").toArray();
await db.friends.where("name").startsWithIgnoreCase("al").toArray();
await db.friends.where("name").equalsIgnoreCase("alice").toArray();

// Array operators
await db.friends.where("age").anyOf([25, 30, 35]).toArray();
await db.friends.where("age").noneOf([25, 30]).toArray();

// Compound indexes
await db.friends
  .where("[firstName+lastName]")
  .equals(["John", "Doe"])
  .toArray();

// Object criteria (shorthand)
await db.friends
  .where({
    firstName: "John",
    lastName: "Doe",
  })
  .first();
```

### Collection Methods

```javascript
// Execution methods
const array = await collection.toArray();
const first = await collection.first();
const last = await collection.last();
const count = await collection.count();

// Iteration
await collection.each((item) => console.log(item));

// Keys
const keys = await collection.keys();
const primaryKeys = await collection.primaryKeys();
const uniqueKeys = await collection.uniqueKeys();

// Transformation
const filtered = await collection.filter((item) => item.active).toArray();

const limited = await collection.limit(10).offset(20).toArray();

const reversed = await collection.reverse().toArray();

const sorted = await collection.sortBy("name");

// Modification
await collection.modify({ status: "archived" });
await collection.modify((item) => {
  item.updatedAt = new Date();
});
await collection.delete();
```

### Advanced Querying

```javascript
// OR operations
await db.friends.where("age").above(65).or("shoeSize").above(10).toArray();

// Complex filtering
const results = await db.friends
  .where("age")
  .between(20, 30)
  .filter((friend) => /^A/.test(friend.name))
  .limit(10)
  .offset(20)
  .toArray();

// Order by
const ordered = await db.friends.orderBy("age").reverse().toArray();
```

## Transactions

### Basic Transactions

```javascript
// Read-write transaction
await db.transaction("rw", [db.friends, db.pets], async () => {
  const petId = await db.pets.add({ name: "Fluffy", type: "cat" });
  await db.friends.add({ name: "Alice", age: 25, petId: petId });
  // All operations succeed or all fail atomically
});

// Read-only transaction
await db.transaction("r", [db.friends], async () => {
  const friends = await db.friends.where("age").above(21).toArray();
  console.log(`Found ${friends.length} adult friends`);
});
```

### Transaction Error Handling

```javascript
try {
  await db.transaction("rw", db.friends, async () => {
    await db.friends.add({ name: "Alice", age: 25 });
    throw new Error("Something went wrong");
    await db.friends.add({ name: "Bob", age: 30 }); // Won't execute
  });
} catch (error) {
  console.log("Transaction rolled back:", error);
}
```

### Important Transaction Rules

1. **Use global Promise**: Never use custom Promise implementations
2. **Avoid external async APIs**: Don't use fetch() or setTimeout() in transactions
3. **Re-throw errors**: When catching errors in transactions, always re-throw to maintain rollback

```javascript
// WRONG - Will cause TransactionInactiveError
db.transaction("rw", db.users, async () => {
  await fetch("/api/data"); // Breaks transaction!
  return db.users.add(data);
});

// CORRECT - Use Dexie.waitFor for necessary async operations
db.transaction("rw", db.users, async () => {
  const data = await Dexie.waitFor(fetch("/api/data"));
  return db.users.add(data);
});
```

## Advanced Features

### Hooks System

```javascript
// Creating hook - fires on object creation
db.users.hook("creating", function (primKey, obj, trans) {
  obj.createdAt = new Date();
  return obj;
});

// Reading hook - transform objects when retrieved
db.users.hook("reading", function (obj) {
  obj.displayName = `${obj.firstName} ${obj.lastName}`;
  return obj;
});

// Updating hook - fires on updates
db.users.hook("updating", function (modifications, primKey, obj, trans) {
  modifications.updatedAt = new Date();
  return modifications;
});

// Deleting hook - fires on deletion
db.users.hook("deleting", function (primKey, obj, trans) {
  console.log(`Deleting user: ${obj.name}`);
});
```

### Live Queries (Reactive Data)

```javascript
import { liveQuery } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

// Vanilla JavaScript
const friendsObservable = liveQuery(() =>
  db.friends.where("age").between(18, 65).toArray(),
);

const subscription = friendsObservable.subscribe({
  next: (result) => console.log("Friends updated:", result),
  error: (error) => console.error(error),
});

// React Hook
function FriendsList() {
  const friends = useLiveQuery(
    () => db.friends.where("age").above(18).toArray(),
    [], // Dependencies
  );

  if (!friends) return <div>Loading...</div>;

  return (
    <ul>
      {friends.map((friend) => (
        <li key={friend.id}>{friend.name}</li>
      ))}
    </ul>
  );
}
```

### DBCore Middleware

```javascript
// Custom middleware for logging
db.use({
  stack: "dbcore",
  name: "LoggingMiddleware",
  create(downlevelDatabase) {
    return {
      ...downlevelDatabase,
      table(tableName) {
        const downTable = downlevelDatabase.table(tableName);
        return {
          ...downTable,
          mutate(req) {
            console.log(`Mutating ${tableName}:`, req);
            return downTable.mutate(req);
          },
          query(req) {
            console.log(`Querying ${tableName}:`, req);
            return downTable.query(req);
          },
        };
      },
    };
  },
});
```

### Import/Export

```javascript
import { exportDB, importDB } from "dexie-export-import";

// Export database
const blob = await exportDB(db, {
  prettyJson: true,
  progressCallback: ({ totalRows, completedRows }) => {
    console.log(`Progress: ${completedRows}/${totalRows}`);
  },
});

// Download as file
import download from "downloadjs";
download(blob, "database-backup.json", "application/json");

// Import database
const newDb = await importDB(blob);

// Import to existing database
await importInto(db, blob, {
  clearTablesBeforeImport: true,
  overwriteData: true,
});
```

### Dexie Cloud Sync

```javascript
import dexieCloud from "dexie-cloud-addon";

const db = new Dexie("CloudDB", { addons: [dexieCloud] });

db.version(1).stores({
  todos: "@id, title, done", // @ = auto-generated global ID
});

db.cloud.configure({
  databaseUrl: "https://your-database.dexie.cloud",
  requireAuth: true,
  tryUseServiceWorker: true,
});

// Authentication
await db.cloud.login();
const currentUser = db.cloud.currentUser;

// Manual sync
await db.cloud.sync();

// Monitor sync status
db.cloud.syncState.subscribe((state) => {
  console.log("Sync status:", state.phase);
});
```

## Error Handling

### Error Types

```javascript
try {
  await db.friends.add({ name: "Alice" });
} catch (error) {
  switch (error.name) {
    case "ConstraintError":
      // Duplicate key violation
      break;
    case "QuotaExceededError":
      // Storage quota exceeded
      break;
    case "DatabaseClosedError":
      // Database connection closed
      break;
    case "TransactionInactiveError":
      // Transaction no longer active
      break;
    case "DataError":
      // Invalid data
      break;
    case "NotFoundError":
      // Record not found
      break;
    case "AbortError":
      // Operation aborted
      break;
    default:
    // Unknown error
  }
}
```

### Error Handling Best Practices

```javascript
// DON'T catch everywhere
function badExample() {
  return db.friends.add({ name: "foo" }).catch((err) => console.log(err)); // Marks error as handled!
}

// DO let errors propagate
function goodExample() {
  return db.friends.add({ name: "foo" });
  // Let caller handle the error
}

// DO catch at top level
goodExample()
  .then((result) => console.log("Success"))
  .catch((error) => {
    console.error("Failed:", error);
    showUserError(error);
  });

// DO re-throw when logging
function loggingExample() {
  return db.friends.add({ name: "foo" }).catch((err) => {
    console.error("Failed to add:", err);
    throw err; // Re-throw to maintain error state
  });
}
```

### Global Error Handler

```javascript
db.on("error", function (error) {
  console.error("Unhandled database error:", error);
  // Send to error monitoring service
  errorMonitoring.captureException(error);
});
```

## Performance Optimization

### Indexing Best Practices

- **Index queried fields**: Only index fields you query on
- **Avoid over-indexing**: Each index adds storage overhead
- **Use compound indexes**: For multi-field queries `[field1+field2]`
- **Don't index large data**: Avoid indexing binary or large text fields

### Query Optimization

```javascript
// FAST - Uses index
await db.friends.where("age").above(25).toArray();

// SLOW - Full table scan
await db.friends.filter((friend) => friend.age % 2 === 0).toArray();

// FAST - Bulk operations
await db.friends.bulkAdd(largeArray);

// SLOW - Individual operations in loop
for (const item of largeArray) {
  await db.friends.add(item);
}
```

### Transaction Optimization

```javascript
// GOOD - Single transaction for multiple operations
await db.transaction("rw", db.friends, async () => {
  for (const friend of friends) {
    await db.friends.add(friend);
  }
});

// BAD - Multiple transactions
for (const friend of friends) {
  await db.friends.add(friend); // New transaction each time
}
```

### Pagination Strategies

```javascript
// Cursor-based pagination (recommended)
function paginateWithCursor(lastItem, pageSize = 10) {
  let query = db.items.orderBy("id");
  if (lastItem) {
    query = query.where("id").above(lastItem.id);
  }
  return query.limit(pageSize).toArray();
}

// Offset-based pagination (use sparingly)
const PAGE_SIZE = 10;
const page = 2;
await db.items
  .offset(page * PAGE_SIZE)
  .limit(PAGE_SIZE)
  .toArray();
```

### Web Worker Integration

```javascript
// worker.js
importScripts("https://unpkg.com/dexie/dist/dexie.js");

const db = new Dexie("WorkerDB");
db.version(1).stores({ items: "++id, data" });

self.onmessage = async (e) => {
  const { type, data } = e.data;

  switch (type) {
    case "bulkAdd":
      await db.items.bulkAdd(data);
      self.postMessage({ type: "success" });
      break;
  }
};
```

## Testing Strategies

### Setup with Jest/Vitest

```javascript
// Install fake-indexeddb for testing
// npm install --save-dev fake-indexeddb

// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  setupFiles: ["fake-indexeddb/auto"],
};

// Basic test
import "fake-indexeddb/auto";
import { db } from "./db";

describe("Database operations", () => {
  beforeEach(async () => {
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  test("should add and retrieve user", async () => {
    const id = await db.users.add({
      name: "John",
      email: "john@example.com",
    });

    const user = await db.users.get(id);
    expect(user.name).toBe("John");
  });
});
```

### Mocking Dexie

```javascript
// Mock for unit tests
jest.mock("dexie", () => {
  const mockDb = {
    users: {
      add: jest.fn().mockResolvedValue(1),
      get: jest.fn().mockResolvedValue({ id: 1, name: "John" }),
      where: jest.fn(() => ({
        equals: jest.fn(() => ({
          toArray: jest.fn().mockResolvedValue([]),
        })),
      })),
    },
  };

  return jest.fn(() => mockDb);
});
```

## Common Patterns

### Repository Pattern

```typescript
class UserRepository {
  constructor(private db: AppDB) {}

  async create(data: Omit<User, "id">): Promise<number> {
    return this.db.users.add(data);
  }

  async findById(id: number): Promise<User | undefined> {
    return this.db.users.get(id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.db.users.where("email").equals(email).first();
  }

  async update(id: number, updates: Partial<User>): Promise<number> {
    return this.db.users.update(id, updates);
  }

  async delete(id: number): Promise<void> {
    await this.db.users.delete(id);
  }
}
```

### Offline-First Pattern

```javascript
class OfflineDataManager {
  async syncWithServer() {
    if (!navigator.onLine) return;

    // Get pending changes
    const pendingChanges = await db.syncQueue.toArray();

    for (const change of pendingChanges) {
      try {
        await fetch("/api/sync", {
          method: "POST",
          body: JSON.stringify(change),
        });

        await db.syncQueue.delete(change.id);
      } catch (error) {
        console.error("Sync failed:", error);
      }
    }
  }
}

// Listen for online status
window.addEventListener("online", () => {
  new OfflineDataManager().syncWithServer();
});
```

### Shopping Cart Example

```javascript
class ShoppingCart {
  static async addToCart(productId, quantity = 1) {
    const existingItem = await db.cartItems
      .where("productId")
      .equals(productId)
      .first();

    if (existingItem) {
      await db.cartItems.update(existingItem.id, {
        quantity: existingItem.quantity + quantity,
      });
    } else {
      await db.cartItems.add({
        productId,
        quantity,
        addedAt: Date.now(),
      });
    }
  }

  static async getCartTotal() {
    const items = await db.cartItems.toArray();

    let total = 0;
    for (const item of items) {
      const product = await db.products.get(item.productId);
      total += product.price * item.quantity;
    }

    return total;
  }

  static async checkout() {
    return await db.transaction("rw", [db.cartItems, db.orders], async () => {
      const items = await db.cartItems.toArray();

      if (items.length === 0) {
        throw new Error("Cart is empty");
      }

      const orderId = await db.orders.add({
        items,
        total: await this.getCartTotal(),
        createdAt: Date.now(),
      });

      await db.cartItems.clear();
      return orderId;
    });
  }
}
```

## Debugging

### Chrome DevTools

1. Open DevTools (F12)
2. Go to Application tab
3. Find IndexedDB in left sidebar
4. Browse databases, tables, and data
5. Right-click to delete entries
6. Use refresh button for real-time updates

### Debug Mode

```javascript
// Enable debug mode (development only)
if (process.env.NODE_ENV === "development") {
  Dexie.debug = true; // Enables long stack traces
}

// Log all queries
db.on("ready", function () {
  db.tables.forEach((table) => {
    table.hook("reading", (obj) => {
      console.log(`Reading from ${table.name}:`, obj);
    });
  });
});
```

### Performance Monitoring

```javascript
// Measure query performance
console.time("query");
const results = await db.items.where("status").equals("active").toArray();
console.timeEnd("query");
console.log(`Found ${results.length} items`);

// Monitor storage usage
const estimate = await navigator.storage.estimate();
console.log(`Using ${estimate.usage} of ${estimate.quota} bytes`);
```

## Browser Compatibility

### Storage Limits by Browser

| Browser        | Limit              | Notes                    |
| -------------- | ------------------ | ------------------------ |
| Chrome         | 60% of disk space  | Per origin               |
| Firefox        | 50% of disk space  | Max 8TB, persistent mode |
| Safari Desktop | ~20% of disk space | 60% for PWAs             |
| Safari iOS     | Variable           | 7-day eviction policy    |

### Browser Support

- **Full Support**: Chrome 23+, Firefox 10+, Safari 10+, Edge 79+
- **Partial Support**: IE 10-11 (with polyfills)
- **Mobile**: iOS Safari (all browsers use WebKit), Android Chrome 23+

### Feature Detection

```javascript
// Check for IndexedDB support
if (!window.indexedDB) {
  console.error("Your browser doesn't support IndexedDB");
  // Fall back to localStorage or other storage
}

// Check available storage
if ("storage" in navigator && "estimate" in navigator.storage) {
  const estimate = await navigator.storage.estimate();
  console.log(`Available: ${estimate.quota - estimate.usage} bytes`);
}

// Request persistent storage
if ("persist" in navigator.storage) {
  const isPersisted = await navigator.storage.persist();
  console.log(`Persistent storage: ${isPersisted}`);
}
```

## Common Gotchas and Solutions

### 1. Hydration Issues in Next.js

```javascript
// Problem: Server/client mismatch
// Solution: Use conditional rendering
const [isClient, setIsClient] = useState(false);
useEffect(() => setIsClient(true), []);
if (!isClient) return <Loading />;
```

### 2. Transaction Inactive Errors

```javascript
// Problem: Using external async APIs
// Solution: Use Dexie.waitFor or do async work outside transaction
const data = await fetch("/api/data"); // Outside transaction
await db.transaction("rw", db.users, async () => {
  await db.users.add(data);
});
```

### 3. Promise Implementation Issues

```javascript
// Problem: Using non-global Promise
// Solution: Always use window.Promise or Dexie.Promise
db.transaction('rw', db.users, () => {
  return window.Promise.all([...]); // Use global Promise
});
```

### 4. Multiple Database Instances

```javascript
// Problem: Creating new instance each time
// Solution: Use singleton pattern
let db;
export function getDB() {
  if (!db) {
    db = new Dexie('MyDB');
    db.version(1).stores({...});
  }
  return db;
}
```

### 5. iOS Safari Data Eviction

```javascript
// Problem: Data deleted after 7 days
// Solution: Request persistent storage and handle data loss
async function ensurePersistence() {
  if ("persist" in navigator.storage) {
    await navigator.storage.persist();
  }
  // Also implement data recovery strategy
}
```

## Quick Reference Cheat Sheet

### Schema Symbols

- `++id` - Auto-increment primary key
- `&email` - Unique index
- `*tags` - Multi-entry index (arrays)
- `[a+b]` - Compound index

### Transaction Modes

- `'r'` - Read-only
- `'rw'` - Read-write
- `'upgrade'` - Schema upgrade

### Common Operations

```javascript
// Create
await db.table.add(item);
await db.table.bulkAdd(items);
await db.table.put(item);

// Read
await db.table.get(key);
await db.table.toArray();
await db.table.where("field").equals(value).first();

// Update
await db.table.update(key, changes);
await db.table.where("field").equals(value).modify(changes);

// Delete
await db.table.delete(key);
await db.table.where("field").equals(value).delete();
await db.table.clear();

// Count
await db.table.count();
await db.table.where("field").above(value).count();
```

### WhereClause Operators

- `equals()`, `notEqual()`
- `above()`, `aboveOrEqual()`
- `below()`, `belowOrEqual()`
- `between()`
- `startsWith()`, `startsWithIgnoreCase()`
- `anyOf()`, `noneOf()`

### Collection Methods

- `toArray()`, `first()`, `last()`
- `count()`, `each()`
- `filter()`, `limit()`, `offset()`
- `reverse()`, `sortBy()`
- `modify()`, `delete()`

## Summary

Dexie.js provides a powerful, type-safe, promise-based wrapper around IndexedDB with excellent Next.js 15 compatibility. Key considerations include proper client-side rendering, hydration handling, transaction management, and performance optimization through proper indexing and bulk operations. The library excels at offline-first applications with its live query support and optional cloud synchronization capabilities.
