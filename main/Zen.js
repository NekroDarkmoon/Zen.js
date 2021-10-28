import discord from 'discord.js';
const { Client, Collection, Message } = discord;
import fs from 'fs';
import Command from './structures/Command.js'; 

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
 * 
 * @class Zen
 */
export default class Zen {
  constructor (bot, config, db) {
    /** @type {ZenConfig} */
    this.config = config;
    
    /** @type {Client} */
    this.bot = bot;
  }

  async init () {
    // Checks

    this.setupCommands();
    this.createListeners();

    // Set token
    this.bot.login(this.config.token);
    this.bot.setMaxListeners(20);
  }

  /**
   * 
   */
  async setupCommands () {
    /**
     * @type {discord.Collection<string, Command>}
     */
    this.commands = new Collection();
    const commandFiles = fs.readdirSync('./main/commands')
      .filter(file => file.endsWith('.js'))
      .forEach(file => {
        try{
          /** @type {Command} */
          const command = await import(`./commands/${file}`);
          console.info(`Importing command ${command.name}`);
          this.commands.set(command.name, command);
        } catch (err) {
          console.error(`An error occured while importing ${file} - ${err}`);
        }
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

  async createListeners () {
    this.bot.once('ready', this.onReady.bind(this));
    this.bot.on('interactionCreate', this.onInteractionCreate.bind(this));
    this.bot.ws.on('INTERACTION_CREATE', this.onInteractionCreate.bind(this));
    this.bot.on('messageCreate', this.onMessageCreate.bind(this));
  }
}