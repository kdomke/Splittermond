import Splittermond from './template.json';

type SplittermondTypes = typeof Splittermond;
type SplittermondSkill = keyof SplittermondTypes["Actor"]["templates"]["skills"]["skills"];
type CostTypes = keyof SplittermondTypes["Actor"]["templates"]  & ("health"| "focus");
type SpellData = SplittermondTypes["Item"]["spell"];
type SpellDegreesOfSuccessOptions = keyof SpellData["degreeOfSuccessOptions"]
export {SplittermondTypes, SpellData, SpellDegreesOfSuccessOptions, CostTypes, SplittermondSkill}
