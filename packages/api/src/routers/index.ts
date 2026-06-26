import { protectedProcedure, publicProcedure, router } from "../index";

import { checkInRouter } from "./check-in";
import { staffRouter } from "./staff";
import { spacesRouter } from "./spaces";
import { todayRouter } from "./today";
import { visitsRouter } from "./visits";

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
  checkIn: checkInRouter,
  spaces: spacesRouter,
  staff: staffRouter,
  today: todayRouter,
  visits: visitsRouter,
});
export type AppRouter = typeof appRouter;
