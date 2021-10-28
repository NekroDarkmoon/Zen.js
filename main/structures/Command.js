import discord from 'discord.js';

/**
 * 
 * @param {discord.Message | discord.Interaction} msg 
 * @param {String[]} args 
 * @param {discord.Client} client 
 */
async function executeFunction (msg, args, client) {}

export default class Command {
  /**
   * @typedef {{name: string, description: string, run: executeFunction}} CommandOptions
   * @param {CommandOptions} options 
   */
  constructor (options) {
    this.name = options.name;
    this.description = options.description;
    this.run = options.run;
  }

  
} 