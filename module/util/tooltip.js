export class TooltipFormula {
    constructor() {
        this.parts = [];
    }

    addPart(value, description, classes="") {
        this.parts.push({
            type: "part",
            classes: classes,
            value: value,
            description: description
        });
    }

    addOperator(operator) {
        this.parts.push({
            type: "operator",
            operator: operator
        });
    }

    addMalus(value, description) {
        this.addPart(value, description, "malus");
    }

    addBonus(value, description) {
        this.addPart(value, description, "bonus");
    }

    render() {
        let result = `<span class="formula">`;
        this.parts.forEach(part => {
            if (part.type == "part") {
                result += `<span class="formula-part ${part.classes}"><span class="value">${part.value}</span>
                <span class="description">${game.i18n.localize(part.description)}</span></span>`;
            } else if (part.type == "operator") {
                result += `<span class="operator">${part.operator}</span>`;
            }
        });
        result += "</span>";
        return result;
    }
}