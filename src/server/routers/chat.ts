import { router, publicProcedure, protectedProcedure } from "../trpc/trpc";
import { z } from "zod";
import { db } from "../db";
import { chatSessions, messages } from "../db/schema";
import { desc, lt, asc, eq, gt, and } from "drizzle-orm";
import { complete } from "@/lib/aiClient";
import { InferSelectModel, sql } from "drizzle-orm";

// Infer session & message types
type ChatSession = InferSelectModel<typeof chatSessions>;
export type MessageRow = InferSelectModel<typeof messages>;

export type SessionWithPreview = {
  id: number;
  title: string;
  userId: number | null;
  createdAt: string;
  updatedAt: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
};

// List sessions (scoped to logged-in user)
const listSessions = protectedProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(50).default(10),
      search: z.string().nullish(),
    })
  )
  .query(async ({ input, ctx }) => {
    const offset = (input.page - 1) * input.pageSize;
    const userId = Number(ctx.session.user.id);

    const whereClause = input.search
      ? sql`chat_sessions.user_id = ${userId} AND chat_sessions.title ILIKE ${`%${input.search}%`}`
      : sql`chat_sessions.user_id = ${userId}`;

    // fetch paginated sessions
    const rows = await db
      .execute(
        sql`SELECT * FROM chat_sessions 
            WHERE ${whereClause}
            ORDER BY chat_sessions.updated_at DESC
            LIMIT ${input.pageSize} OFFSET ${offset}`
      )
      .then((r) => r.rows as ChatSession[]);

    const total = Number(
      (await db.execute(sql`SELECT COUNT(*) FROM chat_sessions WHERE ${whereClause}`)).rows[0].count
    );

    const sessionsWithPreview: SessionWithPreview[] = await Promise.all(
      rows.map(async (s: ChatSession) => {
        const [lastMsg] = await db
          .select()
          .from(messages)
          .where(eq(messages.sessionId, s.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        return {
          ...s,
          lastMessagePreview: lastMsg ? lastMsg.content : null,
          lastMessageAt: lastMsg ? lastMsg.createdAt : null,
        };
      })
    );

    return {
      sessions: sessionsWithPreview,
      pagination: {
        page: input.page,
        pageSize: input.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
      },
    };
  });

// Get session
const getSession = publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
  const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, input.id));
  if (!session) throw new Error("Session not found");
  return session;
});

// List messages (cursor pagination)
const listMessages = publicProcedure
  .input(
    z.object({
      sessionId: z.number(),
      limit: z.number().min(1).max(50).default(20),
      cursor: z.number().optional(),
      direction: z.enum(["forward", "backward"]).default("backward"),
    })
  )
  .query(async ({ input }): Promise<{ messages: MessageRow[]; nextCursor: number | null }> => {
    const { sessionId, limit, cursor, direction } = input;

    let rows: MessageRow[];

    if (direction === "backward") {
      rows = await db
        .select()
        .from(messages)
        .where(and(eq(messages.sessionId, sessionId), cursor ? lt(messages.id, cursor) : undefined))
        .orderBy(desc(messages.createdAt))
        .limit(limit + 1);
    } else {
      rows = await db
        .select()
        .from(messages)
        .where(and(eq(messages.sessionId, sessionId), cursor ? gt(messages.id, cursor) : undefined))
        .orderBy(asc(messages.createdAt))
        .limit(limit + 1);
    }

    let nextCursor: number | null = null;
    if (rows.length > limit) {
      const nextItem = rows.pop()!;
      nextCursor = nextItem.id;
    }

    return {
      messages: direction === "backward" ? rows.reverse() : rows,
      nextCursor,
    };
  });

// Create session
const createSession = publicProcedure
  .input(z.object({ title: z.string().optional() }))
  .mutation(async ({ input }) => {
    const now = new Date();
    const defaultTitle = `Untitled session – ${now.toLocaleDateString()}`;
    const [session] = await db
      .insert(chatSessions)
      .values({ title: input.title || defaultTitle, createdAt: now, updatedAt: now })
      .returning();
    return session;
  });

// Add message
const addMessage = publicProcedure
  .input(
    z.object({ sessionId: z.number(), content: z.string().min(1), sender: z.enum(["user", "ai"]) })
  )
  .mutation(async ({ input }) => {
    const [inserted] = await db
      .insert(messages)
      .values({ sessionId: input.sessionId, content: input.content, sender: input.sender })
      .returning();

    await db
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.id, input.sessionId));
    return inserted;
  });

// Stub AI response
const generateStubbedAI = publicProcedure
  .input(z.object({ sessionId: z.number() }))
  .mutation(async ({ input }) => {
    await new Promise((res) => setTimeout(res, 500 + Math.random() * 500));

    const [lastUserMsg] = await db
      .select()
      .from(messages)
      .where(and(eq(messages.sessionId, input.sessionId), eq(messages.sender, "user")))
      .orderBy(desc(messages.createdAt))
      .limit(1);

    const reply = lastUserMsg
      ? `Echo: ${lastUserMsg.content}`
      : "Hello! I'm your AI assistant (stubbed).";

    const [inserted] = await db
      .insert(messages)
      .values({ sessionId: input.sessionId, content: reply, sender: "ai" })
      .returning();

    await db
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.id, input.sessionId));

    return inserted;
  });

const generateAI = publicProcedure
  .input(z.object({ sessionId: z.number() }))
  .mutation(async ({ input }) => {
    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, input.sessionId))
      .orderBy(desc(messages.createdAt))
      .limit(15);

    const ordered = history.reverse();

    // 🔥 Map DB sender to OpenAI roles
    const aiReply = await complete(
      ordered.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant", // ai → assistant
        content: m.content,
      }))
    );

    const [inserted] = await db
      .insert(messages)
      .values({
        sessionId: input.sessionId,
        content: aiReply,
        sender: "ai", // still "ai" in DB
      })
      .returning();

    // Update session.updatedAt
    const [session] = await db
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.id, input.sessionId))
      .returning();

    // Auto-title logic
    if (session?.title?.startsWith("Untitled")) {
      const titleSuggestion = await complete([
        {
          role: "system",
          content: "Summarize this conversation in 5 words or fewer, suitable as a chat title.",
        },
        ...ordered.map((m): { role: "user" | "assistant"; content: string } => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.content,
        })),
      ]);

      if (titleSuggestion && titleSuggestion.trim().length > 0) {
        await db
          .update(chatSessions)
          .set({ title: titleSuggestion.trim() })
          .where(eq(chatSessions.id, input.sessionId));
      }
    }

    return inserted;
  });

const renameSession = publicProcedure
  .input(z.object({ id: z.number(), title: z.string().min(1) }))
  .mutation(async ({ input }) => {
    const [updated] = await db
      .update(chatSessions)
      .set({ title: input.title, updatedAt: new Date() })
      .where(eq(chatSessions.id, input.id))
      .returning();
    return updated;
  });

export const chatRouter = router({
  listSessions,
  getSession,
  listMessages,
  createSession,
  addMessage,
  generateAI,
  generateStubbedAI,
  renameSession,
});
