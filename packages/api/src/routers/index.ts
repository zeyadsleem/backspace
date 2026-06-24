import { protectedProcedure, publicProcedure, router } from "../index";

import { staffRouter } from "./staff";
import { todayRouter } from "./today";

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
  today: todayRouter,
});
export type AppRouter = typeof appRouter;
