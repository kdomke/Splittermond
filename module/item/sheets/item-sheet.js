export default class SplittermondItemSheet extends ItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/splittermond/templates/sheets/item/item-sheet.hbs",
            classes: ["splittermond", "sheet", "item"],
            tabs: [{ navSelector: ".sheet-navigation", contentSelector: "main", initial: "description" }],
            scrollY: [".tab[data-tab='properties']"]
        });
    }

    getData() {
        const data = super.getData();
        data.data = data.data.data;
        data.itemProperties = this._getItemProperties(data.document.data);
        data.typeLabel = "splittermond." + data.document.data.type;

        return data;
    }

    _getItemProperties(item) {
        let sheetProperties = duplicate(CONFIG.splittermond.itemSheetProperties[item.type] || []);
        sheetProperties.forEach(grp => {
            grp.properties.forEach(prop => {
                prop.value = prop.field.split('.').reduce(function (prev, curr) {
                    return prev ? prev[curr] : null
                }, item);
                if (prop.help) {
                    prop.help = TextEditor.enrichHTML(game.i18n.localize(prop.help));
                }
            });
        });
        return sheetProperties;
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
            $(html).find(query).val(value+1).change();
        });

        html.find('[data-action="dec-value"]').click((event) => {
            const query = $(event.currentTarget).closestData('input-query');
            let value = parseInt($(html).find(query).val()) || 0;
            $(html).find(query).val(value-1).change();
        });


        super.activateListeners(html);
    }

    roll() {

    }
}