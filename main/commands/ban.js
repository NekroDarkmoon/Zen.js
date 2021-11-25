// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { SlashCommandBuilder } from '@discordjs/builders';
import {
	Interaction,
	MessageActionRow,
	MessageButton,
	Permissions,
} from 'discord.js';
import { confirmDenyView } from '../utils/ui/view.js';

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
export default class Ban {
	constructor() {
		this.name = 'ban';
		this.description = 'Bans a user from the server.';
		this.global = false;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.addUserOption(opt =>
				opt.setName('target').setDescription('Selected User').setRequired(true)
			)
			.addStringOption(opt =>
				opt.setName('reason').setDescription('Reason for ban.')
			);
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void>}
	 * */
	execute = async interaction => {
		// Validation - Permissions
		if (!interaction.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
			const msg = `Error: Permissions not met - \`Ban Members\``;
			await interaction.reply({ content: msg, ephemeral: true });
			return;
		}

		// Data builder
		const user = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason') || '';
		const channel = interaction.channel;
		const view = confirmDenyView('Ban');

		// Inital reply
		interaction.reply({
			content: `\`Are you sure you wish to ban ${user.username}\``,
			// ephemeral: true,
			components: view.toComponents(),
		});

		const collector = view.createCollector(channel, interaction);

		const f = async btnInteraction => {
			if (btnInteraction.component.customId === 'confirmBan') {
				await interaction.guild.members.ban(user.id);
				const msg = `Banned ${user.username} for the following reason:\n${reason}`;
				await btnInteraction.update({ content: msg, ephemeral: false });
			} else {
				await btnInteraction.update({ content: 'Action Cancelled.' });
			}
		};

		view.collect(f);
		view.end(interaction);
	};
}
