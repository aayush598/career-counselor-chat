import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // <-- your NextAuth config
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";

// Context
export async function createContext(_opts: CreateNextContextOptions) {
  const session = await getServerSession(authOptions);
  return { session };
}
export type Context = Awaited<ReturnType<typeof createContext>>;

// Init tRPC with context
const t = initTRPC.context<Context>().create();

// Public procedures = no auth required
export const publicProcedure = t.procedure;

// Protected procedures = require auth
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      // ✅ Guarantee that session.user exists for downstream resolvers
      session: ctx.session,
    },
  });
});

export const router = t.router;
