global.Application = class {
    constructor(app) {
    }

    activateListeners(html) {
    }

    getData() {
    }
};

global.Actor = class {
}

global.Item = class {
    constructor(data, context) {
    }
};
global.foundry = {
    data: {
        fields: {
            NumberField: class {
            },
            ObjectField: class {
            },
            SchemaField: class {
            },
            BooleanField: class {
            },
        }
    },
    abstract: {
        DataModel: class {
            constructor(data, context) {
                for (const key in data) {
                    Object.defineProperty(this, key, {value: data[key], writable: true, enumerable: true, configurable: true});
                }
            }

            updateSource(data, context) {
                for (const key in data) {
                    this[key] = data[key];
                }
            }
            toObject(input){
               JSON.parse(JSON.stringify(input));
            }
        }
    }
};

global.Dialog = class {
    constructor(dialogData, options) {
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
export function identity(input) {
    return input;
}


export default {};
