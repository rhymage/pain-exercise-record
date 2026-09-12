// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import {sqliteTable,text,integer,primaryKey} from 'drizzle-orm/sqlite-core';
export const records=sqliteTable('records',{userId:text('user_id').notNull(),date:text('date').notNull(),data:text('data').notNull(),version:integer('version').notNull().default(1)},t=>[primaryKey({columns:[t.userId,t.date]})]);
