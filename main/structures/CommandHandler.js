// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import discord, { Guild, Permissions } from 'discord.js';
import { Collection } from '@discordjs/collection';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import Zen from '../Zen.js';
import fs, { readFileSync } from 'fs';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//  									REWORK THIS ENTIRE STRUCTURE

// ----------------------------------------------------------------
//                          Command Handler
// ----------------------------------------------------------------
export default class CommandHandler {
	/**
	 * @param {Zen} bot
	 */
	constructor(bot) {
		this.bot = bot;
		this.commands = new Collection();
		this.globalCommands = new Collection();
		this.guildCommands = new Collection();
		this.rest = new REST({ version: '9' }).setToken(this.bot.config.token);

		/** @type {import('./typedefs.js').ZenSlashPerms} */
		this._perms = JSON.parse(
			readFileSync(new URL('../settings/perms.json', import.meta.url))
		);
	}

	/**
	 * @returns {Promise<void>}
	 */
	async deleteCommands() {
		try {
			await this.deleteGlobalCommands();
			await this.deleteGuildCommands();

			this.bot.logger.info('Successfully deleted all application (/) commands');
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * @returns {Promise<void>}
	 */
	async deleteGuildCommands() {
		// Get Guilds
		const guilds = this.bot.config.guilds;

		try {
			guilds.forEach(async guildId => {
				const commands = await this.getGuildCommands(guildId);
				if (commands.length <= 0) return;
				const promises = commands.map(async cmd => {
					this.rest.delete(
						Routes.applicationGuildCommand(
							this.bot.config.client_id,
							guildId,
							cmd.id
						)
					);
				});

				await Promise.all(promises);
			});
		} catch (e) {
			this.bot.logger.error(e);
		}
	}

	/**
	 * @returns {Promise<void>}
	 */
	async deleteGlobalCommands() {
		const commands = await this.getGlobalCommands();
		if (commands.length <= 0) return;

		try {
			const promises = commands.map(async cmd => {
				this.rest.delete(
					Routes.applicationCommand(this.bot.config.client_id, cmd.id)
				);
			});

			await Promise.all(promises);
		} catch (e) {
			this.bot.logger.error(e);
		}
	}

	/**
	 * @returns {Promise<{id:string}[]>}
	 */
	async getCommands() {
		try {
			return [
				...(await this.getGlobalCommands()),
				...(await this.getGuildCommands()),
			];
		} catch (err) {
			this.bot.logger.error(err);
			return [];
		}
	}

	/**
	 * @param {Number} guildId
	 * @returns {Promise<{id:string}[]>}
	 */
	getGuildCommands(guildId = this.bot.config.guilds[0]) {
		return this.rest.get(
			Routes.applicationGuildCommands(
				this.bot.config.client_id,
				this.bot.config.guilds[this.bot.config.guilds.indexOf(guildId)]
			)
			// {body: this.guildCommands.mapValues( cmd => cmd.data.toJSON())}
		);
	}

	/**
	 * @returns {Promise<{id:string}[]>}
	 */
	async getGlobalCommands() {
		return this.rest.get(
			Routes.applicationCommands(this.bot.config.client_id)
			// {body: this.guildCommands.mapValues( cmd => cmd.data.toJSON())}
		);
	}

	/**
	 * @returns {Promise<void>}
	 */
	async loadCommands() {
		/** @type {discord.Collection<string, Command>} */
		const commandFiles = fs
			.readdirSync(`./main/commands`)
			.filter(file => file.endsWith('.js'));

		const promises = commandFiles.map(async file => {
			const cmdClass = (await import(`../commands/${file}`)).default;
			const command = new cmdClass();
			this.commands.set(command.name, command);
		});

		await Promise.all(promises);

		this.globalCommands = this.commands.filter(cmd => cmd.global);
		this.guildCommands = this.commands.filter(cmd => !cmd.global || cmd.global);
	}

	/**
	 * @returns {Promise<void>}
	 */
	async registerCommands() {
		try {
			// await this.registerGlobalCommands();
			await this.registerGuildCommands();
		} catch (err) {
			this.bot.logger.error(err);
		}
	}

	/**
	 * @returns {Promise<void>}
	 */
	async registerGuildCommands() {
		const { size } = this.guildCommands;
		if (size <= 0) return;

		this.bot.logger.info(`Registering ${size} Guild (/) commands.`);

		// Get main guilds
		const guilds = this.bot.config.guilds;

		guilds.forEach(async guildId => {
			try {
				await this.rest.put(
					Routes.applicationGuildCommands(this.bot.config.client_id, guildId),
					{ body: this.guildCommands.mapValues(cmd => cmd.data.toJSON()) }
				);
			} catch (e) {
				this.bot.logger.error(e);
			}
		});
	}

	/**
	 * @returns {Promise<void>}
	 */
	async registerGlobalCommands() {
		const { size } = this.globalCommands;
		if (size <= 0) return;

		this.bot.logger.info(`Registering ${size} Global (/) commands.`);
		try {
			await this.rest.put(
				Routes.applicationCommands(this.bot.config.client_id),
				{
					body: this.globalCommands.mapValues(cmd => cmd.data.toJSON()),
				}
			);
			this.bot.logger.info(`Successfully added ${size} global (/) commands.`);
		} catch (e) {
			this.bot.logger.error(e);
		}
	}

	/**
	 *
	 */
	async setSlashPerms() {
		const bot = this.bot;
		if (!bot.application?.owner) await bot.application.fetch();

		const _globalCommands = await bot.application.commands.fetch();
		const globalGuilds = bot.guilds.cache;

		globalGuilds.forEach(async g => {
			let fullPermissions = [];
			if (bot.config.guilds.includes(g.id)) {
				const _guildCommands = await g.commands.fetch();
				fullPermissions = [
					...(await this._permBuilder(_guildCommands, g, true)),
					...(await this._permBuilder(_globalCommands, g, false)),
				];
			} else {
				fullPermissions = await this._permBuilder(_globalCommands, g);
			}

			g.commands.permissions.set({ fullPermissions });
			bot.logger.info(
				`Set perms for ${fullPermissions.length} commands in guild ${g.id} - ${g.name}`
			);
		});
	}

	/**
	 *
	 * @param {Collection<string, discord.ApplicationCommand<{}>>} _commands
	 * @param {Guild} guild
	 * @param {Boolean} guildCmd
	 * @returns {Array<import('discord.js').GuildApplicationCommandPermissionData>} fullPermissions
	 */
	async _permBuilder(_commands, guild = null, guildCmd = false) {
		// Data Builder
		const commands = _commands.filter(cmd =>
			this._perms.commandNames.includes(cmd.name)
		);
		/** @type {Array<import('discord.js').GuildApplicationCommandPermissionData>} */
		const fullPermissions = [];
		const commandPerms = guildCmd ? 'guildPerms' : 'globalPerms';

		for (const [cmdName, perms] of Object.entries(this._perms[commandPerms])) {
			// Data Builder
			const cmd = commands.find(cmd => cmd.name === cmdName);
			const type = perms.type;
			const cmdPerms = perms.perms?.map(p => Permissions.FLAGS[p]);

			// Validation - No such command
			if (!cmd) {
				this.bot.logger.error(
					`${cmdName} perms not registered for ${guild.id} - ${guild.name}`
				);
				continue;
			}

			// Handle perm type
			if (type === 'USER') {
				const perm = { id: `${cmd.id}`, permissions: [perms] };

				// Add to main builder
				fullPermissions.push(perm);
			} else if (type === 'ROLE' && guild) {
				// Get role ids with perms
				const roles = await guild.roles.fetch();

				const roleIds = roles
					.filter(
						r =>
							r.permissions.has(cmdPerms) &&
							!r.tags?.botId &&
							!r.tags?.integrationId &&
							!r.tags?.premiumSubscriberRole
					)
					.map(r => r.id);

				// Add Perms to full permissions for each role
				const perm = { id: cmd.id, permissions: [] };
				roleIds.forEach(id =>
					perm.permissions.push({ id, type, permission: true })
				);

				// Add to main builder
				fullPermissions.push(perm);
			}
		}

		return fullPermissions;
	}
}
