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
import { db } from '@repo/backend/dist/src/index.js';
import { quotes, channelsCache, guildsCache, usersCache, userConfigs } from '@repo/backend/dist/src/schema.js';
import { put } from '@vercel/blob';
import { eq } from '@repo/backend/dist/src/index.js';
import { cacheMessage, manuallyCleanContent } from '../../util.js';

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
		const quoteRes = await fetch('https://make-it-a-quote.starnumber12046.workers.dev/generate', {
			method: 'POST',
			body: JSON.stringify({
				text: content,
				displayName: author.displayName,
				username: author.username,
				avatarUrl: author.avatarURL({ extension: 'png', size: 4096 })! || 'https://cdn.discordapp.com/embed/avatars/0.png',
			}),
		});
		const image = Buffer.from(await quoteRes.arrayBuffer());
		await interaction.followUp({ files: [image] });
		// Check if the quoted user allows their messages to be saved as quotes.
		// Missing config means uploads are not allowed (opt-in).
		const [uploadConfig] = await db.select().from(userConfigs).where(eq(userConfigs.userId, author.id));
		if (!uploadConfig?.quoteUploadAllowed) {
			await interaction.followUp({
				content: `<@${author.id}> has not allowed quotes to be saved. The image above was not uploaded.`,
				ephemeral: true,
			});
			return;
		}
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
