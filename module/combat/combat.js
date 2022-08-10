export default class SplittermondCombat extends Combat {
    _sortCombatants(a, b) {
        let iniA = parseFloat(a.initiative);
        let iniB = parseFloat(b.initiative);

        // if equal initiative => compare intuition
        if (iniA === iniB) {
            iniA = -a.actor.system.attributes.intuition.value;
            iniB = -b.actor.system.attributes.intuition.value;
        }

        // if equal intuition => player character first!
        if (iniA === iniB) {
            iniA = a.actor.type == "character" ? iniA - 1 : iniA;
            iniB = b.actor.type == "character" ? iniB - 1 : iniB;
        }

        // if equal intuition => else random
        if (iniA === iniB) {
            iniA = Math.random();
            iniB = Math.random();
            console.log("SplittermondCombat._sortCombatants: random INI!");
        }

        return (iniA + (a.isDefeated ? 1000 : 0)) - (iniB + (b.isDefeated ? 1000 : 0));

    }

    async startCombat() {
        await this.setupTurns();
        await this.setFlag("splittermond", "tickHistory", []);

        this.current.round = this.combatants[0].initiative;

        return this.nextRound();
    }

    setupTurns() {
            const turns = this.combatants.contents.sort(this._sortCombatants)

            let c = turns[0];
            this.current = {
                round: this.round,
                turn: 0,
                combatantId: c ? c.id : null,
                tokenId: c ? c.token.id : null
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

        return this.setInitiative(combatant.id, newInitiative);
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


        await this.combatants.get(id).update({
            initiative: value
        });
        await this.nextRound();
    }
/*
    get turn() {
        return 0;
    }
*/
    get combatant() {
        return this.turns[0];
    }
/*
    get round() {
        //return this.data.round;
        return Math.round(this.combatants.reduce((acc, c) => Math.min(c.initiative, acc), 99999));
    }
*/
    get started() {
        return (this.turns.length > 0);
    }

    async startCombat() {
        return this.nextRound();
    }

    async nextRound() {
        //await super.nextRound();
        this.setupTurns();
        return this.update({ round: Math.round(this.combatants.reduce((acc, c) => Math.min(c.initiative, acc), 99999)), turn: 0 });
        //return this.update({ round: 0, turn: 0 });
    }

    async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
        //if (updateTurn) {
        //    return super.rollInitiative(ids, { formula: formula, updateTurn: updateTurn, messageOptions: messageOptions });
        //} else {
        await super.rollInitiative(ids, { formula: formula, updateTurn: updateTurn, messageOptions: messageOptions });
        return this.nextRound();
        //}


    }

    _onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId) {
        //super._onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId);
        this.setupTurns();
        // Render the collection
         if ( this.isActive && (options.render !== false) ) this.collection.render();
    }
  
}