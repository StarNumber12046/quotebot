import { z } from "zod";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  channelsCache,
  guildsCache,
  quotes,
  usersCache,
} from "@repo/backend/src/schema";
import { eq } from "@repo/backend/src/index";
import { TRPCError } from "@trpc/server";

export const quotesRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getMyQuotes: publicProcedure.query(async ({ ctx }) => {
    const currentAuth = await auth();
    console.log("auth", currentAuth);
    if (!currentAuth)
      throw new TRPCError({
        message: "This shouldn't happen :/",
        code: "UNAUTHORIZED",
      });
    const clerk = await clerkClient();
    const userAccount = await clerk.users.getUser(currentAuth.userId!);
    const discordAccount = userAccount.externalAccounts?.find(
      (acc) => acc.provider === "oauth_discord",
    );
    if (!discordAccount)
      throw new TRPCError({
        message: "This shouldn't happen :/",
        code: "UNAUTHORIZED",
      });
    const userQuotes = await ctx.db
      .select()
      .from(quotes)
      .where(eq(quotes.userId, discordAccount.externalId));

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
