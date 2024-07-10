export class TooltipFormula {
    constructor() {
        this.parts = [];
    }

    /**
     * @param {{value: string, description:string, classes?:string}[]} parts
     * @param {string} joinedByOperator
     */
    addParts(parts, joinedByOperator) {
        parts.forEach((part, index) => {
            this.addPart(part.value, part.description, part.classes);
            if (index !== parts.length - 1) {//add an operator for all but the last attribute
                this.addOperator(joinedByOperator);
            }
        });
    }

    addPart(value, description, classes) {
        const splitClassInput = classes ? classes.split(" ") : [];
        const partClasses = ["formula-part"];
        partClasses.push(...splitClassInput);
        this.parts.push({
            type: "part",
            classes: partClasses,
            value: `${value ?? ""}`,
            description: description ?? null
        });
    }

    addOperator(operator) {
        this.parts.push({
            type: "operator",
            classes: ["operator"],
            value: operator,
        });
    }

    addMalus(value, description) {
        this.addOperator("-")
        this.addPart(value, description, "malus");
    }

    addBonus(value, description) {
        this.addOperator("+")
        this.addPart(value, description, "bonus");
    }

    getData() {
        return this.parts.map(p => (
            {
                type: `${p.type}`,
                classes: p.classes.join(" "),
                value: p.value ? game.i18n.localize(`${p.value}`) : "",
                description: p.description ? game.i18n.localize(`${p.description}`): ""

            }));
    }

    render() {
        let result = `<span class="formula">`;
        this.getData().forEach(part => {
            if (part.type === "part") {
                result += `<span class="${part.classes}"><span class="value">${part.value}</span>
                <span class="description">${part.description}</span></span>`;
            } else if (part.type === `${part.classes}`) {
                result += `<span class="operator">${part.value}</span>`;
            }
        });
        result += "</span>";
        return result;
    }
}