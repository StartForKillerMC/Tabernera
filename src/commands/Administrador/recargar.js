const { Command, Stopwatch, Store } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['r'],
			permissionLevel: 9,
			description: (msg) => msg.language.get('COMMAND_RELOAD_DESCRIPTION'),
			usage: '<Store:store|Piece:piece>',
			extendedHelp: '+recargar encuesta',
			comando: '+recargar <Módulo>'
		});
	}

	async run(message, [piece]) {
		if (piece instanceof Store) {
			const timer = new Stopwatch();
			await piece.loadAll();
			await piece.init();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
					if (this.shard.id !== ${this.client.shard.id}) this.${piece.name}.loadAll().then(() => this.${piece.name}.loadAll());
				`);
			}
			return message.sendMessage(`${message.language.get('COMMAND_RELOAD_ALL', piece)} (Took: ${timer.stop()})`);
		}

		try {
			const itm = await piece.reload();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
					if (this.shard.id !== ${this.client.shard.id}) this.${piece.store}.get('${piece.name}').reload();
				`);
			}
			return message.sendMessage(message.language.get('COMMAND_RELOAD', itm.type, itm.name));
		} catch (err) {
			piece.store.set(piece);
			return message.sendMessage(`❌ ${err}`);
		}
	}

};
