// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import discord from "discord.js";
import { Collection } from "@discordjs/collection";
import Command from "./Command.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import fs from "fs";

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


  /**
   * @returns {Promise<void>}
   */
  async deleteCommands () {
    try {
      await this.deleteGlobalCommands();
      await this.deleteGuildCommands();

      // TODO: Convert to logger
      console.log("Successfully deleted all application (/) commands");
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async deleteGuildCommands () {
    const commands = await this.getGuildCommands();
    if (commands.length <= 0) return;
    
    const promises = commands.map( async cmd => {
      this.rest.delete(
        Routes.applicationGuildCommand(
          this.config.client_id,
          this.config.guild_id,
          cmd.id
        )
      );
    });

    await Promise.all(promises);
  }

  /**
   * @returns {Promise<void>}
   */
  async deleteGlobalCommands () {
    const commands = await this.getGlobalCommands();
    if (commands.length <= 0) return;
    
    const promises = commands.map( async cmd => {
      this.rest.delete(
        Routes.applicationCommand(this.config.client_id, cmd.id)
      );
    });

    await Promise.all(promises);
  }


  /**
   * @returns {Promise<{id:string}[]>}
   */
  async getCommands () {
    try {
      return [...(await this.getGlobalCommands()),
         ...(await this.getGuildCommands())]
    } catch (err) {
      // TODO: Replace with logger
      console.error(err);
      return [];
    }
  } 

  /**
   * @returns {Promise<{id:string}[]>}
   */
  async getGuildCommands () {
    return this.rest.get(
      Routes.applicationGuildCommands(this.config.client_id, this.config.guild_id),
      // {body: this.guildCommands.mapValues( cmd => cmd.data.toJSON())}
    );
  }

  /**
   * @returns {Promise<{id:string}[]>}
   */ 
  async getGlobalCommands () {
    return this.rest.get(
      Routes.applicationCommands(this.config.client_id),
      // {body: this.guildCommands.mapValues( cmd => cmd.data.toJSON())}
    );
  }


  /**
   * @returns {Promise<void>}
   */
  async loadCommands () {
    /** @type {discord.Collection<string, Command>} */
    const commandFiles = fs
      .readdirSync(`./main/commands`)
      .filter((file) => file.endsWith(".js"));

    const promises = commandFiles.map( async file => {
      const cmdClass = (await import(`../commands/${file}`)).default;
      const command = new cmdClass();
      this.commands.set(command.name, command);
    });

    await Promise.all(promises);
    
    // console.log(this.commands);
    this.globalCommands = this.commands.filter( cmd => cmd.global);
    this.guildCommands = this.commands.filter( cmd => !cmd.global);
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
    const { size } = this.guildCommands;
    if (size <= 0) return;

    // TODO: Make to logger
    console.info(`Registering ${size} Guild commands.`);
    await this.rest.put(
      Routes.applicationGuildCommands(
        this.config.client_id,
        this.config.guild_id
      ),
      {body: this.guildCommands.mapValues( cmd => cmd.data.toJSON() )}
    );
  }

  /**
   * @returns {Promise<void>}
   */
  async registerGlobalCommands () {
    const { size } = this.globalCommands;
    if ( size <= 0) return;

    console.info(`Registering ${size} Global commands.`);
    await this.rest.put(
      Routes.applicationCommands(this.config.client_id),
      {body: this.globalComamnds.mapValues( cmd => cmd.data.toJSON())}
    );
  }

}