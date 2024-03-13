import Handlebars from "handlebars";
import fs from "fs";

/**
 *
 * @param {string} templateFilePath
 * @param {any} context
 * @returns {string}
 */
export function createHtml(templateFilePath, context) {
    const template= Handlebars.compile(fs.readFileSync(templateFilePath).toString("utf-8"));
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
 * returns a escaped string that gets inserted into the document
 * @param {string[]} choices
 * @param options
 * @returns {string}
 */
function selectOptionsMock(choices = [], options = {}) {
    return Object.keys(choices).map(key => `<option value="${key}" ${options.selected === key ? "selected" : ""}>${localizeMock(choices[key])}</option>`).join("");
}

function equals(one, other){
    return one === other;
}