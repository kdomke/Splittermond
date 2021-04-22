export default class CheckDialog extends Dialog {
    constructor(checkData, dialogData = {}, options = {}) {
        super(dialogData, options);
        this.options.classes = ["splittermond", "dialog"];

        this.checkData = checkData;
    }

    static async create(checkData) {



        const html = await renderTemplate("systems/splittermond/templates/apps/dialog/check-dialog.hbs", checkData);

        return new Promise((resolve) => {
            const dlg = new this(checkData, {
                title: game.i18n.localize("splittermond.skillCheck"),
                content: html,
                buttons: {
                    risk: {
                        icon: "<img src='../../icons/dice/d10black.svg' style='border: none; opacity: 0.5' width=18 height=18/><img src='../../icons/dice/d10black.svg'   style='border: none; opacity: 0.5' width=18 height=18/><img src='../../icons/dice/d10black.svg' style='border: none' width=18 height=18/><img src='../../icons/dice/d10black.svg' style='border: none' width=18 height=18/>",
                        label: game.i18n.localize("splittermond.rollType.risk"),
                        callback: (html) => {
                            let fd = (new FormDataExtended(html[0].querySelector("form"))).toObject();
                            fd.rollType = "risk";
                            fd.modifier = parseInt(fd.modifier) || 0;
                            html.find("[name='emphasis']").each(e => {
                                if (e.checked) {
                                    fd.modifier += parseInt(e.value) || 0;
                                }
                            });
                            resolve(fd);
                        }
                    },
                    normal: {
                        icon: "<img src='../../icons/dice/d10black.svg' style='border: none' width=18 height=18/><img src='../../icons/dice/d10black.svg'  style='border: none' width=18 height=18/>",
                        label: game.i18n.localize("splittermond.rollType.standard"),
                        callback: (html) => {
                            let fd = (new FormDataExtended(html[0].querySelector("form"))).toObject();
                            fd.rollType = "standard";
                            fd.modifier = parseInt(fd.modifier) || 0;
                            $(html).find("[name='emphasis']").each(function () {
                                if (this.checked) {
                                    fd.modifier += parseInt(this.value) || 0;
                                }
                            });
                            resolve(fd);
                        }
                    },
                    safety: {
                        icon: "<img src='../../icons/dice/d10black.svg' style='border: none; opacity: 0.5' width=18 height=18/><img src='../../icons/dice/d10black.svg'  style='border: none' width=18 height=18/>",
                        label: game.i18n.localize("splittermond.rollType.safety"),
                        callback: (html) => {
                            let fd = (new FormDataExtended(html[0].querySelector("form"))).toObject();
                            fd.rollType = "safety";
                            fd.modifier = parseInt(fd.modifier) || 0;
                            html.find("[name='emphasis']").each(e => {
                                if (e.checked) {
                                    fd.modifier += parseInt(e.value) || 0;
                                }

                            });
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

}