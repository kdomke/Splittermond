export default class SplittermondCombatTracker extends CombatTracker {

    async getData(options) {
        
        // Get the combat encounters possible for the viewed Scene
        const combat = this.viewed;
        const hasCombat = combat !== null;
        const combats = this.combats;
        const currentIdx = combats.findIndex(c => c === combat);
        const previousId = currentIdx > 0 ? combats[currentIdx-1].id : null;
        const nextId = currentIdx < combats.length - 1 ? combats[currentIdx+1].id : null;
        const settings = game.settings.get("core", Combat.CONFIG_SETTING);

        // Prepare rendering data
        const data = {
        user: game.user,
        combats: combats,
        currentIndex: currentIdx + 1,
        combatCount: combats.length,
        hasCombat: hasCombat,
        combat,
        turns: [],
        previousId,
        nextId,
        started: this.started,
        control: false,
        settings
        };
        if ( !hasCombat ) return data;

        // Format information about each combatant in the encounter
        let hasDecimals = false;
        const turns = [];
        for ( let [i, combatant] of combat.turns.entries() ) {
        if ( !combatant.isVisible ) continue;

        // Prepare turn data
        const resource = combatant.permission >= CONST.ENTITY_PERMISSIONS.OBSERVER ? combatant.resource : null
        const turn = {
            id: combatant.id,
            name: combatant.name,
            img: combatant.img,
            active: i === combat.turn,
            owner: combatant.isOwner,
            defeated: combatant.data.defeated,
            hidden: combatant.hidden,
            initiative: combatant.initiative,
            hasRolled: combatant.initiative !== null,
            hasResource: resource !== null,
            resource: resource
        };
        if ( Number.isFinite(turn.initiative) && !Number.isInteger(turn.initiative) ) hasDecimals = true;
        turn.css = [
            turn.active ? "active" : "",
            turn.hidden ? "hidden" : "",
            turn.defeated ? "defeated" : ""
        ].join(" ").trim();

        // Cached thumbnail image for video tokens
        if ( VideoHelper.hasVideoExtension(turn.img) ) {
            if ( combatant._thumb ) turn.img = combatant._thumb;
            else turn.img = combatant._thumb = await game.video.createThumbnail(combatant.img, {width: 100, height: 100});
        }

        // Actor and Token status effects
        turn.effects = new Set();
        if ( combatant.token ) {
            combatant.token.data.effects.forEach(e => turn.effects.add(e));
            if ( combatant.token.data.overlayEffect ) turn.effects.add(combatant.token.data.overlayEffect);
        }
        if ( combatant.actor ) combatant.actor.temporaryEffects.forEach(e => {
            if ( e.getFlag("core", "statusId") === CONFIG.Combat.defeatedStatusId ) turn.defeated = true;
            else if ( e.data.icon ) turn.effects.add(e.data.icon);
        });
        turns.push(turn);
        }

        // Format initiative numeric precision
        const precision = CONFIG.Combat.initiative.decimals;
        turns.forEach(t => {
        if ( t.initiative !== null ) t.initiative = t.initiative.toFixed(hasDecimals ? precision : 0);
        });

        //turns = duplicate(turns);

        turns.forEach(c => {
            if (parseInt(c.initiative) === 10000) {
                c.initiative = game.i18n.localize("splittermond.wait");

            } else if (parseInt(c.initiative) === 20000) {
                c.initiative = game.i18n.localize("splittermond.keepReady");
            } else {
                let tickNumber = c.initiative ? Math.round(c.initiative) : 0;
                c.initiative = tickNumber + " | " + Math.round(100 * (c.initiative - tickNumber));
            }

        });
        if (combat?.data.round != null) {
            combat.data.round = Math.round(combat.data.round) + "";
        }


        // Merge update data for rendering
        return foundry.utils.mergeObject(data, {
            round: Math.round(combat.data.round) + "",
            turn: combat.data.turn,
            turns: turns,
            control: combat.combatant?.players?.includes(game.user)
        });

        
    }
/*
    async getData(options) {
        let data = await super.getData(options);

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
*/
    _onTogglePause(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const btn = ev.currentTarget;
        const li = btn.closest(".combatant");
        const combat = game.data.version.startsWith("0.8.") ? this.viewed : this.combat;
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
    }

    _onAddTicks(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const btn = ev.currentTarget;
        const li = btn.closest(".combatant");
        const combat = game.data.version.startsWith("0.8.") ? this.viewed : this.combat;
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
    }

    activateListeners(html) {
        super.activateListeners(html);
        
        const combat = game.data.version.startsWith("0.8.") ? this.viewed : this.combat;
        $(html.find('.combatant')).each(function () {
            const cid = $(this).closestData("combatant-id");
            const c = combat.getCombatant(cid);
            if (c && c.owner) {
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

        html.find('[data-control="togglePause"]').click((ev) => this._onTogglePause(ev));
        html.find('[data-control="addTicks"]').click((ev) => this._onAddTicks(ev));

        
    }
    

}