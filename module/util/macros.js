export function skillCheck(skill, options = {}) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    actor.rollSkill(skill, options);
}

export function attackCheck(actorId, attack) {
    const actor = game.actors.get(actorId);
    if (!actor) return;
    actor.rollAttack(attack);
}

export function itemCheck(itemType, itemName, actorId = "", itemId = "") {
    let actor;
    if (actorId)
        actor = game.actors.get(actorId);
    else {
        const speaker = ChatMessage.getSpeaker();
        if (speaker.token) actor = game.actors.tokens[speaker.token];
        if (!actor) actor = game.actors.get(speaker.actor);
    }

    if (actor) {
        let item;
        if (itemId) {
            item = actor.data.items.find(el => el._id === itemId)
            if (!item) {
                item = game.data.items.find(el => el._id === itemId);
                item = actor.data.items.find(el => el.name === item?.name && el.type === item?.type)
            }
        } else {
            item = actor.data.items.find(el => el.name === itemName && el.type === itemType)
        }
        if (item) {
            if (item.type === "spell") {
                actor.rollSpell(item);
            }

            if (item.type === "weapon") {
                actor.rollAttack(item);
            }
        } else {
            ui.notifications.error(game.i18n.localize("splittermond.invalidItem"));
        }

    } else {
        ui.notifications.info(game.i18n.localize("splittermond.pleaseSelectAToken"));
    }


}


export function requestSkillCheck(skill) {
    let skillLabel = "";
    let difficulty = 15;

    if (event) {
        if (event.type === "click") {

            let parsedString = /(.+)\s*(>|gegen|gg\.)\s*([0-9]*)|(.+)/.exec(event.target.closest('button,a')?.textContent.trim());
            console.log(parsedString)
            if (parsedString) {
                skillLabel = parsedString[0].trim().toLowerCase();

                if (parsedString[3]) {
                    skillLabel = parsedString[1].trim().toLowerCase();
                    difficulty = parseInt(parsedString[3]);
                }
            }
        }
    }


    let preSelectedSkill = [...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.magic].find((skill) => skill === skillLabel || game.i18n.localize(`splittermond.skillLabel.${skill}`).toLowerCase() === skillLabel);

    let optionsList = [...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.magic].reduce((str, skill) => {
        skillLabel = game.i18n.localize(`splittermond.skillLabel.${skill}`);
        let selected = (skill === preSelectedSkill ? "selected" : "");
        return `${str}<option value="${skill}" ${selected}>${skillLabel}</option>`;
    }, "");
    console.log(optionsList)
    skillLabel = game.i18n.localize(`splittermond.skill`);
    let difficultyLabel = game.i18n.localize(`splittermond.difficulty`);
    let content = `<form style='display: grid; grid-template-columns: 4fr 1fr'>
<label>${skillLabel}</label>
<select name="skill">
${optionsList}
</select>
<label>Schwierigkeit</label><input name='difficulty' data-dtype='Number' value="${difficulty}"></form>`;
    let versusLabel = game.i18n.localize(`splittermond.versus`);
    let d = new Dialog({
        title: game.i18n.localize(`splittermond.requestSkillCheck`),
        content: content,
        buttons: {

            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel"
            },
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: "OK",
                callback: (html) => {
                    let skill = html.find('[name="skill"]')[0].value;
                    let difficulty = parseInt(html.find('[name="difficulty"]')[0].value);
                    let skillLabel = game.i18n.localize(`splittermond.skillLabel.${skill}`);
                    ChatMessage.create({
                        user: game.user._id,
                        speaker: ChatMessage.getSpeaker(),
                        content: `@Macro[skillCheck]{${skillLabel} ${versusLabel} ${difficulty}}`
                    });
                }
            },
        },
        default: "ok"
    });
    d.render(true);
}
