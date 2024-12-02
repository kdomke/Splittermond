import {ActionInput} from "../interfaces";


export function configureUseAction(){
    let usedEvaluator:() => boolean = () => false;
    let actionOnCorrectHandlerEvaluator:(action:string) => boolean = () => true;
    let isOptionEvaluator: ()=>boolean = () => true;

    function withUsed(used:() => boolean){
        usedEvaluator = used;
        return {withHandlesActions, withIsOptionEvaluator,whenAllChecksPassed}
    }
    function withHandlesActions(optionHandledByUs:(action:string) => boolean){
        actionOnCorrectHandlerEvaluator = optionHandledByUs;
        return {withUsed,withIsOptionEvaluator, whenAllChecksPassed}
    }
    function withIsOptionEvaluator(optionEvaluator: ()=>boolean){
        isOptionEvaluator = optionEvaluator;
        return {withUsed, withHandlesActions, whenAllChecksPassed}
    }

    function whenAllChecksPassed(action: (actionData:ActionInput)=>Promise<void>){
        return {
            useAction:(actionData:ActionInput) => useAction(action, actionData),
        }
    }

    function useAction(action: (actionData:ActionInput)=>Promise<void>, actionData:ActionInput){
        if (usedEvaluator()) {
            console.warn("Attempt to use a used action");
            return Promise.resolve();
        }
        if(!isOptionEvaluator()) {
            console.warn(`Attempt to use an action that should not have been offered. Action: ${actionData.action}`)
            return Promise.resolve();
        }
        if (!actionOnCorrectHandlerEvaluator(actionData.action)){
            console.warn(`action ${actionData.action} is not handled by this handler`);
            return Promise.resolve();
        }
        return action(actionData);
    }
    return {withUsed,withIsOptionEvaluator, withHandlesOptions: withHandlesActions}
}

