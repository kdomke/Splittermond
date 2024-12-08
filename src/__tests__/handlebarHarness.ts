import Handlebars from "handlebars";
import fs from "fs";

export function createHtml(templateFilePath:string, context:unknown):string {
    const template= Handlebars.compile(fs.readFileSync(`public/${templateFilePath}`).toString("utf-8"));
    Handlebars.registerHelper("localize", localizeMock);
    Handlebars.registerHelper("selectOptions", selectOptionsMock);
    Handlebars.registerHelper("eq", equals);
    Handlebars.registerHelper("editor", () =>"");
    return template(context);
}

function localizeMock(key:string):string {
    return key.toString();
}

/**
 * returns an escaped string that gets inserted into the document
 */
function selectOptionsMock(choices:Record<string,string> = {}, options:Record<string,unknown>= {}) {
    return Object.keys(choices).map(key => `<option value="${key}" ${options.selected === key ? "selected" : ""}>${localizeMock(choices[key])}</option>`).join("");
}

function equals(one:unknown, other:unknown){
    return one === other;
}