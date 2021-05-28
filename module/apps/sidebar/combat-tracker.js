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
        const combat = game.data.version.startsWith("0.8.") ? this.viewed : this.combat;

        $(html.find('.combatant')).each(function () {
            const cid = $(this).closestData("combatant-id");
            const c = combat.getCombatant(cid);
            if (c.owner) {
                if (c.initiative < 10000) {
                    $(".token-initiative .initiative", this).wrap('<a class="combatant-control" title="" data-control="addTicks"/>');
                    $('.combatant-controls', this).prepend(`<a class="combatant-control" title="" data-control="togglePause">
            <i class= "fas fa-pause-circle" ></i></a>`);
                } else {
                    $('.combatant-controls', this).prepend(`<a class="combatant-control" title="" data-control="togglePause">
            <i class= "fas fa-play-circle" ></i></a>`);
                }


            }

        });

        html.find('[data-control="togglePause"]').on("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const btn = ev.currentTarget;
            const li = btn.closest(".combatant");
            const c = combat.getCombatant(li.dataset.combatantId);

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
                                combat.setInitiative(c._id, 20000);
                            }
                        },
                        wait: {
                            label: game.i18n.localize("splittermond.wait"),
                            callback: html => {
                                combat.setInitiative(c._id, 10000);
                            }
                        }
                    }
                });
                dialog.render(true);
            } else {
                switch (c.initiative) {
                    case 10000:
                        combat.setInitiative(c._id, parseInt(combat.round));
                        break;
                    case 20000:
                        combat.setInitiative(c._id, parseInt(combat.round), true);
                        break;
                    default:
                        break;
                }
            }

        });



        html.find('[data-control="addTicks"]').on("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const btn = ev.currentTarget;
            const li = btn.closest(".combatant");
            const c = combat.getCombatant(li.dataset.combatantId);

            let dialog = new Dialog({
                title: "Ticks",
                content: "<input type='text' class='ticks' value='3'>",
                buttons: {
                    ok: {
                        label: "Ok",
                        callback: html => {
                            let nTicks = parseInt(html.find(".ticks")[0].value);
                            let newInitiative = Math.round(c.initiative) + nTicks;

                            combat.setInitiative(c._id, newInitiative);
                        }
                    },
                    cancel: {
                        label: "Cancel",
                    }
                }
            }).render(true);
        });

        super.activateListeners(html);
    }

}