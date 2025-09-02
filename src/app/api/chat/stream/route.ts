import { NextRequest } from "next/server";
import { complete } from "@/lib/aiClient"; // your wrapper

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400 });
  }

  // Fetch last N messages from DB
  // (reuse chat.listMessages logic)
  // For now, dummy messages:
  const messages = [{ role: "user", content: "Hello AI!" }];

  const aiResp = await complete(messages);

  return new Response(aiResp, {
    headers: { "Content-Type": "text/plain" },
  });
}
