import "dotenv/config";
import { db } from "@/server/db";
import { users, chatSessions, messages } from "@/server/db/schema";

async function seed() {
  const [user] = await db
    .insert(users)
    .values({
      email: "demo@example.com",
      name: "Demo User",
    })
    .returning();

  const [session] = await db
    .insert(chatSessions)
    .values({
      userId: user.id,
      title: "Demo Counseling Session",
    })
    .returning();

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
}

seed()
  .then(() => {
    console.log("✅ Seed complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
