import "dotenv/config";
import { db } from "@/server/db";
import { users, chatSessions, messages } from "@/server/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  // 🧹 Clear existing demo data (safe for dev)
  await db.delete(messages);
  await db.delete(chatSessions);
  await db.delete(users).where(eq(users.email, "demo@example.com"));

  // Insert demo user
  const [user] = await db
    .insert(users)
    .values({
      email: "demo@example.com",
      name: "Demo User",
    })
    .returning();

  // Insert demo session
  const [session] = await db
    .insert(chatSessions)
    .values({
      userId: user.id,
      title: "Demo Counseling Session",
    })
    .returning();

  // Insert demo messages
  await db.insert(messages).values([
    {
      sessionId: session.id,
      sender: "user",
      content: "What career should I pursue?",
    },
    {
      sessionId: session.id,
      sender: "ai",
      content: "You might enjoy exploring software engineering!",
    },
  ]);

  // 🔍 Query back
  const allUsers = await db.select().from(users);
  const allSessions = await db.select().from(chatSessions).where(eq(chatSessions.userId, user.id));
  const allMessages = await db.select().from(messages).where(eq(messages.sessionId, session.id));

  console.log("✅ Seed complete");
  console.log("👤 Users:", allUsers);
  console.log("💬 Sessions:", allSessions);
  console.log("✉️ Messages:", allMessages);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  });
