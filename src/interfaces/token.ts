export type NormalToken = string | symbol

export type Token<T> =
    | Constructor<T>
    | Factory<T>
    | NormalToken

export type TokenString<T> = string & { __type__: T };

export type Constructor<T> = new (...args: any[]) => T

export type ConstructorArgs<T> = T extends new (...args: infer A) => any ? A : never;

export type Factory<T> = (...args: any[]) => T

