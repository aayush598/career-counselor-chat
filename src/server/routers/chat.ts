import { router, publicProcedure } from "../trpc/trpc";
import { z } from "zod";
import { db } from "../db";
import { chatSessions, messages } from "../db/schema";
import { desc, asc, eq, gt, and } from "drizzle-orm";
import { complete } from "@/lib/aiClient";

// List sessions
const listSessions = publicProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(50).default(10),
    })
  )
  .query(async ({ input }) => {
    const offset = (input.page - 1) * input.pageSize;
    const rows = await db
      .select()
      .from(chatSessions)
      .orderBy(desc(chatSessions.updatedAt))
      .limit(input.pageSize)
      .offset(offset);

    const total = Number((await db.execute(`SELECT COUNT(*) FROM chat_sessions`)).rows[0].count);

    return {
      sessions: rows,
      pagination: {
        page: input.page,
        pageSize: input.pageSize,
        total,
        totalPages: Math.ceil(total / input.pageSize),
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
      cursor: z.number().nullish(),
      limit: z.number().min(1).max(50).default(20),
    })
  )
  .query(async ({ input }) => {
    const conditions = [eq(messages.sessionId, input.sessionId)];
    if (input.cursor) conditions.push(gt(messages.id, input.cursor));

    const rows = await db
      .select()
      .from(messages)
      .where(and(...conditions))
      .orderBy(asc(messages.createdAt))
      .limit(input.limit);

    return { messages: rows, nextCursor: rows.length ? rows[rows.length - 1].id : null };
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

    const aiReply = await complete(
      ordered.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.content,
      }))
    );

    const [inserted] = await db
      .insert(messages)
      .values({
        sessionId: input.sessionId,
        content: aiReply,
        sender: "ai",
      })
      .returning();

    // Update session.updatedAt
    const [session] = await db
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.id, input.sessionId))
      .returning();

    // 🔥 Auto-title logic: only if still “Untitled…”
    if (session?.title?.startsWith("Untitled")) {
      const titleSuggestion = await complete([
        {
          role: "system",
          content: "Summarize this conversation in 5 words or fewer, suitable as a chat title.",
        },
        ...ordered.map((m) => ({
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
  renameSession, // 👈 add this
});
