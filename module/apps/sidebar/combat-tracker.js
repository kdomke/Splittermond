export default class SplittermondCombatTracker extends CombatTracker {

    async getData(options) {
        const data = await super.getData(options);
        data.turns = duplicate(data.turns);

        data.turns.forEach(c => {
            c.initiative = c.initiative ? c.initiative : 0;
            let temp = c.flags.relativeTickPosition || 0;
            c.initiative = `${c.initiative} | ${temp}`
        });

        data.round = data.round + "";

        if (data.combat?.data.round != null) {
            data.combat.data.round = data.combat.data.round + "";
        }

        return data;
    }

}