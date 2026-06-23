import { protectedProcedure, publicProcedure, router } from "../index";

import { staffRouter } from "./staff";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  staff: staffRouter,
});
export type AppRouter = typeof appRouter;
