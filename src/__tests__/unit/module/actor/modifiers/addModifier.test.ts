import {expect} from 'chai';
import sinon, {SinonSandbox, SinonStub, SinonStubbedInstance} from 'sinon';
import SplittermondActor from "../../../../../module/actor/actor";
import SplittermondItem from "../../../../../module/item/item";
import ModifierManager from "../../../../../module/actor/modifier-manager";
import {foundryApi} from 'module/api/foundryApi';
import {addModifier} from "../../../../../module/actor/modifiers/modifierAddition";
import {splittermond} from "../../../../../module/config";
import {CharacterDataModel} from "../../../../../module/actor/dataModel/CharacterDataModel";
import {CharacterAttribute} from "../../../../../module/actor/dataModel/CharacterAttribute";
import Attribute from "../../../../../module/actor/attribute";
import {clearMappers} from "../../../../../module/actor/modifiers/parsing/normalizer";
import {of} from "../../../../../module/actor/modifiers/expressions/definitions";
import {evaluate} from "../../../../../module/actor/modifiers/expressions/evaluation";

describe('addModifier', () => {
    let sandbox: SinonSandbox;
    let actor: SinonStubbedInstance<SplittermondActor>;
    let item: SinonStubbedInstance<SplittermondItem>;
    let modifierManager: SinonStubbedInstance<ModifierManager>;
    let systemData: any;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        clearMappers();
        systemData = {
            healthRegeneration: {multiplier: 1, bonus: 0},
            focusRegeneration: {multiplier: 1, bonus: 0},
            spellCostReduction: {addCostModifier: sandbox.stub()},
            spellEnhancedCostReduction: {addCostModifier: sandbox.stub()},
            health: {woundMalus: {nbrLevels: 0, mod: 0, levelMod: 0}}
        };

        modifierManager = sandbox.createStubInstance(ModifierManager);

        actor = sandbox.createStubInstance(SplittermondActor);
        actor.system = systemData;
        Object.defineProperty(actor,"modifier",{value: modifierManager, enumerable: true, writable: false, configurable: true});
        //@ts-expect-error
        actor.attributes = {
            charisma: {value: 2},
            agility: {value: 3},
            intuition: {value: 4},
            constitution: {value: 5},
            mystic: {value: 6},
            strength: {value: 7},
            mind: {value: 8},
            willpower: {value: 9}
        };
        //@ts-expect-error
        actor.derivedValues = {
            speed: {multiplier: 1}
        };
        item = {
            system: {}
        } as unknown as SinonStubbedInstance<SplittermondItem>;

        sandbox.stub(foundryApi, 'reportError');
        sandbox.stub(foundryApi, 'localize').callsFake((key: string) => {
            switch(key){
                case 'splittermond.attributes.intuition.short': return 'INT';
                default: return key;
            }
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should add basic modifier', () => {
        addModifier(actor, item, 'Test', 'BonusCap +2');
        expect(modifierManager.add.lastCall.args).to.have.deep.members(['bonuscap', 'Test', of(2), item, '', false]);
    });

    it('should handle multiplier modifiers', () => {
        addModifier(actor, item, '', 'Speed.multiplier 2', '', 2);
        expect(actor.derivedValues.speed.multiplier).to.equal(4); // 2^2
    });

    it('should handle regeneration modifiers', () => {
        addModifier(actor, item, '', 'HealthRegeneration.multiplier 2');
        expect(systemData.healthRegeneration.multiplier).to.equal(2);

        addModifier(actor, item, '', 'HealthRegeneration.bonus 3');
        expect(systemData.healthRegeneration.bonus).to.equal(3);
    });

    it('should handle skill groups', () => {
        const mockSkills = ['skill1', 'skill2'];
        sandbox.stub(splittermond, 'skillGroups').value(
            {
                general: mockSkills,
                magic: [],
                fighting: []
            });

        addModifier(actor, item, 'Group', 'GeneralSkills/emphasis +2');

        mockSkills.forEach(skill => {
            expect(modifierManager.add.calledWith(
                skill,
                'emphasis',
                of(2),
                item,
                '',
                true
            )).to.be.true;
        });
    });

    it('should report error for invalid syntax', () => {
        addModifier(actor, item, 'Invalid', 'InvalidString');
        expect((foundryApi.reportError as SinonStub).calledOnce).to.be.true;
    });

    it('should replace attribute placeholders', () => {
        addModifier(actor, item, '', 'AUS +1');
        expect(modifierManager.add.lastCall.args).to.have.deep.members(['AUS', '', of(1), item, '', false]);
    });

    it('should handle selectable modifiers with emphasis', () => {
        addModifier(actor, item, 'Selectable', 'resistance.fire/emphasis +3');
        expect(modifierManager.add.lastCall.args).to.have.deep.members([
            'resistance.fire',
            'emphasis',
            of(3),
            item,
            '',
            true
        ]);
    });

    it('should handle damage modifiers', () => {
        addModifier(actor, item, 'Damage', 'Damage/fire +5');
        expect(modifierManager.add.lastCall.args).to.have.deep.members([
            'damage.fire',
            'Damage',
            of(5),
            item,
            '',
            false
        ]);
    });

    it('should handle initiative modifier inversion', () => {
        addModifier(actor, item, '', 'Initiative +2');
        expect(modifierManager.add.lastCall.args).to.have.deep.members(['Initiative', '', of(-2), item, '', false]);
    });

    ([["+INT", 2], ["-INT", -3], ["INT", 4]] as const).forEach(([placeholder,expected])=> {
        it('should replace attribute placeholders with their values', () => {
            const system = sandbox.createStubInstance(CharacterDataModel);
            actor.attributes.intuition = new Attribute(actor, 'intuition');
            actor.system = system;
            const intuition = new CharacterAttribute({initial: 0, advances: Math.abs(expected), species: 0});
            system.updateSource.callThrough();
            system.updateSource({attributes: {intuition} as any})
            actor.system.updateSource({
                healthRegeneration: {multiplier: 1, bonus: 0},
                focusRegeneration: {multiplier: 1, bonus: 0},
                spellCostReduction: {addCostModifier: sandbox.stub()},
                spellEnhancedCostReduction: {addCostModifier: sandbox.stub()}
            } as any);

            addModifier(actor, item, '', `generalSkills.stealth ${placeholder}`);

            const callArgs =modifierManager.add.lastCall.args;
            expect(callArgs.slice(0,2)).to.have.deep.members(['generalSkills.stealth', '']);
            expect(callArgs.slice(3,6)).to.have.deep.members([item, '', false]);
            expect(evaluate(callArgs[2])).to.equal(expected);
        })
    });
});