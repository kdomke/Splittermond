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
    once: (key: string, callback: (...args:any[]) => void) => void;
    on: ((key: string, callback: (...args:any[]) => void) => void);
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

declare global {
    type Collection<T> = ReadonlyMap<string, T>

    class Actor extends FoundryDocument {
        items: Collection<Item>
    }

    class Item extends FoundryDocument {
        readonly actor: Actor
    }

    class TokenDocument extends FoundryDocument {
        /** this is at least true for all the purposes for which we use {@link TokenDocument}*/
        readonly parent: FoundryDocument;
        actor: Actor;
    }

    class FoundryDocument {
        constructor(data:Object, options?:Record<string, any>);
        readonly id: string
        readonly documentName: string
        readonly parent?: FoundryDocument
    }
}