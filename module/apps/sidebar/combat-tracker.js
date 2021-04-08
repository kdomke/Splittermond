export default class SplittermondCombatTracker extends CombatTracker {

    async getData(options) {
        const data = await super.getData(options);
        data.turns = duplicate(data.turns);

        data.turns.forEach(c => {
            if (parseInt(c.initiative) === 10000) {
                c.initiative = game.i18n.localize("splittermond.wait");

            } else if (parseInt(c.initiative) === 20000) {
                c.initiative = game.i18n.localize("splittermond.keepReady");
            } else {
                let tickNumber = c.initiative ? Math.round(c.initiative) : 0;
                c.initiative = tickNumber + " | " + Math.round(100 * (c.initiative - tickNumber));
            }

        });

        data.round = Math.round(data.round) + "";

        if (data.combat?.data.round != null) {
            data.combat.data.round = Math.round(data.combat.data.round) + "";
        }

        return data;
    }

    activateListeners(html) {
        html.find('.combatant .combatant-controls').prepend(`<a class="combatant-control" title="" data-control="togglePause">
            <i class= "fas fa-pause-circle" ></i></a>`);
        html.find('[data-control="togglePause"]').on("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const btn = ev.currentTarget;
            const li = btn.closest(".combatant");
            const c = this.combat.getCombatant(li.dataset.combatantId);

            if (c.initiative < 10000) {

                let dialog = new Dialog({
                    title: "Abwarten / Bereithalten",
                    buttons: {
                        cancel: {
                            label: game.i18n.localize("splittermond.cancel"),
                            callback: html => {
                            }
                        },
                        keepReady: {
                            label: game.i18n.localize("splittermond.keepReady"),
                            callback: html => {
                                this.combat.setInitiative(c._id, 20000);
                            }
                        },
                        wait: {
                            label: game.i18n.localize("splittermond.wait"),
                            callback: html => {
                                this.combat.setInitiative(c._id, 10000);
                            }
                        }
                    }
                });
                dialog.render(true);
            } else {
                switch (c.initiative) {
                    case 10000:
                        this.combat.setInitiative(c._id, parseInt(this.combat.round));
                        break;
                    case 20000:
                        this.combat.setInitiative(c._id, parseInt(this.combat.round), true);
                        break;
                    default:
                        break;
                }
            }

        });

        super.activateListeners(html);
    }

}