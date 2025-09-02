import { chatRouter } from "./chat";
import { router, publicProcedure } from "../trpc/trpc";

export const appRouter = router({
  ping: publicProcedure.query(() => "pong"),
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
