export default class Modifier {
    /**
     * 
     * @param {string} path Modifier Path
     * @param {string} name name of modification
     * @param {(numeric | string)} value 
     * @param {(Item | Actor)=null} origin 
     * @param {string=""} type "equipment", "magic" etc.
     * @param {boolean=false} selectable is the modifier selectable as a roll option
     */
    constructor(path, name, value, origin = null, type = "", selectable = false) {
        this.path = path;
        this.value = parseInt(value);
        this.origin = origin;
        this.selectable = selectable;
        this.name = name;
        this.type = type;
    }

    get isMalus() {
        return this.value < 0;
    }

    get isBonus() {
        return this.value > 0;
    }

    addTooltipFormulaElements(formula, bonusPrefix = "+", malusPrefix = "-") {
        let val = Math.abs(this.value);
        if (this.isBonus) {
            formula.addBonus(bonusPrefix+val, this.name);
        } else {
            formula.addMalus(malusPrefix+val, this.name);
        }
    }

}