export default class ApplyDamageDialog extends Dialog {
    constructor(dialogData = {}, options = {}) {
        super(dialogData, options);
        this.options.classes = ["splittermond", "dialog","dialog-apply-damage"];
    }

    static async create(damage=0, type="V", description="") {
        damage = parseInt(damage);
        let data = {
            damage: damage,
            type: type
        }
        let actor;

        if (game.user.isGM) {
            data.message = game.i18n.localize("splittermond.applyDamageOnSelectedToken");
        } else if(game.user.targets.size) {
            data.message = game.i18n.localize("splittermond.applyDamageOnSelectedTargets");
        } else {
            const speaker = ChatMessage.getSpeaker();
            
            if (speaker.token) actor = game.actors.tokens[speaker.token];
            if (!actor) actor = game.actors.get(speaker.actor);
            if (!actor) {
                return
            };
            data.message = game.i18n.format("splittermond.applyDamageOnToken", actor);
        }

        const html = await renderTemplate("systems/splittermond/templates/apps/dialog/apply-damage-dialog.hbs", data);

        return new Promise((resolve) => {
            const dlg = new this({
                title: game.i18n.localize("splittermond.applyDamage") + " - "+ description,
                content: html,
                buttons: {
                    cancel: {
                        //icon: "<img src='../../icons/dice/d10black.svg' style='border: none' width=18 height=18/><img src='../../icons/dice/d10black.svg'  style='border: none' width=18 height=18/>",
                        label: game.i18n.localize("splittermond.cancel"),
                        callback: (html) => {
                            
                            return;
                        }
                    },
                    apply: {
                        //icon: "<img src='../../icons/dice/d10black.svg' style='border: none; opacity: 0.5' width=18 height=18/><img src='../../icons/dice/d10black.svg'   style='border: none; opacity: 0.5' width=18 height=18/><img src='../../icons/dice/d10black.svg' style='border: none' width=18 height=18/><img src='../../icons/dice/d10black.svg' style='border: none' width=18 height=18/>",
                        label: game.i18n.localize("splittermond.apply"),
                        callback: (html) => {
                            let fd = (new FormDataExtended(html[0].querySelector("form"))).object;
                            let damageString = fd.damage+"";
                            if (fd.type=== "K") {
                                damageString = "K"+fd.damage;
                            }
                            if (fd.type=== "V") {
                                damageString = fd.damage+"V"+fd.damage;
                            }

                            if (game.user.isGM) {
                                if (canvas.tokens.controlled) {
                                    canvas.tokens.controlled.forEach(token => {
                                        token.actor.consumeCost("health", damageString, description);
                                    })
                                } else {
                                    game.i18n.localize("splittermond.selectAToken");
                                }
                            } else if(game.user.targets.size) {
                                Array.from(game.user.targets).forEach(token => {
                                    token.actor.consumeCost("health", damageString, description);
                                })
                            } else {
                                actor.consumeCost("health", damageString, description);
                            }
                            resolve(fd);
                        }
                    }
                },
                default: "apply",
                close: () => resolve(null)
            });
            dlg.render(true);
        });
    }


    activateListeners(html) {
        html.find('[data-action="inc-value"]').click((event) => {
            const query = $(event.currentTarget).closestData('input-query');
            let value = parseInt($(html).find(query).val()) || 0;
            $(html).find(query).val(value+1).change();
        });

        html.find('[data-action="dec-value"]').click((event) => {
            const query = $(event.currentTarget).closestData('input-query');
            let value = parseInt($(html).find(query).val()) || 0;
            $(html).find(query).val(value-1).change();
        });

        html.find('[data-action="half-value"]').click((event) => {
            const query = $(event.currentTarget).closestData('input-query');
            let value = parseInt($(html).find(query).val()) || 0;
            $(html).find(query).val(Math.round(value/2)).change();
        });

        super.activateListeners(html);
    }

}