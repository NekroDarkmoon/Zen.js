// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { SlashCommandBuilder } from '@discordjs/builders';
import { CategoryChannel, Channel, Interaction, Permissions } from 'discord.js';
import Zen from '../Zen.js';

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
export default class PlayChannels {
	constructor() {
		this.name = 'playchn';
		this.description = 'Manage Private Channels on the server.';
		this.global = true;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.addSubcommand(sub =>
				sub
					.setName('create')
					.setDescription('Create a personal channel')
					.addStringOption(str =>
						str
							.setName('name')
							.setDescription('Name of Personal Channel')
							.setRequired(true)
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('delete')
					.setDescription('Delete a personal channel')
					.addChannelOption(chn => {
						chn
							.setName('textchannel')
							.setDescription('Selected text channel to delete.')
							.setRequired(true);
						chn.channelTypes = [0];
						return chn;
					})
					.addChannelOption(chn => {
						chn
							.setName('voicechannel')
							.setDescription('Associated voice channel to delete.')
							.setRequired(true);
						chn.channelTypes = [2];
						return chn;
					})
			)
			.addSubcommand(sub =>
				sub
					.setName('add')
					.setDescription('Choose users to add to the channel.')
					.addChannelOption(chn => {
						chn
							.setName('textchannel')
							.setDescription('Selected text channel to add users too.')
							.setRequired(true);
						chn.channelTypes = [0];
						return chn;
					})
					.addChannelOption(chn => {
						chn
							.setName('voicechannel')
							.setDescription('Associated voice channel to add users too.')
							.setRequired(true);
						chn.channelTypes = [2];
						return chn;
					})
					.addUserOption(usr =>
						usr.setName('user1').setDescription('User 01').setRequired(true)
					)
					.addUserOption(usr => usr.setName('user2').setDescription('User 02'))
					.addUserOption(usr => usr.setName('user3').setDescription('User 03'))
					.addUserOption(usr => usr.setName('user4').setDescription('User 04'))
					.addUserOption(usr => usr.setName('user5').setDescription('User 05'))
					.addUserOption(usr => usr.setName('user6').setDescription('User 06'))
					.addUserOption(usr => usr.setName('user7').setDescription('User 07'))
					.addUserOption(usr => usr.setName('user8').setDescription('User 08'))
					.addUserOption(usr => usr.setName('user9').setDescription('User 09'))
					.addUserOption(usr => usr.setName('user10').setDescription('User 10'))
			)
			.addSubcommand(sub =>
				sub
					.setName('remove')
					.setDescription('Choose users to remove from a channel.')
					.addChannelOption(chn => {
						chn
							.setName('textchannel')
							.setDescription('Selected text channel to remove users from.')
							.setRequired(true);
						chn.channelTypes = [0];
						return chn;
					})
					.addChannelOption(chn => {
						chn
							.setName('voicechannel')
							.setDescription('Associated voice channel to remove users from.')
							.setRequired(true);
						chn.channelTypes = [2];
						return chn;
					})
					.addUserOption(usr =>
						usr.setName('user1').setDescription('User 01').setRequired(true)
					)
					.addUserOption(usr => usr.setName('user2').setDescription('User 02'))
					.addUserOption(usr => usr.setName('user3').setDescription('User 03'))
					.addUserOption(usr => usr.setName('user4').setDescription('User 04'))
					.addUserOption(usr => usr.setName('user5').setDescription('User 05'))
					.addUserOption(usr => usr.setName('user6').setDescription('User 06'))
					.addUserOption(usr => usr.setName('user7').setDescription('User 07'))
					.addUserOption(usr => usr.setName('user8').setDescription('User 08'))
					.addUserOption(usr => usr.setName('user9').setDescription('User 09'))
					.addUserOption(usr => usr.setName('user10').setDescription('User 10'))
			)
			.addSubcommand(sub =>
				sub
					.setName('announce')
					.setDescription('Mention people that are subscribed to the channel')
			);
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void>}
	 * */
	execute = async interaction => {
		// Data builder
		/**@type {Zen} */
		const bot = interaction.client;
		if (!this.bot) this.bot = bot;
		const sub = interaction.options.getSubcommand();
		// Defer Reply
		await interaction.deferReply();
		// Validation - Enabled
		if (!this.bot.caches[interaction.guild.id].enabled.playChns) {
			await interaction.editReply('Error: System not setup.');
			return;
		}

		// Handler
		switch (sub) {
			case 'create':
				await this.createChn(interaction);
				return;

			case 'delete':
				await this.deleteChn(interaction);
				return;

			case 'add':
				await this.addUsers(interaction);
				return;

			case 'remove':
				await this.removeUsers(interaction);
				return;

			case 'announce':
				await this.mentionUsers(interaction);
				return;
		}
	};

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async createChn(interaction) {
		// Data Builder
		const channelName = interaction.options.getString('name');
		const guild = interaction.guild;

		// Fetch data from cache
		const channelId = this.bot.caches[guild.id].channels.playCat || null;
		if (!channelId) {
			await interaction.editReply('Error: System not active.');
			return;
		}

		// Get Play Channel Category and see if exists
		// Create Channel and add to db
		try {
			/**@type {CategoryChannel} */
			const cat = (await guild.channels.fetch(channelId)) || null;
			if (!cat) throw `Error: Category not fetched.`;

			// Get user data
			let sql = `SELECT * FROM playchns WHERE server_id=$1 AND user_id=$2;`;
			let vals = [guild.id, interaction.member.user.id];
			let res = await this.bot.db.fetchOne(sql, vals);

			// Check Count
			if (res) {
				const eCount = res.count;
				if (eCount > 2) {
					await interaction.editReply(
						'Error: Max limit of 3 channels reached.'
					);
					return;
				}
			}

			// Get Ready to create channel
			// Sanitize Function
			/**
			 * @param {String} name
			 * @returns {String}
			 */
			const sanitizeName = name => {
				return name
					.toLowerCase()
					.replace(/[^\w\s]/gi, '')
					.replaceAll(' ', '-')
					.slice(0, 20);
			};

			// Text Channel Perms
			const tPerms = [
				{ id: interaction.guild.id, deny: [Permissions.FLAGS.SEND_MESSAGES] },
				{
					id: interaction.user.id,
					allow: [
						Permissions.FLAGS.SEND_MESSAGES,
						Permissions.FLAGS.MANAGE_MESSAGES,
						Permissions.FLAGS.MANAGE_THREADS,
					],
					deny: [Permissions.FLAGS.MENTION_EVERYONE],
				},
			];

			// Voice Channel Perms
			const vPerms = [
				{ id: interaction.guild.id, deny: [Permissions.FLAGS.SPEAK] },
				{ id: interaction.user.id, allow: [Permissions.FLAGS.SPEAK] },
			];

			// Create Text Channel
			const tChn = await cat.createChannel(sanitizeName(channelName), {
				type: 'GUILD_TEXT',
				permissionOverwrites: tPerms,
			});

			// Create Voice Channel
			const vChn = await cat.createChannel(sanitizeName(channelName), {
				type: 'GUILD_VOICE',
				permissionOverwrites: vPerms,
			});

			// DB Array Prep
			const chns = [tChn.id, vChn.id];
			// Update Database
			if (res) {
				sql = `UPDATE playchns SET
                      count=playchns.count + $1,
                      chns = $2
                      WHERE server_id=$3 AND user_id=$4;`;
				vals = [1, [...chns, ...res.chns], guild.id, interaction.user.id];
			} else {
				sql = `INSERT INTO playchns(server_id, user_id, count, chns)
                           VALUES ( $1, $2, $3, $4);`;
				vals = [guild.id, interaction.user.id, 1, chns];
			}
			await this.bot.db.execute(sql, vals);

			// Reply
			const msg = `Successfully set up Play Channels. <#${tChn.id}>`;
			await interaction.editReply(msg);
		} catch (e) {
			this.bot.logger.error(e);
			await interaction.editReply('Error: Something Went Wrong.');
			return;
		}
	}

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async deleteChn(interaction) {
		// Data Builder
		const guild = interaction.guild;
		const author = interaction.member;
		/**@type {Channel} */
		const tChannel = interaction.options.getChannel('textchannel');
		/**@type {Channel} */
		const vChannel = interaction.options.getChannel('voicechannel');
		/**@type {CategoryChannel} */
		const cat = await guild.channels.fetch(
			this.bot.caches[guild.id].channels.playCat
		);

		// Validation - Play Channel
		if (tChannel.parentId !== cat.id || vChannel.parentId !== cat.id) {
			await interaction.editReply(`Error: Channel(s) aren't play channel(s).`);
			return;
		}

		// DB Fetch
		try {
			let sql = 'SELECT * FROM playchns WHERE server_id=$1 AND user_id=$2;';
			let vals = [guild.id, author.user.id];
			let res = await this.bot.db.fetchOne(sql, vals);

			// Validation - Owned
			if (!res) {
				await interaction.editReply(
					'Error: This Channel does not belong to you.'
				);
				return;
			}
			const ownedChns = res.chns;
			if (author.user.id !== guild.ownerId) {
				if (
					!(ownedChns.includes(tChannel.id) && ownedChns.includes(vChannel.id))
				) {
					await interaction.editReply(
						'Error: This Channel does not belong to you.'
					);
					return;
				}
			}
			// TODO: Ask for confirmation

			// Modify channels array
			const chns = res.chns.filter(
				id => !(id === tChannel.id || id === vChannel.id)
			);

			// Delete Channels
			await tChannel.delete();
			await vChannel.delete();

			// Remove from DB
			sql = `UPDATE playchns SET
                        count=playchns.count - $1,
                        chns=$2
                        WHERE server_id=$3 AND user_id=$4`;
			vals = [1, chns, guild.id, author.user.id];
			await this.bot.db.execute(sql, vals);

			// Validation - Deleted message in selected channel
			if (interaction.channelId === tChannel.id) {
				return;
			}

			// Interaction Reply
			const msg = `Selected Channels have been Successfully Deleted`;
			await interaction.editReply(msg);
			return;
		} catch (e) {
			this.bot.logger.error(e);
			await interaction.reply('Error: Something Went Wrong.');
			return;
		}
	}

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async addUsers(interaction) {
		// Data Builder
		const guild = interaction.guild;
		const author = interaction.member;
		/**@type {Channel} */
		const tChannel = interaction.options.getChannel('textchannel');
		/**@type {Channel} */
		const vChannel = interaction.options.getChannel('voicechannel');
		/**@type {CategoryChannel} */
		const cat = await guild.channels.fetch(
			this.bot.caches[guild.id].channels.playCat
		);
		let users = [];
		let count = 1;
		while (count <= 10) {
			try {
				users.push(interaction.options.getUser(`user${count}`));
			} catch (e) {}
			count += 1;
		}
		// Sanitize - Empty
		users = users.filter(u => u);
		// Validation - Play Channel
		if (tChannel.parentId !== cat.id || vChannel.parentId !== cat.id) {
			await interaction.editReply(`Error: Channel(s) aren't play channel(s).`);
			return;
		}

		// DB Fetch
		try {
			let sql = 'SELECT * FROM playchns WHERE server_id=$1 AND user_id=$2;';
			let vals = [guild.id, author.user.id];
			let res = await this.bot.db.fetchOne(sql, vals);
			// Validation - Owned
			if (!res) {
				await interaction.editReply(
					'Error: This Channel does not belong to you.'
				);
				return;
			}
			const ownedChns = res.chns;
			if (author.user.id !== guild.ownerId) {
				if (
					!(ownedChns.includes(tChannel.id) && ownedChns.includes(vChannel.id))
				) {
					await interaction.editReply(
						'Error: This Channel does not belong to you.'
					);
					return;
				}
			}

			// Add users to channels
			users.forEach(async user => {
				await tChannel.permissionOverwrites.edit(user.id, {
					SEND_MESSAGES: true,
				});
				await vChannel.permissionOverwrites.edit(user.id, { SPEAK: true });
			});

			// Reply
			let msg = `User(s) `;
			users.forEach(u => (msg += `\`${u.username}\` `));
			msg += `have been added to <#${tChannel.id}> and <#${vChannel.id}>`;
			await interaction.editReply(msg);

			return;
		} catch (e) {
			this.bot.logger.error(e);
			await interaction.reply('Error: Something Went Wrong.');
			return;
		}
	}

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async removeUsers(interaction) {
		// Data Builder
		const guild = interaction.guild;
		const author = interaction.member;
		/**@type {Channel} */
		const tChannel = interaction.options.getChannel('textchannel');
		/**@type {Channel} */
		const vChannel = interaction.options.getChannel('voicechannel');
		/**@type {CategoryChannel} */
		const cat = await guild.channels.fetch(
			this.bot.caches[guild.id].channels.playCat
		);
		let users = [];
		let count = 1;
		while (count <= 10) {
			try {
				users.push(interaction.options.getUser(`user${count}`));
			} catch (e) {}
			count += 1;
		}
		// Sanitize - Empty
		users = users.filter(u => u);
		// Validation - Play Channel
		if (tChannel.parentId !== cat.id || vChannel.parentId !== cat.id) {
			await interaction.editReply(`Error: Channel(s) aren't play channel(s).`);
			return;
		}

		// DB Fetch
		try {
			let sql = 'SELECT * FROM playchns WHERE server_id=$1 AND user_id=$2;';
			let vals = [guild.id, author.user.id];
			let res = await this.bot.db.fetchOne(sql, vals);
			// Validation - Owned
			if (!res) {
				await interaction.editReply(
					'Error: This Channel does not belong to you.'
				);
				return;
			}
			const ownedChns = res.chns;
			if (author.user.id !== guild.ownerId) {
				if (
					!(ownedChns.includes(tChannel.id) && ownedChns.includes(vChannel.id))
				) {
					await interaction.editReply(
						'Error: This Channel does not belong to you.'
					);
					return;
				}
			}

			// Add users to channels
			users.forEach(async user => {
				await tChannel.permissionOverwrites.delete(user.id);
				await vChannel.permissionOverwrites.delete(user.id);
			});

			// Reply
			let msg = `User(s) `;
			users.forEach(u => (msg += `\`${u.username}\` `));
			msg += `have been removed from <#${tChannel.id}> and <#${vChannel.id}>`;
			await interaction.editReply(msg);

			return;
		} catch (e) {
			this.bot.logger.error(e);
			await interaction.reply('Error: Something Went Wrong.');
			return;
		}
	}

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async mentionUsers(interaction) {
		// Data builder
		const guild = interaction.guild;
		const author = interaction.member;
		const channel = interaction.channel;
		let ownedChns = null;

		// DB data
		try {
			const sql = 'SELECT * FROM playchns WHERE server_id=$1 AND user_id=$2;';
			const vals = [guild.id, author.user.id];
			const res = await this.bot.db.fetchOne(sql, vals);

			if (res) {
				ownedChns = res.chns;
			}
		} catch (e) {
			this.bot.logger.error(e);
		}

		// Validation - Owner
		if (ownedChns) {
			if (!ownedChns.includes(channel.id)) {
				await interaction.editReply(
					"Error: This channel doesn't belong to you."
				);
				return;
			}
		} else {
			await interaction.editReply("Error: This channel doesn't belong to you.");
			return;
		}

		// Get Perms of a channel
		const chnPerms = channel.permissionOverwrites.cache;
		const users = chnPerms
			.filter(perm => perm.type === 'member')
			.map(perm => perm.id);

		// Send Mention
		let msg = ``;
		users.forEach(u => (msg += `<@!${u}> `));
		await interaction.editReply(msg);
	}
}
