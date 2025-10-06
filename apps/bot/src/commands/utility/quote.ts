import {
	ApplicationCommandType,
	InteractionContextType,
	Message,
	MessageContextMenuCommandInteraction,
} from 'discord.js';
import type { Command } from '../index.js';
import { loadImage, createCanvas, CanvasRenderingContext2D } from 'canvas';
import { ConvexHttpClient } from 'convex/browser';
import { db } from '@repo/backend/dist/src/index.js';
import { quotes, channelsCache, guildsCache, usersCache } from '@repo/backend/dist/src/schema.js';
import { put } from '@vercel/blob';
import { eq } from '@repo/backend/dist/src/index.js';

const httpClient = new ConvexHttpClient(process.env.CONVEX_URL!);

async function cacheMessage(message: Message) {
	console.log(`[DEBUG] [${new Date().toISOString()}] 📨 Starting cacheMessage for message ID: ${message.id}`);

	const { author, content, guild, id: targetId, channelId, channel, guildId } = message;
	console.log(`[DEBUG] Message details: author=${author.username}, guildId=${guildId}, channelId=${channelId}`);

	try {
		// CHANNEL CACHE
		const channelCacheExists = await db.select().from(channelsCache).where(eq(channelsCache.channelId, channelId));
		console.log(`[DEBUG] Channel cache query result for ${channelId}:`, channelCacheExists);
		// !! TO BE FIXED !!
		// if (!channelCacheExists?.length && channelId) {
		// 	console.log(`[DEBUG] ⚙️ Inserting new channel cache for ${channelId}`);
		// 	await db.insert(channelsCache).values({
		// 		channelId,
		// 		guildId: guildId ?? '',
		// 		name: 'name' in channel && typeof channel.name === 'string' ? channel.name : channelId,
		// 	});
		// } else {
		// 	console.log(`[DEBUG] 🔁 Updating existing channel cache for ${channelId}`);
		// 	await db
		// 		.update(channelsCache)
		// 		.set({
		// 			name: channelId,
		// 			updatedAt: new Date(),
		// 		})
		// 		.where(eq(channelsCache.channelId, channelId));
		// }

		// GUILD CACHE
		if (guildId && guild) {
			const guildCacheExists = await db.select().from(guildsCache).where(eq(guildsCache.guildId, guildId));
			console.log(`[DEBUG] Guild cache query result for ${guildId}:`, guildCacheExists);

			if (!guildCacheExists?.length) {
				console.log(`[DEBUG] 🏰 Inserting new guild cache for ${guild.name}`);
				await db.insert(guildsCache).values({
					guildId,
					image: guild.iconURL({ extension: 'png', size: 4096 })!,
					name: guild.name,
				});
			} else {
				console.log(`[DEBUG] 🔁 Updating existing guild cache for ${guild.name}`);
				await db
					.update(guildsCache)
					.set({
						name: guild.name,
						updatedAt: new Date(),
					})
					.where(eq(guildsCache.guildId, guildId));
			}
		}

		// USER CACHE
		const userCacheExists = await db.select().from(usersCache).where(eq(usersCache.userId, author.id));
		console.log(`[DEBUG] User cache query result for ${author.id}:`, userCacheExists);

		if (!userCacheExists?.length) {
			console.log(`[DEBUG] 👤 Inserting new user cache for ${author.username}`);
			await db.insert(usersCache).values({
				userId: author.id,
				username: author.username,
				name: author.username,
				avatarUrl: author.avatarURL({ extension: 'png', size: 4096 })!,
			});
		} else {
			console.log(`[DEBUG] 🔁 Updating existing user cache for ${author.username}`);
			await db
				.update(usersCache)
				.set({
					name: author.username,
					username: author.username,
					avatarUrl: author.avatarURL({ extension: 'png', size: 4096 })!,
					updatedAt: new Date(),
				})
				.where(eq(usersCache.userId, author.id));
		}

		console.log(`[DEBUG] [${new Date().toISOString()}] ✅ Finished caching for message ID: ${targetId}`);
	} catch (error) {
		console.error(`[ERROR] 💥 Failed to cache message ${targetId}:`, error);
	}
}

export default {
	data: {
		name: 'Quote this',
		type: ApplicationCommandType.Message,
		contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
	},
	async execute(interaction: MessageContextMenuCommandInteraction) {
		await interaction.deferReply();
		const { author, content, id: targetId } = interaction.targetMessage;
		console.log(interaction.targetMessage);
		const quote = (await fetch('https://api.voids.top/quote', {
			method: 'POST',
			body: JSON.stringify({
				text: content,
				display_name: author.displayName,
				username: author.username + (author.discriminator ? '#' + author.discriminator : ''),
				avatar: author.avatarURL({ extension: 'png', size: 4096 })!,
				color: false,
			}),
		}).then((res) => res.json())) as { success: boolean; url: string };
		await interaction.followUp({ files: [quote.url] });
		const image = await fetch(quote.url).then((res) => res.blob());
		const blobRes = await put('quote_' + targetId + '.png', image, { access: 'public', addRandomSuffix: true });
		await db.insert(quotes).values({
			quote: content,
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			messageId: targetId,
			authorId: author.id,
			imageStorageUrl: blobRes.url,
			userId: interaction.user.id,
		});
		await cacheMessage(interaction.targetMessage);
	},
} satisfies Command;
