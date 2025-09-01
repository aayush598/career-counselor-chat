import { router, publicProcedure } from "./trpc";
import { z } from "zod";

export const appRouter = router({
  ping: publicProcedure.query(() => {
    return "pong";
  }),
});

export type AppRouter = typeof appRouter;
