// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, pgTableCreator } from "drizzle-orm/pg-core";
/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `web_${name}`);
export * from "drizzle-orm";
export const quotes = createTable(
  "quote",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    quote: d.text().notNull(),

    guildId: d.text(),
    channelId: d.text().notNull(),
    messageId: d.text().notNull(),

    authorId: d.text().notNull(),

    imageStorageUrl: d.text().notNull(),

    userId: d.text().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.authorId)]
);

export const usersCache = createTable(
  "users_cache",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d.text().notNull(),
    username: d.text().notNull(),
    name: d.text().notNull(),
    avatarUrl: d.text().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("users_userId_idx").on(t.userId)]
);

export const guildsCache = createTable(
  "guilds_cache",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    guildId: d.text().notNull(),
    image: d.text().notNull(),
    name: d.text().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("guilds_guildId_idx").on(t.guildId)]
);

export const channelsCache = createTable(
  "channels_cache",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    channelId: d.text().notNull(),
    guildId: d.text().notNull(),
    name: d.text().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("channels_channelId_idx").on(t.channelId)]
);
