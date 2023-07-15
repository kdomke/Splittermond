import SplittermondItem from "./item.js";


export default class SplittermondMasteryItem extends SplittermondItem {

    get availableInList() {
        let list = [];
        if (this.system.availableIn.trim() != "") {
            list = this.system.availableIn?.split(",").map(str => str.trim());
        }
        let skill = this.system.skill;
        if (list.find(f => f == skill) != skill) {
            list.push(skill);
        }

        return list;
    }
}