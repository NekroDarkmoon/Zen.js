// ----------------------------------------------------------------
//                             Imports
// ----------------------------------------------------------------
import Zen from "../Zen.js";
import Paginator from "../structures/Paginator.js";
import { SlashCommandBuilder } from "@discordjs/builders"
import { Interaction, MessageEmbed, Permissions } from "discord.js";

// ----------------------------------------------------------------
//                             Command
// ----------------------------------------------------------------
export default class Levels {
  constructor () {
    this.name = 'xp';
    this.description = 'Commands Related to the Levelling system';
    this.global = false;
    this.data = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand( subcommand => 
        subcommand
          .setName('get')
          .setDescription('Displays the Level of a user.')
          .addUserOption( option => option.setName('target').setDescription('Selected User'))
      )
      .addSubcommand( subcommand => 
        subcommand
          .setName('givexp')
          .setDescription('Give xp to a user.')
          .addUserOption( option => 
            option
              .setName('target')
              .setDescription('Selected User')
              .setRequired(true)
          )
          .addIntegerOption( opt => 
            opt
              .setName('amount')
              .setDescription('XP given')
              .setRequired(true))
      )
      .addSubcommand( subcommand =>
        subcommand
          .setName('setxp')
          .setDescription('Set the xp of a user')
          .addUserOption( opt => opt.setName('target').setDescription('Selected User').setRequired(true))
          .addIntegerOption( opt => opt.setName('amount').setDescription('New Amount').setRequired(true))
      )
      .addSubcommand( subcommand =>
        subcommand
          .setName('xpboard')
          .setDescription('Display the leveling board for the server.')
          .addIntegerOption( option => option.setName('page').setDescription('Selected page to view.'))
      )
  }

  /**
   * @param {Interaction} interaction
   * @returns {Promise<void>}
   * */
  execute = async (interaction, ...args) => {
    // Get Bot & interface
    /** @type {Zen} */
    const bot = interaction.client;
    if (!this.bot) this.bot = bot;

    // Defer Reply
    await interaction.deferReply();
    // Execute based on subcommand
    const sub = interaction.options.getSubcommand();
    if (sub === "get") await this.getLevel(interaction);
    else if (sub === "givexp") await this.giveXp(interaction);
    else if (sub === 'xpboard') await this.xpBoard(interaction, args);
    else if (sub === 'setxp') await this.setXp(interaction);

    return;
  }


  /**
   * 
   * @param {Interaction} interaction 
   */
  async getLevel ( interaction ) {
    let user = interaction.options.getUser('target');
    if ( !user ) user = interaction.user;
    
    // Get Data from db
    try {
      // Get Level Information
      const sql = 'SELECT * FROM xp WHERE server_id=$1 AND user_id=$2'
      const vals = [interaction.guild.id, user.id];
      const res = await this.bot.db.fetchOne(sql, vals);
      // Get Message Information
      const sql2 = 'SELECT * FROM logger WHERE server_id=$1 AND user_id=$2'
      const vals2 = [interaction.guild.id, user.id];
      const res2 = await this.bot.db.fetchOne(sql2, vals2);
      // Message Builder
      const xp = res ? res.xp : 0;
      const level = res ? res.level : 0;
      const nXp = this.calcXp(level);
      const missXp = nXp - xp;
      const msgCount = res2 ? res2.mes_count : 0;
      // Message
      let msg = `You are level ${level}, with ${xp} xp.\n`;
      msg += `Level ${level+1} requires a total of ${nXp} xp: You need ${missXp} more.`

      const e = new MessageEmbed()
        .setThumbnail(user.avatarURL())
        .setTitle(user.username)
        .setDescription(msg)
        .addField("XP", `${xp}/${nXp}`, true)
        .addField("Level", `${level}`, true)
        .addField("Messages", `${msgCount}`, true)

      await interaction.editReply({embeds: [e]});

    } catch ( e ) {console.error(e); return;}
  }


  /**
   * 
   * @param {Interaction} interaction 
   */
  async giveXp ( interaction ) {
    // Data builder
    const member = interaction.member;
    const guild = interaction.guild;
    const user = interaction.options.getUser('target');
    const xp = interaction.options.getInteger('amount');
    // Validation - Admin
    if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      const msg = `Error: Permissions not ment. \`Administrator\` `;
      await interaction.editReply(msg);
    }

    // Get Existing
    let existing = null;
    try {
      const sql = 'SELECT * FROM xp WHERE server_id=$1 AND user_id=$2';
      const vals = [interaction.guild.id, user.id];
      existing = await this.bot.db.fetchOne(sql, vals); 
    } catch ( e ) {
      console.error(e);
      await interaction.editReply("Error: Unable to complete.");
      return;
    } 
    // Calculate Updated details
    const fXp = existing ? existing.xp + xp : xp;
    const level = this.calcLevel(fXp);


    // Update db with new data
    try {      
      if (!existing) {
        const sql = `INSERT INTO xp(server_id, user_id, xp, level)
                                VALUES ($1, $2, $3, $4);`;
        const vals = [guild.id, user.id, fXp, level];

        await this.bot.db.execute(sql, vals);
      } else {
        const sql = `UPDATE xp SET xp=$1,
                                   level=$2,
                                   last_xp=$3
                                   WHERE server_id=$4 AND user_id=$5`;
        const vals = [fXp, level, interaction.createdAt, guild.id, user.id];
        await this.bot.db.execute(sql, vals);
      }
    } catch ( e ) {
      console.error(e);
      await interaction.editReply("Error: Unable to Complete.");
      return;
    }
    
    const msg = `Gave \`${xp}\`xp to \`${user.username}\`. \`Accumulated xp: ${fXp}\` `;
    await interaction.editReply(msg);
  }

  async setXp ( interaction ) {}
  async xpBoard ( interaction, args ) {}


  /**
   * 
   * @param {Number} level 
   * @returns {Number} xp
   */
  calcXp ( level ) {
    const baseXp = 400;
    const inc = 200;
    return Math.floor((baseXp * level) + (inc * level * (level - 1 ) * 0.5 ));
  }


  /**
   * 
   * @param {Number} xp
   * @returns {Number} level 
   */
  calcLevel ( xp ) {
      let level = 1;
      while (xp >= this.calcXp(level)) level += 1;
      return (level)
  }
}