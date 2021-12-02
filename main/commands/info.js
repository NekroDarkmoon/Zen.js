// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction, MessageEmbed, Permissions, User } from 'discord.js';
import Zen from '../Zen.js';
import os from 'os';

// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
export default class Info {
	constructor() {
		this.name = 'info';
		this.description = 'Display information about the specified target.';
		this.global = false;
		this.data = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.addSubcommand(sub =>
				sub
					.setName('user')
					.setDescription("Displays a user's information.")
					.addUserOption(opt =>
						opt
							.setName('target')
							.setDescription('Selected User.')
							.setRequired(true)
					)
					.addBooleanOption(opt =>
						opt.setName('hidden').setDescription('Set Ephemeral')
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('server')
					.setDescription("Displays the server's information.")
					.addBooleanOption(opt =>
						opt.setName('hidden').setDescription('Set Ephemeral')
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('self')
					.setDescription('Displays information on the bot.')
					.addBooleanOption(opt =>
						opt.setName('hidden').setDescription('Set Ephemeral')
					)
			)
			.addSubcommand(sub =>
				sub
					.setName('role')
					.setDescription('Displays information about a role.')
					.addRoleOption(role =>
						role
							.setName('target')
							.setDescription('Selected Role.')
							.setRequired(true)
					)
					.addBooleanOption(opt =>
						opt.setName('hidden').setDescription('Set Ephemeral')
					)
			);
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void>}
	 * */
	execute = async interaction => {
		// Validation?

		// Data builder
		/**@type {Zen} */
		const bot = interaction.client;
		if (!this.bot) this.bot = bot;
		const sub = interaction.options.getSubcommand();

		// Handler
		switch (sub) {
			case 'user':
				await this.userInfo(interaction);
				return;
			case 'server':
				await this.serverInfo(interaction);
				return;
			case 'self':
				await this.selfInfo(interaction);
				return;
			case 'role':
				await this.roleInfo(interaction);
				return;
		}
	};

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async userInfo(interaction) {
		// Defer reply
		const hidden = interaction.options.getBoolean('hidden');
		await interaction.deferReply({ ephemeral: hidden });
		// Data builder
		/** @type {User || GuildMember} */
		const user = interaction.options.getUser('target');
		const member = await interaction.guild.members.fetch(user.id);
		const bts = '```diff\n';
		const bt = '```';
		const e = new MessageEmbed();

		// Basic information
		e.setAuthor(user.username);
		e.addField('ID', `${bts} ${user.id} ${bt}`, true);
		// Get shared servers
		const shared = 'In Progress';
		e.addField('Servers', `${bts} ${shared} ${bt}`, true);
		// Joined
		const joined = member.joinedAt.toDateString();
		e.addField('Joined', `${bts} ${joined} ${bt}`, false);
		// Created
		const created = user.createdAt.toDateString();
		e.addField('Created', `${bts} ${created} ${bt}`, true);
		// Get roles
		const roles = member.roles.cache;
		if (roles) {
			const roleNames = roles.map(role => role.name.replace('@', '@\u200b'));
			const data =
				roles.size > 10 ? `${roles.size} roles` : roleNames.join(', ');
			e.addField('Roles', `${bts} ${data} ${bt}`, false);
		}

		// Add color
		const color = user.hexAccentColor || 'RANDOM';
		e.setColor(color);
		// Add Avatar
		const avatar = user.avatarURL();
		if (avatar) e.setThumbnail(avatar);

		// TODO: Add last message

		// Set Footer
		const footer = Date();
		e.setFooter(`Generated at ${footer}`);

		// Send embed
		await interaction.editReply({ embeds: [e], ephemeral: hidden });
	}

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async serverInfo(interaction) {
		// Defer Reply
		await interaction.deferReply();
		// Data Builder
		const e = new MessageEmbed().setColor('RANDOM');
		const guildId = interaction.guild.id;
		const guild = await this.bot.guilds.fetch(guildId);
		const owner = await guild.fetchOwner();
		// Get roles on the server
		const roles = Array.from(
			guild.roles.cache.mapValues(r => r.name.replace('@', '@\u200b'))
		);

		// Find Secret Channels
		const defRole = guild.roles.everyone;
		const defPerms = defRole.permissions;
		const secrets = {};
		const totals = {};

		const channels = guild.channels.cache;
		channels.forEach(chn => {
			const perms = Permissions.FLAGS;
			const type = chn.type;
			if (!totals[type]) totals[type] = 0;
			totals[type] += 1;

			if (!secrets[type]) secrets[type] = 0;
			if (!chn.permissionsFor(defRole).has(perms.VIEW_CHANNEL))
				secrets[type] += 1;
			else if (type === 'GUILD_VOICE' && !(perms.CONNECT || perms.SPEAK))
				secrets[type] += 1;
		});

		// Set up embed
		e.setTitle(guild.name);
		e.setDescription(`**ID**: ${guild.id}\n**Owner**: ${owner.user.tag}`);
		// Add image
		const avatar = guild.iconURL();
		if (avatar) e.setThumbnail(avatar);
		// Setup channel info
		const channelInfo = [];
		const key_to_emoji = {
			GUILD_CATEGORY: ':open_file_folder:',
			GUILD_TEXT: '<:text_channel:586339098172850187>',
			GUILD_VOICE: '<:voice_channel:586339098524909604>',
			GUILD_NEWS: ':loudspeaker:',
			GUILD_PUBLIC_THREAD: ':thread:',
		};

		for (const [key, value] of Object.entries(totals)) {
			const secret = secrets[key];
			try {
				const emoji = key_to_emoji[key];
				if (!emoji) continue;
				if (secret) channelInfo.push(`${emoji} ${value} (${secret}) locked.`);
				else channelInfo.push(`${emoji} ${value}`);
			} catch (err) {
				continue;
			}
		}

		// Setup Feature info
		const features = guild.features;
		const all_features = {
			ANIMATED_ICON: 'Animated Icon',
			BANNER: 'Banner',
			COMMERCE: 'Commerce',
			COMMUNITY: 'Community Server',
			DISCOVERABLE: 'Server Discovery',
			FEATURABLE: 'Featured',
			INVITE_SPLASH: 'Invite Splash',
			NEWS: 'News Channels',
			PARTNERED: 'Partnered',
			VANITY_URL: 'Vanity Invite',
			VERIFIED: 'Verified',
			VIP_REGIONS: 'VIP Voice Servers',
			WELCOME_SCREEN_ENABLED: 'Welcome Screen',
			LURKABLE: 'Lurkable',
			TICKETED_EVENTS_ENABLED: 'Ticketed Events',
			MONETIZATION_ENABLED: 'Monetization Enabled',
			THREE_DAY_THREAD_ARCHIVE: 'Thread Archive Time - 3 Days',
			SEVEN_DAY_THREAD_ARCHIVE: 'Thread Archive Time - 7 Days',
			PRIVATE_THREADS: 'Private Threads',
			ROLE_ICONS: 'Role Icons',
		};
		const info = [];
		for (const [feature, label] of Object.entries(all_features)) {
			if (features.includes(feature)) info.push(`:white_check_mark: ${label}`);
		}

		// Add feature List
		if (info.length > 0) e.addField('Features', info.join('\n'), true);
		// Add channel List
		e.addField('Channels', channelInfo.join('\n'), true);
		// Add Boosts
		if (guild.premiumTier !== 'NONE') {
			let boosts = `Level ${guild.premiumTier.charAt(
				guild.premiumTier.length - 1
			)}`;
			boosts += `\n${guild.premiumSubscriptionCount} boosts`;
			e.addField('Boosts', boosts, false);
		}
		// Add NSFW Information
		const nsfw_lvl = {
			DEFAULT: 'Default',
			EXPLICIT: 'Explicit',
			SAFE: 'Safe',
			AGE_RESTRICTED: 'Age Restricted',
		};
		e.addField('NSFW Level', nsfw_lvl[guild.nsfwLevel], true);

		// Add member count
		const memCount = guild.memberCount;
		const botCount = Array.from(
			guild.members.cache.filter(mem => mem.user.bot)
		);
		e.addField('Members', `Total: ${memCount} (${botCount.length} bots)`, true);
		// Add role count
		if (roles) {
			const data =
				roles.length > 10 ? `${roles.length} roles` : roles.join(', ');
			e.addField('Roles', data, false);
		}

		// Add Emoji Count
		const emojiStats = {
			animated: 0,
			animatedDisabled: 0,
			regular: 0,
			disabled: 0,
		};
		guild.emojis.cache.forEach(emoji => {
			if (emoji.animated) {
				emojiStats.animated += 1;
				if (!emoji.available) emojiStats.animatedDisabled += 1;
			} else {
				emojiStats.regular += 1;
				if (!emoji.available) emojiStats.disabled += 1;
			}
		});
		let emojiMsg = `Regular: ${emojiStats.regular} (${emojiStats.disabled} disabled).\n`;
		emojiMsg += `Animated: ${emojiStats.animated} (${emojiStats.animatedDisabled} disabled).\n`;
		e.addField('Emojis', emojiMsg, true);
		// Created Date
		e.setFooter(`Created at: ${guild.createdAt.toDateString()}`);

		await interaction.editReply({ embeds: [e] });
	}


	/**
	 *
	 * @param {Interaction} interaction
	 */
	async selfInfo(interaction) {
		// Defer Reply
		await interaction.deferReply();
		// // Data Builder
		// const bot = this.bot;
		// const e = new MessageEmbed();

		// // Add Title & Description
		// e.setTitle(bot.application.name || "Not Set");
		// e.setDescription(bot.application.description || "Not Set");

		// // Add ID, Shards, GuildCount, MemberCount & Commands count
		// e.addField("ID", bot.application.id, true);
		// e.addField("Guilds", (bot.guilds.cache).length, true);
		// e.addField("Members", bot.users.cache.length, true);
		// e.addField("Commands", bot.application.commands.cache.length, true);

		// // Add Uptime
		// // e.addField("Usage", usage, true);
		// // Add CPU & MEM usage

		// // Add links
		// const links = `\`\``;
		// // Add Created at
		// e.setFooter(`Created At: ${bot.application.createdAt.toDateString()}`);
		// await interaction.editReply({embeds:[e]});
	}

	/**
	 *
	 * @param {Interaction} interaction
	 */
	 async roleInfo(interaction) {
		// Defer Reply
		const hidden = interaction.options.getBoolean('hidden');
//		let page = interaction.options.getInteger('page');
//		page = !page ? 1 : page;

		//await interaction.deferReply();
		await interaction.deferReply({ ephemeral: hidden });
		// Data builder
		/** @type {Role} */
		const role = interaction.options.getRole('target');
		const e = new MessageEmbed();

		// Set up embed
		const name = role.name
		e.setTitle(`Role: @{name}`);

		const guild = role.guild.name;
		e.addField('Server', guild, false);

		const color = role.hexColor;
		e.setColor(color);

		const members = role.members;
		e.addField('Number of members', members.size, false);

//		if (nmembers > 0) {
//			const memberNames = members.map(member => member.displayName);
//			const data = nmembers < 10 ? `${nmembers} members: `.concat(memberNames.join(', ')) : `${nmembers} members`;
//			e.addField('Members', data, false);
//		} else {
//			e.addField('Members', 'No members', false);
//		} 
		
//		await interaction.editReply({ embeds: [e], ephemeral: hidden });



		// Modify results to needs
		let modifiedResult = [];
		members.forEach(async member => {
			const temp = {};
			temp.member = member;
			modifiedResult.push(temp);
		});

		// Setup Formatter
		const pageConf = {
			member: { align: 'left' }
		};

		// Construct Paginator
		const paginator = new TabulatedPages('Members in role', data, pageConf);

		// Construct Embed
		const f = new MessageEmbed()
			.setColor('DARK_GOLD')
			.setTitle('Members in role')
			.setDescription(paginator._prepareData(page));

		// Send reply
		await interaction.editReply({
			embeds: [e, f],
			components: paginator.components,
		});

		// Start Collecting
		try {
			await paginator.onInteraction(interaction);
		} catch (e) {
			this.logger.error(e);
			return;
		}
	}

}
