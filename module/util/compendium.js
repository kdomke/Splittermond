export default class SplittermondCompendium {
    static findItem(type, name) {
        let item = game.items.find(i => i.type === type && i.name.startsWith(name));
        if (!item) {
            item = game.packs.find((pack) => {
                return pack.index.find(i => i.type === type && i.name.startsWith(name));
            });
        }
        return item;
    }
}