import sinon from "sinon";
import {settings} from "../../module/settings";

let booleanExpectation: boolean = false;
let numberExpectation: number = 0;
let stringExpectation: string = "";
sinon.stub(settings, "registerBoolean").callsFake(() => Promise.resolve({
    get: () => booleanExpectation, set: () => {
    }
}))
sinon.stub(settings, "registerString").callsFake(() => Promise.resolve({
    get: () => stringExpectation, set: () => {
    }
}))
sinon.stub(settings, "registerNumber").callsFake(() => Promise.resolve({
    get: () => numberExpectation, set: () => {
    }
}))

export const settingsMock = {
    set booleanExpectation(value: boolean) {
        booleanExpectation = value
    },
    set numberExpectation(value: number) {
        numberExpectation = value;
    },
    set stringExpectation(value: string) {
        stringExpectation = value;
    }

}