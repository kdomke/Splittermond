import Handlebars from "handlebars";
import fs from "fs";

/**
 *
 * @param {string} templateFilePath
 * @param {any} context
 * @returns {string}
 */
export function createHtml(templateFilePath, context) {
    const template= Handlebars.compile(fs.readFileSync(templateFilePath).toString("utf-8"))
    Handlebars.registerHelper("localize", localizeMock);
    Handlebars.registerHelper("selectOptions", selectOptionsMock);
    Handlebars.registerHelper("eq", equals);
    Handlebars.registerHelper("editor", () =>"");
    return template(context);
}

/**
 * @param {string} key
 * @returns {string}
 */
function localizeMock(key) {
    return key.toString();
}

/**
 * @param {string[]} choices
 * @param options
 * @returns {string}
 */
function selectOptionsMock(choices, options) {
    return choices.map(item => `<option value="${item}" ${options.selected.includes(item) ? "selected" : ""}>${localize(item)}</option>`).join("");
}

function equals(one, other){
    return one === other;
}