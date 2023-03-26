import { Constructor, Factory, Token } from './token.ts'

export interface ClassProvider<T> {
    useClass: Constructor<T>,
}

export interface ValueProvider<T> {
    useValue: T,
}

export interface TokenProvider<T> {
    useToken: Token<T>,
}

export interface FactoryProvider<T> {
    useFactory: Factory<T>
}

export type Provider<T = any> =
    | ClassProvider<T>
    | ValueProvider<T>
    | TokenProvider<T>
    | FactoryProvider<T>

