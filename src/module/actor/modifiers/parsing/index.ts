export type ErrorMessage = string;


export interface ParsedModifier {
    path:string
    attributes: Record<string, string|number|ParsedExpression>
}

export type Value = ParsedExpression|number|string
export interface ParsedExpression {
    propertyPath:string
}