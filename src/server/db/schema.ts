import { pgTable, serial, text, varchar, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { index } from "drizzle-orm/pg-core";

const timestamptz = (name: string) =>
  timestamp(name, { withTimezone: true }).defaultNow().notNull();

// Enum for sender type
export const senderEnum = pgEnum("sender", ["user", "ai"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamptz("created_at"),
  updatedAt: timestamptz("updated_at"),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamptz("created_at"),
  updatedAt: timestamptz("updated_at"),
});

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .references(() => chatSessions.id)
      .notNull(),
    sender: senderEnum("sender").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("idx_messages_session").on(table.sessionId),
    createdIdx: index("idx_messages_created_at").on(table.createdAt),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(chatSessions),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, { fields: [chatSessions.userId], references: [users.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  session: one(chatSessions, { fields: [messages.sessionId], references: [chatSessions.id] }),
}));
