// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import discord from "discord.js";
import { Collection } from "@discordjs/collection";
import Command from "./Command.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import fs from "fs";
import { info } from "console";

// ----------------------------------------------------------------
//                          Command Handler
// ----------------------------------------------------------------
export default class CommandHandler {
  /**
   * @param {ZenConfig} config 
   */
  constructor (config) {
    this.config = config;
    this.commands = new Collection();
    this.globalComamnds = new Collection();
    this.guildCommands = new Collection();
    this.logger = null;
    this.rest = new REST({version: "9"}).setToken(this.config.token);
  }


  async deleteCommands () {}


  async deleteGuildCommands () {}


  async deleteGlobalCommands () {}


  async getCommands () {} 


  async getGuildCommands () {}


  async getGlobalCommands () {}

  /**
   * @returns {Promise<void>}
   */
  async loadCommands () {
    /** @type {discord.Collection<string, Command>} */
    const commandFiles = fs
      .readdirSync(`./main/commands`)
      .filter((file) => file.endsWith(".js"));

    const promises = commandFiles.map( async file => {
      console.log(`Importing ${file}`);
      const cmdClass = (await import(`../commands/${file}`)).default;
      const command = new cmdClass();
      this.commands.set(Command.name, command);
    });

    await Promise.all(promises);
    
    this.globalComamnds = this.commands.filter( cmd => cmd.global);
    this.guildComamnds = this.commands.filter( cmd => !cmd.global);
  }

  /**
   * @returns {Promise<void>}
   */
  async registerCommands () {
    try {
      await this.registerGlobalCommands();
      await this.registerGuildCommands();
    } catch ( err ) {
      // TODO: Switch to logger
      console.error(err);
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async registerGuildCommands () {
    const { size } = this.guildComamnds;
    
    if (size <= 0) return;

    // TODO: Make to logger
    console.info(`Registering ${size} Guild commands.`);
    await this.rest.put(
      Routes.applicationCommands(
        this.config.client_id,
        this.config.guildId
      ),
      {body: this.guildComamnds.mapValues( cmd => cmd.data.toJSON() )}
    );
  }

  /**
   * @returns {Promise<void>}
   */
  async registerGlobalCommands () {
    const { size } = this.guildComamnds;
    if ( size <= 0) return;

    await this.rest.put(
      Routes.applicationCommands(this.config.client_id),
      {body: this.globalComamnds.mapValues( cmd => cmd.data.toJSON )}
    );
  }

}