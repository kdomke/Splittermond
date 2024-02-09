global.Application = class {
    constructor(app) {
    }
    activateListeners(html) {}
    getData(){}
};

global.Actor = class {
}

global.Item = class {
    constructor(data, context) {
    }
};

global.Dialog = class {
    constructor(dialogData , options ) {
    }
};

global.ItemSheet = class {
    constructor(item) {
        this.item = item;
        this.system = {};
    }
};
global.game = {};

/**
 *  @param {T} input
 *  @return {T}
 */
export function identity(input){
    return input;
}


export default {};
