
export default class SplittermondCombat extends Combat {
    _sortCombatants(a, b) {
        const iniA = parseInt(a.initiative || 0);
        const iniB = parseInt(b.initiative || 0);

        const relativeTickPositionA = parseInt(a.flags.relativeTickPosition || 0);
        const relativeTickPositionB = parseInt(b.flags.relativeTickPosition || 0);

        return (iniA * 100 + relativeTickPositionA) - (iniB * 100 + relativeTickPositionB);
    }

    async startCombat() {
        await this.setupTurns();
        await this.setFlag("splittermond", "tickHistory", []);

        this.current.round = this.combatants[0].initiative;

        return super.nextRound();
    }

    async nextTurn(nTicks = 0) {
        if (nTicks == 0) {
            let p = new Promise((resolve, reject) => {
                let dialog = new Dialog({
                    title: "Ticks",
                    content: "<input type='text' class='ticks' value='3'>",
                    buttons: {
                        ok: {
                            label: "Ok",
                            callback: html => {
                                resolve(parseInt(html.find('.ticks')[0].value));
                            }
                        }
                    }
                });
                dialog.render(true);
            });
            nTicks = await p;
        }



        let combatant = this.combatant;

        let newInitiative = combatant.initiative + nTicks;


        //await this.updateCombatant({ _id: combatant._id, "flags.relativeTickPosition": combatant.flags.relativeTickPosition })

        return this.setInitiative(combatant._id, newInitiative);
    }

    async setInitiative(id, value, relativeTickPosition = NaN) {
        if (isNaN(relativeTickPosition)) {
            relativeTickPosition = this.combatants.reduce((acc, c) => {
                return acc + ((c.initiative == value) ? 1 : 0);
            }, 0);
        }

        await this.updateCombatant({
            _id: id,
            initiative: value,
            flags: {
                relativeTickPosition: relativeTickPosition
            }
        });
        await this.nextRound();
    }

    get turn() {
        return 0;
    }

    get round() {
        return this.data.round;
    }

    get started() {
        return (this.turns.length > 0);
    }

    async startCombat() {
        return this.nextRound();
    }

    async nextRound() {
        //await super.nextRound();
        return this.update({ round: this.combatants.reduce((acc, c) => Math.min(c.initiative, acc), 99999), turn: 0 });
    }

    async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
        //if (updateTurn) {
        //    return super.rollInitiative(ids, { formula: formula, updateTurn: updateTurn, messageOptions: messageOptions });
        //} else {
        await super.rollInitiative(ids, { formula: formula, updateTurn: updateTurn, messageOptions: messageOptions });
        return this.nextRound();
        //}


    }
}