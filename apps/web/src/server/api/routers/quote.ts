import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { desc, quotes, sql, usersCache } from "@repo/backend/src/schema";
import { eq } from "@repo/backend/src/index";
import { TRPCError } from "@trpc/server";
import { auth } from "~/auth";

export const quotesRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getQuotesAboutMe: publicProcedure.query(async ({ ctx }) => {
    const [discordAccount] = await auth.api.listUserAccounts(ctx);
    if (!discordAccount)
      throw new TRPCError({
        message: "This shouldn't happen :/",
        code: "UNAUTHORIZED",
      });
    const res = await auth.api.getAccessToken({
      body: {
        providerId: "discord",
      },
      headers: ctx.headers,
    });
    console.log("res", res);

    console.log("discordAccount", discordAccount);
    const userQuotes = await ctx.db
      .select()
      .from(quotes)
      .orderBy(desc(quotes.createdAt))
      .innerJoin(usersCache, eq(quotes.authorId, usersCache.userId))
      .where(eq(quotes.authorId, discordAccount.accountId));

    // Add cache details (users, channels, guilds) to the returned data for each quote
    return Promise.all(
      userQuotes.map(async ({ quote, users_cache: author }) => ({
        ...quote,
        author,
      })),
    );
  }),

  getMyQuotes: publicProcedure.query(async ({ ctx }) => {
    const [discordAccount] = await auth.api.listUserAccounts(ctx);
    console.log("auth", discordAccount);
    if (!discordAccount)
      throw new TRPCError({
        message: "This shouldn't happen :/",
        code: "UNAUTHORIZED",
      });
    const res = await auth.api.getAccessToken({
      body: {
        providerId: "discord",
      },
      headers: ctx.headers,
    });
    console.log("res", res);

    console.log("discordAccount", discordAccount);
    const userQuotes = await ctx.db
      .select()
      .from(quotes)
      .innerJoin(usersCache, eq(quotes.authorId, usersCache.userId))
      // Filter quotes to only include those belonging to the current user
      .where(eq(quotes.userId, discordAccount.accountId))
      // Order the results by creation date, descending
      .orderBy(desc(quotes.createdAt));

    // Add cache details (users, channels, guilds) to the returned data for each quote
    return Promise.all(
      userQuotes.map(async ({ quote, users_cache: author }) => ({
        ...quote,
        author,
      })),
    );
  }),

  getPublicQuotes: publicProcedure.query(async ({ ctx }) => {
    const publicQuotes = await ctx.db
      .select()
      .from(quotes)
      .orderBy(sql`RANDOM()`)
      .limit(50)
      .innerJoin(usersCache, eq(quotes.authorId, usersCache.userId))
      .where(eq(quotes.visibility, "PUBLIC"));

    // Add cache details (users, channels, guilds) to the returned data for each quote
    return Promise.all(
      publicQuotes.map(async ({ quote, users_cache: author }) => ({
        ...quote,
        author,
      })),
    );
  }),

  setQuoteVisibility: publicProcedure
    .input(
      z.object({
        quoteId: z.number(),
        visibility: z.enum(["PUBLIC", "PRIVATE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { quoteId, visibility } = input;

      const [discordAccount] = await auth.api.listUserAccounts(ctx);
      if (!discordAccount) throw new TRPCError({ code: "UNAUTHORIZED" });
      const quote = await ctx.db
        .select()
        .from(quotes)
        .where(eq(quotes.id, quoteId));
      if (!quote || quote.length === 0)
        throw new TRPCError({ code: "NOT_FOUND" });
      if (quote[0]?.userId !== discordAccount.accountId)
        throw new TRPCError({ code: "UNAUTHORIZED" });
      await ctx.db
        .update(quotes)
        .set({ visibility })
        .where(eq(quotes.id, quoteId));
    }),

  deleteQuote: publicProcedure
    .input(z.object({ quoteId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { quoteId } = input;

      const [discordAccount] = await auth.api.listUserAccounts(ctx);
      if (!discordAccount) throw new TRPCError({ code: "UNAUTHORIZED" });
      const quote = await ctx.db
        .select()
        .from(quotes)
        .where(eq(quotes.id, quoteId));
      if (!quote || quote.length === 0)
        throw new TRPCError({ code: "NOT_FOUND" });
      if (quote[0]?.userId !== discordAccount.accountId)
        throw new TRPCError({ code: "UNAUTHORIZED" });
      await ctx.db.delete(quotes).where(eq(quotes.id, quoteId));
    }),
});
