// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Command from "../structures/Command.js";
import { SlashCommandBuilder } from "@discordjs/builders"
import { Interaction } from "discord.js";


// ----------------------------------------------------------------
//                             Command
// ----------------------------------------------------------------
export default class Rep {
  constructor () {
    this.name = 'rep';
    this.description = 'Displays the Reputation of a user.';
    this.global = false;
    this.data = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption( option => 
        option
          .setName('target')
          .setDescription('Selected User')
          .setRequired(false)
      )
  }

  /**
   * @param {Interaction} interaction
   * @returns {Promise<void>}
   * */
  execute = async (interaction) => {
    const bot = interaction.client;
    let user = interaction.options.getUser('target'); 
    if ( !user ) user = interaction.user;
    
    // Get data from db
    try {
      const sql = "SELECT * FROM rep WHERE serverid=$1 AND userid=$2;"
      const values = [interaction.guild.id, user.id];

      const result = await interaction.client.db.fetchOne(sql, values);
      const rep = result ? result.rep : 0 ;

      const msg = `Member \`${user.username}\` has \`${rep}\` rep.`;
      await interaction.reply(msg);

    } catch ( err ) {
      bot.logger.error(err);
    }

  }
}