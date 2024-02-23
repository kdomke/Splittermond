import {SplittermondSpellRollDataModel} from "../../../data/SplittermondSpellRollDataModel.js";

export class SplittermondSpellRollMessage extends SplittermondSpellRollDataModel {

    /**
     * @param {SplittermondSpellItem} spell
     * @param {Actor} target
     * @param {CheckReport} checkReport
     * @return {SplittermondSpellRollMessage}
     */
    static createRollMessage(spell, target, checkReport) {

        return new SplittermondSpellRollMessage({
            totalDegreesOfSuccess: checkReport.degreeOfSuccess,
            openDegreesOfSuccess: checkReport.degreeOfSuccess,
        });
    }

    useDegreesOfSuccess() {
        this.updateSource({openDegreesOfSuccess: this.openDegreesOfSuccess - 1})
    }

    get usedDegreesOfSuccess() {
        return this.totalDegreesOfSuccess - this.openDegreesOfSuccess;
    }

    get template(){
        return "systems/splittermond/templates/chat/spell-chat-card.hbs";
    }

    getData(){
        return this;
    }
}