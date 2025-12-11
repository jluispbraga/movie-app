import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getUserFavorites,
  addFavorite,
  removeFavorite,
  isFavorited,
} from "./db";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  movies: router({
    favorites: router({
      list: protectedProcedure.query(({ ctx }) =>
        getUserFavorites(ctx.user.id)
      ),
      add: protectedProcedure
        .input(
          z.object({
            ghibliMovieId: z.string(),
            title: z.string().optional(),
            description: z.string().optional(),
            releaseDate: z.string().optional(),
            runningTime: z.string().optional(),
          })
        )
        .mutation(({ ctx, input }) =>
          addFavorite(ctx.user.id, input.ghibliMovieId, {
            title: input.title,
            description: input.description,
            releaseDate: input.releaseDate,
            runningTime: input.runningTime,
          })
        ),
      remove: protectedProcedure
        .input(z.object({ ghibliMovieId: z.string() }))
        .mutation(({ ctx, input }) =>
          removeFavorite(ctx.user.id, input.ghibliMovieId)
        ),
      isFavorited: protectedProcedure
        .input(z.object({ ghibliMovieId: z.string() }))
        .query(({ ctx, input }) =>
          isFavorited(ctx.user.id, input.ghibliMovieId)
        ),
    }),
  }),
});

export type AppRouter = typeof appRouter;
