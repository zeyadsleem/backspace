import { protectedProcedure, publicProcedure, router } from "../index";

import { chargesRouter } from "./charges";
import { checkoutRouter } from "./checkout";
import { checkInRouter } from "./check-in";
import { spacesRouter } from "./spaces";
import { staffRouter } from "./staff";
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
  charges: chargesRouter,
  checkout: checkoutRouter,
  checkIn: checkInRouter,
  spaces: spacesRouter,
  staff: staffRouter,
  today: todayRouter,
  visits: visitsRouter,
});
export type AppRouter = typeof appRouter;
