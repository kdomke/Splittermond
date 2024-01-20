import foundryMocks from "../../foundryMocks.js";
import SplittermondMasteryItem from "../../../module/item/mastery.js";
import {expect} from 'chai';

describe("availableInList",() => {

    it("should return an empty list if availableIn is not set", () => {
        const mastery = new SplittermondMasteryItem({},{splittermond: {ready: true}}, {localize: (str) => str});
        mastery.system = {skill : "staffs", availableIn:""};

        expect(mastery.availableInList).to.deep.equal([{label: "splittermond.skillLabel.staffs", skillId: "staffs"}]);
    });

    it("should return a list of available skills",() => {
        const mastery = new SplittermondMasteryItem({},{splittermond: {ready: true}}, {localize: (str) => str});
        mastery.system = {availableIn : "staffs, swords"};

        expect(mastery.availableInList.length).to.equal(2);
        expect(mastery.availableInList[0]).to.deep.equal({label: "splittermond.skillLabel.staffs", skillId: "staffs"});
        expect(mastery.availableInList[1]).to.deep.equal({label: "splittermond.skillLabel.swords", skillId: "swords"});
    });

    it("should handle null availability",() => {
        const mastery = new SplittermondMasteryItem({},{splittermond: {ready: true}}, {localize: (str) => str});
        mastery.system = {availableIn : null, skill: "staffs"};

        expect(mastery.availableInList).to.deep.equal([{label: "splittermond.skillLabel.staffs", skillId: "staffs"}]);
    })

    it("should handle whitespace availability",() => {
        const mastery = new SplittermondMasteryItem({},{splittermond: {ready: true}}, {localize: (str) => str});
        mastery.system = {availableIn : "staffs swords", skill: "staffs"};

        expect(mastery.availableInList[0]).to.deep.equal({label: "splittermond.skillLabel.staffs swords", skillId: "staffs swords"});
        expect(mastery.availableInList[1]).to.deep.equal({label: "splittermond.skillLabel.staffs", skillId: "staffs"});
    });

})