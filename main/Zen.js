// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import discord from 'discord.js';
const { Client, Message, Intents } = discord;

import ZenDB from './utils/db/index.js';
import CommandHandler from './structures/CommandHandler.js';
import { caches } from './utils/utils.js';
import fs from "fs";
import winston from 'winston';


// ----------------------------------------------------------------
//                             Typedefs 
// ----------------------------------------------------------------
/**
 * @typedef {import("discord.js").Client} Client
 * @typedef {import("discord.js").Interaction} Interaction
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
  /**
   * @param {ZenConfig} config 
   * @param {ZenDB} db 
   * @param {winston.Logger} logger 
   */
  constructor (config, db, logger) {
    // Init Client with intents and partials
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
      partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER']
    });

    /** @type {ZenConfig} */
    this.config = config;

    /** @type {CommandHandler} */
    this.CommandHandler = new CommandHandler(this.config);

    /** @type {ZenDB} */
    this.db = db;

    /** @type {winston.Logger} */
    this.logger = logger;

    this.caches = {
      loggingChns: {},
      features: {},
      playCats: {}
    };
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

    // Cache Builder
    await this.buildCaches();

  }

  /**
   * @returns {Promise<void>}
   * @memberof Zen
   */
  async setupEventListeners () {
    const eventFiles = fs
      .readdirSync(`./main/events`)
      .filter((file) => file.endsWith(".js"));
    
    console.info(`Registering ${eventFiles.length} Events.`);
    eventFiles.forEach( async file => {
      const eventClass = (await import(`./events/${file}`)).default;
      const event = new eventClass(this);
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


  async buildCaches () {
   this.caches.loggingChns = await caches.cacheLogChns(this);
   this.caches.playCats = await caches.cachePlayChns(this);
   this.caches.features = await caches.cacheEnabled(this);
  }

}