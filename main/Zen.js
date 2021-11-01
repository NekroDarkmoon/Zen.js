// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import discord from 'discord.js';
const { Client, Message, Intents } = discord;

import CommandHandler from './structures/CommandHandler.js';
import fs from "fs";


// ----------------------------------------------------------------
//                             Typedefs 
// ----------------------------------------------------------------
/**
 * @typedef {import("discord.js").Client} Client
 * @typedef {import("discord.js").Interaction Interaction}
 * @typedef {import("discord.js").Message} Message
 * @typedef {import("discord.js").MessageReaction} MessageReaction
 * @typedef {import("discord.js").User} DiscordUser
 * @typedef {import("sequelize").Sequelize} Sequelize
 */


// ----------------------------------------------------------------
//                             Zen 
// ----------------------------------------------------------------
/**
 * Main class for Zen
 * @class Zen
 */
export default class Zen extends Client{
  constructor (config, db) {
    // Init Client with intents and partials
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
      ],
      partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER']
    });

    /** @type {ZenConfig} */
    this.config = config;

    /** @type {CommandHandler} */
    this.CommandHandler = new CommandHandler(this.config);

    // TODO: Other initers
    this.logger = null;
  }


  /**
   * @returns {Promise<void>}
   * @memberof Zen
   */
  async start () {
    if (!this.config.token) throw new Error("No discord token provided");

    // Setup event listeners
    await this.setupEventListeners();
    
    // Setup commands & interactions
    await this.CommandHandler.loadCommands();
    await this.CommandHandler.registerCommands();

    // Set token
    this.login(this.config.token);
    this.setMaxListeners(20);

  }

  /**
   * @returns {Promise<void>}
   * @memberof Zen
   */
  async setupEventListeners () {
    const eventFiles = fs
      .readdirSync(`./main/events`)
      .filter((file) => file.endsWith(".js"));
    
    eventFiles.forEach( async file => {
      const eventClass = (await import(`./events/${file}`)).default;
      const event = new eventClass();
      if ( event.once ) this.once(event.name, (...args) => event.execute(...args));
      else { this.on(event.name, (...args) => event.execute(...args)); }
    });
  }


  /**
   * 
   * @param {object} data 
   * @returns {boolean}
   * @memberof Zen
   */
  async fetchPartial (data) {
    if (data.partial) {
      try {await data.fetch()}
      catch (err) {
        console.error(`Something went wrong when fetching partial ${data.id}: `, error);
        return false;
      }
    }
    return true;
  }

  /**
   * 
   * @param {Interaction} interaction 
   */
  async onInteractionCreate (interaction) {
    // Validation
    if (!interaction.isCommand()) return;
    const command = this.bot.commands.get(interaction.commandName);
    if (!command) return;

    // Execute Interaction 
    try { await command.execute(interaction) }
    catch (err) {
      console.error( err );
      await interaction.reply({
        content: `Oops there was an error while executing this command. ${error}`,
        ephemeral: true 
      });
    }
  }

  async onMessageCreate (message) {

  }

  async onReady () {
    // TODO: Change how this works
    console.log(`Ready!`);
  }

  // async createListeners () {
  //   this.once('ready', this.onReady.bind(this));
  //   this.on('interactionCreate', this.onInteractionCreate.bind(this));
  //   this.ws.on('INTERACTION_CREATE', this.onInteractionCreate.bind(this));
  //   this.on('messageCreate', this.onMessageCreate.bind(this));
  // }
}