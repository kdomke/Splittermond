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
            StringField: class {
                options = null;
                constructor(options){this.options = options}
            },
            NumberField: class {
                options = null;
                constructor(options){this.options = options}
            },
            ObjectField: class {
                options = null;
                constructor(options){this.options = options}
            },
            SchemaField: class {
                /**@type object */ schema = null;
                /**@type unknown */ options = null;
                constructor(schema, options){this.schema= schema; this.options = options}
            },
            BooleanField: class {
                /**@type unknown */ options = null;
                constructor(options){this.options = options}
            },
            EmbeddedDataField: class {
                /**@type function*/ type = null;
                /**@type unknown */ options = null;
                constructor(type, options){
                    this.type = type;
                    this.options = options;
                }
            }
        }
    },
    abstract: {
        DataModel: class {
            constructor(data, context={}) {
                for (const key in data) {
                    Object.defineProperty(this, key, {
                        value: data[key],
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                }
            }

            updateSource(data, context) {
                for (const key in data) {
                    this[key] = data[key];
                }
            }

            toObject() {
                JSON.parse(JSON.stringify(this));
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
