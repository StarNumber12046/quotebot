import {
	ApplicationCommandType,
	cleanContent,
	InteractionContextType,
	Message,
	MessageContextMenuCommandInteraction,
	MessageFlags,
} from 'discord.js';
import type { Command } from '../index.js';
import { loadImage, createCanvas, CanvasRenderingContext2D } from 'canvas';
import { ConvexHttpClient } from 'convex/browser';
import { db } from '@repo/backend/dist/src/index.js';
import { quotes, channelsCache, guildsCache, usersCache } from '@repo/backend/dist/src/schema.js';
import { put } from '@vercel/blob';
import { eq } from '@repo/backend/dist/src/index.js';
import { cacheMessage, manuallyCleanContent } from '../../util.js';

const httpClient = new ConvexHttpClient(process.env.CONVEX_URL!);

export default {
	data: {
		name: 'Quote this (but stealthy)',
		type: ApplicationCommandType.Message,
		contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
	},
	async execute(interaction: MessageContextMenuCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const { author, content: originalContent, id: targetId } = interaction.targetMessage;
		const content = manuallyCleanContent(originalContent, interaction.targetMessage);
		console.log(`[DEBUG] Quote content: ${content}`);
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
