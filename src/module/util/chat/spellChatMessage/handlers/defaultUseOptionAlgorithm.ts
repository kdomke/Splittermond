import {DegreeOfSuccessAction, DegreeOfSuccessOptionData, isDegreeOfSuccessOptionData} from "../interfaces";

export const noOptionToUse = {
    usedDegreesOfSuccess: 0,
    action: () => {}
} as const
type OptionConsumer = (degreeOfSuccessOptionData:any) => DegreeOfSuccessAction;
export function configureUseOption(){
    let usedEvaluator:() => boolean = () => false;
    let optionOnCorrectHandlerEvaluator:(action:string) => boolean = () => true;

    function withUsed(used:() => boolean){
        usedEvaluator = used;
        return {withHandlesOptions,whenAllChecksPassed}
    }
    function withHandlesOptions(optionHandledByUs:(action:string) => boolean){
        optionOnCorrectHandlerEvaluator = optionHandledByUs;
        return {withUsed,whenAllChecksPassed}
    }
    function whenAllChecksPassed(optionConsumer:(degreeOfSuccessOptionData:DegreeOfSuccessOptionData) => DegreeOfSuccessAction){
        return {
            useOption:(degreeOfSuccessOptionData:DegreeOfSuccessOptionData)=>useOption(optionConsumer, degreeOfSuccessOptionData)
        };
    }

    function useOption(optionConsumer:OptionConsumer, degreeOfSuccessOptionData:DegreeOfSuccessOptionData):DegreeOfSuccessAction{
        if (usedEvaluator()) {
            console.warn("Attempt to alter a used cost action");
            return noOptionToUse;
        }
        if (!isDegreeOfSuccessOptionData(degreeOfSuccessOptionData)) {
            console.warn("Data passed from HTML object is not a valid degree of success option data");
            return noOptionToUse;
        }
        if (!optionOnCorrectHandlerEvaluator(degreeOfSuccessOptionData.action)) {
            console.warn("Attempt to perform an action that is not handled by this handler");
            return noOptionToUse;
        }
        return optionConsumer(degreeOfSuccessOptionData);
    }

    return {withUsed, withHandlesOptions, whenAllChecksPassed}


}