export interface ChatMessage {
    id: string,

    update(data: object): Promise<ChatMessage>

    getFlag(scope: string, key: string): object
}

export enum ChatMessageTypes {
    OTHER,
    OOC,
    IC,
    EMOTE
}

export interface User {
    isGM: boolean;
    id: string;
    active: boolean;
}

export interface Socket {
    on: (key: string, callback: () => void) => void;
    emit: (key: string, object: object) => void;
}

export interface Hooks {
    once: (key: string, callback: () => void) => void;
    on: (key: string, callback: () => void) => void;
}

export interface Die {
    faces: number;
    results: { active: boolean, result: number }[]
}

export interface OperatorTerm {
    operator: string;

}

export interface NumericTerm {
    number: number;
}

export interface Roll {
    evaluate: () => Promise<Roll>;
    _total: number
    readonly total: number
    terms: (Die | OperatorTerm | NumericTerm)[]
}

export interface Actor extends Document{
}

export interface TokenDocument extends Document{
    /** this is at least true for all the purposes for which we use {@link TokenDocument}*/
    readonly parent: Document;
    actor: Actor;
}

export interface Document {
    readonly id:string
    readonly documentName:string
    readonly parent?: Document
}
