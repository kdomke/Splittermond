export type ErrorMessage = string;


export interface ParsedModifier {
    path:string
    attributes: Record<string, Value>
}

export type Value = ParsedExpression|number|string
export interface ParsedExpression {
    propertyPath:string
}