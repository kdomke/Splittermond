import {FoundryRoll, isRoll, OperatorTerm, RollTerm} from "../../../api/Roll";
import {AmountExpression, DieExpression, dividedBy, Expression, minus, plus, times} from "./definitions";
import {exhaustiveMatchGuard} from "./util";

type NoOperatorTerm = Exclude<RollTerm, OperatorTerm>;

export function mapRoll(roll:FoundryRoll):Expression {
    const termIterator = roll.terms[Symbol.iterator]()
    let leftTerm=termIterator.next();
    if(leftTerm.done || !isNoOperator(leftTerm.value)){
       throw new Error("Foundry Roll appears invalid, cannot map to expression");
    }
    let leftExpression:Expression;
    do {
        leftExpression = termToExpression(asNoOperator(leftTerm.value));
        const operator = termIterator.next();
        const rightTerm = termIterator.next();

        if(operator.done && rightTerm.done){
            return leftExpression;
        }else if(operator.done || rightTerm.done){
            throw new Error("Not enough terms to be a correct roll formula")
        }else if (asOperator(operator.value).operator === "+"){
            leftExpression = plus(leftExpression, termToExpression(asNoOperator(rightTerm.value)));
        }else if (asOperator(operator.value).operator === "-"){
            leftExpression = minus(leftExpression, termToExpression(asNoOperator(rightTerm.value)));
        }else if (asOperator(operator.value).operator === "*"){
            leftExpression = times(leftExpression, termToExpression(asNoOperator(rightTerm.value)));
        }else if (asOperator(operator.value).operator === "/"){
            leftExpression = dividedBy(leftExpression, termToExpression(asNoOperator(rightTerm.value)));
        }
        leftTerm = termIterator.next();
    }while(!leftTerm.done);
    return leftExpression;
}
function asOperator(term:RollTerm){
    if(!isNoOperator(term)){
       return term;
    } else{
        throw new Error(`Expected ${term} to be an operator but it was not`)
    }
}

function asNoOperator(term:RollTerm){
    if(isNoOperator(term)){
        return term;
    } else{
        throw new Error(`Expected ${term} not to be an operator but it was`)
    }

}

function isNoOperator(term:RollTerm):term is NoOperatorTerm{
    return !("operator" in term);
}

function termToExpression(term:NoOperatorTerm):Expression {
    if("faces" in term){
        return new DieExpression(term);
    } else if ("number" in term){
        return new AmountExpression(term.number);
    } else if ("roll" in term){
        if(!isRoll(term)){
            throw new Error("Found a term with a roll expression that was not a parenthetic expression")
        }
        return mapRoll(term.roll);
    }
    exhaustiveMatchGuard(term);
}