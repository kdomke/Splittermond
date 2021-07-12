export default class SplittermondCombat extends Combat {
    _sortCombatants(a, b) {
        b.actor.data.data.attributes.intuition.value
        let iniA = parseFloat(a.initiative);
        let iniB = parseFloat(b.initiative);

        if (iniA === iniB) {
            iniA = -a.actor.data.data.attributes.intuition.value;
            iniB = -b.actor.data.data.attributes.intuition.value;
        }

        if (iniA === iniB) {
            iniA = Math.random();
            iniB = Math.random();
        }

        return (iniA + (a.data.defeated ? 1000 : 0)) - (iniB + (b.data.defeated ? 1000 : 0));
    }

    async startCombat() {
        await this.setupTurns();
        await this.setFlag("splittermond", "tickHistory", []);

        this.current.round = this.combatants[0].initiative;

        return this.nextRound();
    }

    setupTurns() {

        // Determine the turn order and the current turn
        const turns = this.combatants.contents.sort(this._sortCombatants);
    
          // Update state tracking
        let c = turns[0];
        this.current = {
          round: this.data.round,
          turn: 0,
          combatantId: c ? c.id : null,
          tokenId: c ? c.data.tokenId : null
        };
        return this.turns = turns;
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

        let newInitiative = Math.round(combatant.initiative) + nTicks;


        //await this.updateCombatant({ _id: combatant._id, "flags.relativeTickPosition": combatant.flags.relativeTickPosition })

        return this.setInitiative(combatant._id, newInitiative);
    }

    async setInitiative(id, value, first = false) {
        value = Math.round(value);
        if (value < 10000) {
            if (!first) {
                value = this.combatants.reduce((acc, c) => {
                    return ((Math.round(c.initiative) == value) ? Math.max((c.initiative || 0) + 0.01, acc) : acc);
                }, value);
            } else {
                value = this.combatants.reduce((acc, c) => {
                    return ((Math.round(c.initiative) == value) ? Math.min((c.initiative || 0) - 0.01, acc) : acc);
                }, value);
            }
        } else {
            if (value !== 10000 && value !== 20000) {
                return
            }
        }


        await this.updateCombatant({
            _id: id,
            initiative: value
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
        return this.update({ round: Math.round(this.combatants.reduce((acc, c) => Math.min(c.initiative, acc), 99999)), turn: 0 });
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