import Command from "../structures/Command.js";

export class Ping extends Command {
  constructor () {
    this.name = 'ping';
    this.description = 'Sends a ping.';
    this.run = this.executeFunction(msg, args, client);   
  }
}