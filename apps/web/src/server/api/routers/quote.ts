import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  channelsCache,
  guildsCache,
  quotes,
  usersCache,
} from "@repo/backend/src/schema";
import { eq } from "@repo/backend/src/index";
import { TRPCError } from "@trpc/server";
import { auth } from "~/auth";
import { authClient } from "~/lib/auth-client";

export const quotesRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
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
      .where(eq(quotes.userId, discordAccount.accountId));

    // Add cache details (users, channels, guilds) to the returned data for each quote
    return Promise.all(
      userQuotes.map(async (quote) => ({
        ...quote,
        author: (
          await ctx.db
            .select()
            .from(usersCache)
            .where(eq(usersCache.userId, quote.authorId))
        )[0],
        channel: (
          await ctx.db
            .select()
            .from(channelsCache)
            .where(eq(channelsCache.channelId, quote.channelId))
        )[0],

        guild: quote.guildId
          ? (
              await ctx.db
                .select()
                .from(guildsCache)
                .where(eq(guildsCache.guildId, quote.guildId))
            )[0]
          : null,
      })),
    );
  }),
});
