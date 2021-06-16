export default class CheckDialog extends Dialog {
    constructor(checkData, dialogData = {}, options = {}) {
        super(dialogData, options);
        this.options.classes = ["splittermond", "dialog","dialog-check"];

        this.checkData = checkData;
    }

    static async create(checkData) {

        checkData.rollMode = game.settings.get("core", "rollMode");
        checkData.rollModes = CONFIG.Dice.rollModes;

        const html = await renderTemplate("systems/splittermond/templates/apps/dialog/check-dialog.hbs", checkData);

        return new Promise((resolve) => {
            const dlg = new this(checkData, {
                title: game.i18n.localize("splittermond.skillCheck"),
                content: html,
                buttons: {
                    risk: {
                        //icon: "<img src='../../icons/dice/d10black.svg' style='border: none; opacity: 0.5' width=18 height=18/><img src='../../icons/dice/d10black.svg'   style='border: none; opacity: 0.5' width=18 height=18/><img src='../../icons/dice/d10black.svg' style='border: none' width=18 height=18/><img src='../../icons/dice/d10black.svg' style='border: none' width=18 height=18/>",
                        label: game.i18n.localize("splittermond.rollType.risk"),
                        callback: (html) => {
                            let fd = (new FormDataExtended(html[0].querySelector("form"))).toObject();
                            fd.rollType = "risk";
                            fd.modifierElements = [];
                            if (parseInt(fd.modifier) || 0) {
                                fd.modifierElements.push({
                                    value: parseInt(fd.modifier) || 0,
                                    description: game.i18n.localize("splittermond.modifier")
                                });
                            }
                            $(html).find("[name='emphasis']").each(function () {
                                if (this.checked) {
                                    fd.modifierElements.push({
                                        value: parseInt(this.value) || 0,
                                        description: this.dataset.name
                                    });
                                }
                            });

                            fd.modifier = fd.modifierElements.reduce((acc, el) => acc + el.value, 0);
                            resolve(fd);
                        }
                    },
                    normal: {
                        //icon: "<img src='../../icons/dice/d10black.svg' style='border: none' width=18 height=18/><img src='../../icons/dice/d10black.svg'  style='border: none' width=18 height=18/>",
                        label: game.i18n.localize("splittermond.rollType.standard"),
                        callback: (html) => {
                            let fd = (new FormDataExtended(html[0].querySelector("form"))).toObject();
                            fd.rollType = "standard";
                            fd.modifierElements = [];
                            if (parseInt(fd.modifier) || 0) {
                                fd.modifierElements.push({
                                    value: parseInt(fd.modifier) || 0,
                                    description: game.i18n.localize("splittermond.modifier")
                                });
                            }
                            $(html).find("[name='emphasis']").each(function () {
                                if (this.checked) {
                                    fd.modifierElements.push({
                                        value: parseInt(this.value) || 0,
                                        description: this.dataset.name
                                    });
                                }
                            });

                            fd.modifier = fd.modifierElements.reduce((acc, el) => acc + el.value, 0);
                            resolve(fd);
                        }
                    },
                    safety: {
                        //icon: "<img src='../../icons/dice/d10black.svg' style='border: none; opacity: 0.5' width=18 height=18/><img src='../../icons/dice/d10black.svg'  style='border: none' width=18 height=18/>",
                        label: game.i18n.localize("splittermond.rollType.safety"),
                        callback: (html) => {
                            let fd = (new FormDataExtended(html[0].querySelector("form"))).toObject();
                            fd.rollType = "safety";
                            fd.modifierElements = [];
                            if (parseInt(fd.modifier) || 0) {
                                fd.modifierElements.push({
                                    value: parseInt(fd.modifier) || 0,
                                    description: game.i18n.localize("splittermond.modifier")
                                });
                            }
                            $(html).find("[name='emphasis']").each(function () {
                                if (this.checked) {
                                    fd.modifierElements.push({
                                        value: parseInt(this.value) || 0,
                                        description: this.dataset.name
                                    });
                                }
                            });

                            fd.modifier = fd.modifierElements.reduce((acc, el) => acc + el.value, 0);
                            resolve(fd);
                        }
                    },
                },
                default: "normal",
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

        super.activateListeners(html);
    }

}