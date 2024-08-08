import "../../../../foundryMocks.js";
import SplittermondSpellItem from "../../../../../../module/item/spell.js";
import sinon from "sinon";
import {foundryApi} from "../../../../../../module/api/foundryApi.ts";
import SplittermondActor from "../../../../../../module/actor/actor.js";
import {SplittermondDataModel} from "../../../../../../module/data/SplittermondDataModel.ts";

/**
 * @param {SinonSandbox} sandbox
 * @return {SplittermondActor}
 */
export function setUpMockActor(sandbox) {
    const actorMock = sandbox.createStubInstance(SplittermondActor);
    sandbox.stub(foundryApi, "getActor").returns(actorMock);
    actorMock.documentName = "Actor";
    actorMock.id = "1";
    return actorMock;
}

/**
 * @param {SinonSandbox} sandbox
 * @return {SplittermondSpellItem & ItemReference<SplittermondSpellItem>}
 */
export function setUpMockSpellSelfReference(sandbox) {
    const spellMock = sandbox.createStubInstance(SplittermondSpellItem);
    sandbox.stub(foundryApi, "getItem").returns(spellMock);
    spellMock.getItem = function () {
        return this;
    };
    Object.defineProperty(spellMock, "toObject", {
        value: function () {
            return this;
        }
    });
    return spellMock;
}

/**@return {CheckReport & OnAncestorReference<CheckReport>}*/
export function setUpCheckReportSelfReference() {
    const checkReportReference = {}
    Object.defineProperty(checkReportReference, "get", {
        value: function () {
            return this;
        }
    });
    Object.defineProperty(checkReportReference, "toObject", {
        value: function () {
            return this;
        }
    });
    return checkReportReference;
}

/**
 * @template T
 * @param {() => T} wrappedFunction
 * @return {T}
 */
export function withToObjectReturnsSelf(wrappedFunction) {
    const toObjectMock = sinon.stub(SplittermondDataModel.prototype, "toObject").callsFake(function () {
        return this;
    });
    const returnValue = wrappedFunction();
    toObjectMock.restore();
    return returnValue;
}

/** @param {object} object */
export function injectParent(object) {
    for (const key in object) {
        if (object[key] && typeof object[key] === "object" && key !== "parent") {
            object[key].parent = object;
            injectParent(object[key]);
        }
    }
}
