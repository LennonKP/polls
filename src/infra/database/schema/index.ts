import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const pollVisibilityEnum = pgEnum("poll_visibility", ["public", "private"]);
export const pollStatusEnum = pgEnum("poll_status", ["open", "closed", "scheduled"]);

// Users table
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Polls table
export const polls = pgTable("polls", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    visibility: pollVisibilityEnum("visibility").default("public").notNull(),
    status: pollStatusEnum("status").default("open").notNull(),
    startAt: timestamp("start_at").notNull(),
    endAt: timestamp("end_at"),
    expectedVotes: integer("expected_votes"),
    createdById: uuid("created_by_id").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Poll options table
export const pollOptions = pgTable("poll_options", {
    id: uuid("id").defaultRandom().primaryKey(),
    pollId: uuid("poll_id").references(() => polls.id, { onDelete: "cascade" }).notNull(),
    text: varchar("text", { length: 255 }).notNull(),
    imageUrl: varchar("image_url", { length: 500 }),
});

// Votes table
export const votes = pgTable("votes", {
    id: uuid("id").defaultRandom().primaryKey(),
    pollId: uuid("poll_id").references(() => polls.id, { onDelete: "cascade" }).notNull(),
    optionId: uuid("option_id").references(() => pollOptions.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Poll categories (many-to-many via junction table)
export const pollCategories = pgTable("poll_categories", {
    pollId: uuid("poll_id").references(() => polls.id, { onDelete: "cascade" }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.pollId, table.category] }),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    polls: many(polls),
    votes: many(votes),
}));

export const pollsRelations = relations(polls, ({ one, many }) => ({
    createdBy: one(users, {
        fields: [polls.createdById],
        references: [users.id],
    }),
    options: many(pollOptions),
    votes: many(votes),
    categories: many(pollCategories),
}));

export const pollOptionsRelations = relations(pollOptions, ({ one, many }) => ({
    poll: one(polls, {
        fields: [pollOptions.pollId],
        references: [polls.id],
    }),
    votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
    poll: one(polls, {
        fields: [votes.pollId],
        references: [polls.id],
    }),
    option: one(pollOptions, {
        fields: [votes.optionId],
        references: [pollOptions.id],
    }),
    user: one(users, {
        fields: [votes.userId],
        references: [users.id],
    }),
}));

export const pollCategoriesRelations = relations(pollCategories, ({ one }) => ({
    poll: one(polls, {
        fields: [pollCategories.pollId],
        references: [polls.id],
    }),
}));
