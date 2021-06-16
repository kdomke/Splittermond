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
        if (game.data.version.startsWith("0.8.")) {
            data.data = data.data.data;
            data.itemProperties = this._getItemProperties(data.document.data);
            data.typeLabel = "splittermond." + data.document.data.type;
        } else {
            data.itemProperties = this._getItemProperties(data.item);
            data.typeLabel = "splittermond." + data.item.type;
        }


        return data;
    }

    _getItemProperties(item) {
        let sheetProperties = duplicate(CONFIG.splittermond.itemSheetProperties[item.type] || []);
        sheetProperties.forEach(grp => {
            grp.properties.forEach(prop => {
                prop.value = prop.field.split('.').reduce(function (prev, curr) {
                    return prev ? prev[curr] : null
                }, item);
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

        super.activateListeners(html);
    }

    roll() {

    }
}