export default class SplittermondItemSheet extends ItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/splittermond/templates/sheets/item/item-sheet.hbs",
            classes: ["splittermond", "sheet", "item"],
            tabs: [{ navSelector: ".sheet-navigation", contentSelector: "main", initial: "description" }],
            scrollY: [".tab[data-tab='properties']"]
        });
    }

    constructor(item, options) {
        options = options || {};

        var displayProperties = CONFIG.splittermond.displayOptions.itemSheet[item.type] || CONFIG.splittermond.displayOptions.itemSheet["default"];
        options.width = displayProperties.width;
        options.height = displayProperties.height;
        super(item, options);
    }

    async getData() {
        const data = super.getData();
        data.itemProperties = this._getItemProperties();
        data.statBlock = this._getStatBlock();
        data.typeLabel = "splittermond." + data.data.type;

        data.description = await TextEditor.enrichHTML(data.data.system.description, {async: true});

        return data;
    }

    _getItemProperties() {
        let sheetProperties = duplicate(CONFIG.splittermond.itemSheetProperties[this.item.type] || []);
        sheetProperties.forEach(grp => {
            grp.properties.forEach(prop => {
                prop.value = foundry.utils.getProperty(this.item, prop.field);
                if (prop.help) {
                    prop.help = TextEditor.enrichHTML(game.i18n.localize(prop.help), {async: false});
                }
            });
        });

        return sheetProperties;
    }

    _getStatBlock() {
        return [];
    }

    activateListeners(html) {
        html.find('input.autoexpand').on('input', function () {
            let dummyElement = $('<span id="autoexpanddummy"/>').hide();
            $(this).after(dummyElement);
            dummyElement.text($(this).val() || $(this).text() || $(this).attr('placeholder'));
            $(this).css({
                width: dummyElement.width()
            })
            dummyElement.remove();
        }).trigger('input');

        html.find('[data-action="inc-value"]').click((event) => {
            const query = $(event.currentTarget).closestData('input-query');
            let value = parseInt($(html).find(query).val()) || 0;
            $(html).find(query).val(value + 1).change();
        });

        html.find('[data-action="dec-value"]').click((event) => {
            const query = $(event.currentTarget).closestData('input-query');
            let value = parseInt($(html).find(query).val()) || 0;
            $(html).find(query).val(value - 1).change();
        });


        super.activateListeners(html);
    }

    roll() {

    }
}