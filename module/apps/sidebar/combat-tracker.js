export default class SplittermondCombatTracker extends CombatTracker {

    async getData(options) {
        const data = await super.getData(options);

        data.turns.forEach(c => {
            c.initiative = c.initiative ? c.initiative : 0;
        });

        data.round = data.round + "";

        if (data.combat?.data.round != null) {
            data.combat.data.round = data.combat.data.round + "";
        }

        return data;
    }

}