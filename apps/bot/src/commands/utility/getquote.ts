import { db } from '@repo/backend/dist/src/index.js';
import { quotes } from '@repo/backend/dist/src/schema.js';
import { eq } from '@repo/backend/dist/src/index.js';
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ChatInputCommandInteraction,
	InteractionContextType,
	MessageContextMenuCommandInteraction,
} from 'discord.js';
import { Command } from '../index.js';

export default {
	data: {
		name: 'getquote',
		description: 'Get a quote by its ID',
		options: [
			{
				name: 'id',
				description: 'The ID of the quote to get',
				type: ApplicationCommandOptionType.Integer,
			},
		],
	},
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const { options } = interaction;
		const id = options.getInteger('id');
		if (!id) {
			await interaction.followUp({
				content: 'No ID provided',
				ephemeral: true,
			});
			return;
		}
		const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
		if (!quote) {
			await interaction.followUp({
				content: 'No quote found with that ID',
				ephemeral: true,
			});
			return;
		}
		if (
			quote.visibility === 'PRIVATE' &&
			(quote.userId !== interaction.user.id || quote.authorId !== interaction.user.id)
		) {
			await interaction.followUp({
				content: 'You do not have permission to view this quote',
				ephemeral: true,
			});
			return;
		}
		await interaction.followUp({ files: [quote.imageStorageUrl] });
	},
} satisfies Command;
