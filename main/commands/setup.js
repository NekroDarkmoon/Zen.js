// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { SlashCommandBuilder } from '@discordjs/builders';
import { Channel, Interaction, Permissions } from 'discord.js';

// ----------------------------------------------------------------
//                             Setup
// ----------------------------------------------------------------
export default class Setup {
	constructor() {
		this.name = 'setup';
		this.description = 'Setup the bot for the server.';
		this.global = false;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.addSubcommand(sub =>
				sub
					.setName('loggingchannel')
					.setDescription('Select a channel for the bot to log to.')
					.addChannelOption(chn =>
						chn
							.setName('channel')
							.setDescription('Selected Channel')
							.setRequired(true)
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('enablelevels')
					.setDescription('Enable the leveling system for this guild')
					.addBooleanOption(c =>
						c.setName('choice').setDescription('True/False').setRequired(true)
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('enablerep')
					.setDescription('Enable the reputation system for this guild')
					.addBooleanOption(c =>
						c.setName('choice').setDescription('True/False').setRequired(true)
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('enableplaychns')
					.setDescription('Enable the play channel system for this guild')
					.addBooleanOption(b =>
						b.setName('choice').setDescription('True/False').setRequired(true)
					)
					.addChannelOption(c =>
						c
							.setName('channel')
							.setDescription('Selected Category for Personal Channels')
							.setRequired(true)
					)
			)
			.addSubcommandGroup(group =>
				group
					.setName('rolerewards')
					.setDescription('Set up role rewards for different systems.')
					.addSubcommand(sub =>
						sub
							.setName('set')
							.setDescription('Set a role as a reward.')
							.addStringOption(str =>
								str
									.setName('system')
									.setDescription(
										'Select the system for which the reward is awarded.'
									)
									.setRequired(true)
									.addChoice('Rep', 'rep')
									.addChoice('Xp', 'xp')
							)
							.addRoleOption(role =>
								role
									.setName('target')
									.setDescription('Selected role for reward.')
									.setRequired(true)
							)
							.addIntegerOption(int =>
								int
									.setName('value')
									.setDescription('Value for when reward is awarded')
									.setRequired(true)
							)
					)
					.addSubcommand(sub =>
						sub
							.setName('remove')
							.setDescription('Remove a role as a reward.')
							.addStringOption(str =>
								str
									.setName('system')
									.setDescription(
										'Select the system for which the reward is awarded.'
									)
									.setRequired(true)
									.addChoice('Rep', 'rep')
									.addChoice('Xp', 'xp')
							)
							.addRoleOption(role =>
								role
									.setName('target')
									.setDescription('Selected role to remove.')
									.setRequired(true)
							)
					)
			); // Next SubCommand
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void>}
	 * */
	execute = async interaction => {
		// Data builder
		/** @type {Zen} */
		const bot = interaction.client;
		if (!this.bot) this.bot = bot;

		// Validation - Permissions
		if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			const msg = `Error: Permissions not met - \`Administrator\``;
			await interaction.reply({ content: msg, ephemeral: true });
			return;
		}
		// Defer reply
		await interaction.deferReply();
		// Sanity Check if records exist in table.
		await this.sanityCheck(interaction);

		// Command Handler
		const sub = interaction.options.getSubcommand();
		switch (sub) {
			case 'loggingchannel':
				await this.setupLogChn(interaction);
				return;
			case 'enablelevels':
				await this.enableLevels(interaction);
				return;
			case 'enablerep':
				await this.enableRep(interaction);
				return;
			case 'set':
				await this.createReward(interaction);
				return;
			case 'remove':
				await this.removeReward(interaction);
			case 'enableplaychns':
				await this.enablePlayChannels(interaction);
		}
	};

	/**
	 *
	 * @param {Interaction} interaction
	 * @returns
	 */
	async sanityCheck(interaction) {
		// Data Builder
		const guild = interaction.guild;
		const owner = guild.ownerId;

		// Check if not exists then add.
		try {
			let sql = `SELECT * FROM settings WHERE server_id=$1 AND owner_id=$2;`;
			let vals = [guild.id, owner];
			const res = await this.bot.db.fetchOne(sql, vals);

			if (res) return;
			// Add to db
			sql = `INSERT INTO settings (server_id, owner_id)
                         VALUES ($1, $2);`;
			vals = [guild.id, owner];
			await this.bot.db.execute(sql, vals);
			return;
		} catch (e) {
			this.bot.logger.error(e);
			await interaction.editReply(
				'Error: `Internal Server Error`. Contact Bot Owner'
			);
			return;
		}
	}

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async setupLogChn(interaction) {
		// Data builder
		const channel = interaction.options.getChannel('channel');
		const guild = interaction.guild;
		const ownerId = guild.ownerId;

		// Update db
		try {
			const sql = `UPDATE settings SET logging_chn=$2
                   WHERE server_id=$1`;
			const values = [guild.id, channel.id];
			await this.bot.db.execute(sql, values);

			// Update Cache
			this.bot.caches.loggingChns[guild.id] = channel.id;
			// Send Interaction Update
			const msg = `Logging channel set to \`${channel.name}\``;
			await interaction.editReply(msg);
		} catch (err) {
			console.error(err);
			await interaction.editReply('Error - Logging Channel not set.');
			return;
		}
	}

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async enableLevels(interaction) {
		// Data Builder
		const answer = interaction.options.getBoolean('choice');
		const guild = interaction.guild;

		// Update db
		try {
			const sql = `UPDATE settings SET levels=$2
                   WHERE server_id=$1`;
			const vals = [guild.id, answer];
			await this.bot.db.execute(sql, vals);

			// Update Cache
			this.bot.caches.features[guild.id].levels = answer;
			// Send Interaction Update
			const msg = `Enabled leveling system.`;
			await interaction.editReply(msg);
		} catch (e) {
			console.error(e);
			await interaction.editReply('Error - Unable to update setting');
			return;
		}
	}

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async enableRep(interaction) {
		// Data Builder
		const answer = interaction.options.getBoolean('choice');
		const guild = interaction.guild;

		// Update DB
		try {
			const sql = `UPDATE settings SET rep=$2
                   WHERE server_id=$1`;
			const vals = [guild.id, answer];
			await this.bot.db.execute(sql, vals);
			// Update Cache
			this.bot.caches.features[guild.id].rep = answer;
			// Send Interaction Update
			const msg = `Enabled reputation system.`;
			await interaction.editReply(msg);
		} catch (e) {
			console.error(e);
			await interaction.editReply('Error - Unable to update setting');
			return;
		}
	}

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async createReward(interaction) {
		// Data Builder
		const guild = interaction.guild;
		const system = interaction.options.getString('system');
		const role = interaction.options.getRole('target');
		const value = interaction.options.getInteger('value');

		// Add to DB
		try {
			const sql = `INSERT INTO rewards (server_id, role_id, type, val)
                              VALUES ($1, $2, $3, $4);`;
			const vals = [guild.id, role.id, system, value];
			await this.bot.db.execute(sql, vals);

			// Send reply
			const msg = `\`${role.name}\` has been set as a reward for the \`${system}\` system`;
			await interaction.editReply(msg);
		} catch (e) {
			this.bot.logger.error(e);
			return;
		}
	}

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async removeReward(interaction) {
		// Data Builder
		const guild = interaction.guild;
		const role = interaction.options.getRole('target');
		const system = interaction.options.getString('system');

		// Remove from DB if exists
		try {
			const sql = `DELETE FROM rewards WHERE EXISTS
                  (SELECT * FROM rewards WHERE 
                    server_id=$1 AND role_id=$2 AND type=$3);`;
			const vals = [guild.id, role.id, system];
			await this.bot.db.execute(sql, vals);
			// Send reply
			const msg = `\`${role.name}\` has been set as a reward for the \`${system}\` system`;
			await interaction.editReply(msg);
		} catch (e) {
			this.bot.logger.error(e);
			return;
		}
	}

	/**
	 * @param {Interaction} interaction
	 */
	async enablePlayChannels(interaction) {
		// Data Builder
		const answer = interaction.options.getBoolean('choice');
		let channel = interaction.options.getChannel('channel');
		const guild = interaction.guild;

		if (!(channel.type === 'GUILD_CATEGORY')) {
			const msg = `Error: Selected Channel must be of type Category.`;
			await interaction.editReply(msg);
			return;
		}

		if (!answer) channel = null;

		// Update Db
		try {
			const sql = `UPDATE settings SET playchns=$1, playcat=$2
                    WHERE server_id=$3;`;
			const vals = [answer, channel?.id, guild.id];
			await this.bot.db.execute(sql, vals);
			// Update Cache
			this.bot.caches.features[guild.id].playchns = answer;
			this.bot.caches.playCats[guild.id] = channel?.id || null;
			// Send Reply
			const msg = `Playchannel settings updated.`;
			await interaction.editReply(msg);
		} catch (e) {
			this.bot.logger.error(e);
			interaction.editReply(`Error: Something went wrong.`);
			return;
		}
	}
}
