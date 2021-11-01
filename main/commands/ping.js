// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Command from "../structures/Command.js";
import { SlashCommandBuilder } from "@discordjs/builders"

export default class Ping extends Command {
  constructor () {
    super();
    this.name = 'ping';
    this.description = 'Responds with a latency to the server.';
    this.global = true;
    this.data = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }

  async executeFunction (interaction) {
    await interaction.reply("Pong!");
  }
}