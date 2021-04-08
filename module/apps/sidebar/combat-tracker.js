export default class SplittermondCombatTracker extends CombatTracker {

    async getData(options) {
        const data = await super.getData(options);
        data.turns = duplicate(data.turns);

        data.turns.forEach(c => {
            let tickNumber = c.initiative ? Math.round(c.initiative) : 0;
            c.initiative = tickNumber + " | " + Math.round(100 * (c.initiative - tickNumber));
        });

        data.round = Math.round(data.round) + "";

        if (data.combat?.data.round != null) {
            data.combat.data.round = Math.round(data.combat.data.round) + "";
        }

        return data;
    }

}