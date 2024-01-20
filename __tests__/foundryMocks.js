global.Application = class {
    constructor(app) {
    }
    activateListeners(html) {}
    getData(){}
}

global.Item = class {
    constructor(data, context) {
    }
}

global.Dialog = class {
    constructor(dialogData , options ) {
    }
}

global.ItemSheet = class {
    constructor(item, options) {
        this.item = item;
        this.system = {};
    }
}
global.game = {};

global.foundry = {utils: {getProperty}};
global.TextEditor = {enrichHTML: (text) => text};

/**
 * stolen from foundry's common.js
 * A helper function which searches through an object to retrieve a value by a string key.
 * The method also supports arrays if the provided key is an integer index of the array.
 * The string key supports the notation a.b.c which would return object[a][b][c]
 * @param {object} object   The object to traverse
 * @param {string} key      An object property with notation a.b.c
 * @return {*}              The value of the found property
 */
function getProperty(object, key) {
    if ( !key ) return undefined;
    let target = object;
    for ( let p of key.split('.') ) {
        const t = getType(target);
        if ( !((t === "Object") || (t === "Array")) ) return undefined;
        if ( p in target ) target = target[p];
        else return undefined;
    }
    return target;
}

/**
 * even more stolen from foundry's common.js
 */
function getType(variable) {

    // Primitive types, handled with simple typeof check
    const typeOf = typeof variable;
    if ( typeOf !== "object" ) return typeOf;

    // Special cases of object
    if ( variable === null ) return "null";
    if ( !variable.constructor ) return "Object"; // Object with the null prototype.
    if ( variable.constructor.name === "Object" ) return "Object";  // simple objects

    // Match prototype instances
    const prototypes = [
        [Array, "Array"],
        [Set, "Set"],
        [Map, "Map"],
        [Promise, "Promise"],
        [Error, "Error"],
    ];
    if ( "HTMLElement" in globalThis ) prototypes.push([globalThis.HTMLElement, "HTMLElement"]);
    for ( const [cls, type] of prototypes ) {
        if ( variable instanceof cls ) return type;
    }

    // Unknown Object type
    return "Object";
}
export default {};
