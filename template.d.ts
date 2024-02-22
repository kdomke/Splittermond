import Splittermond from './template.json';

type SplittermondTypes = typeof Splittermond;
type SpellData = SplittermondTypes["Item"]["spell"];
type SpellDegreesOfSuccessOptions = keyof SpellData["degreeOfSuccessOptions"]
export {SplittermondTypes, SpellData, SpellDegreesOfSuccessOptions}
