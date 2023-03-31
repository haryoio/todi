import { Provider, ClassProvider, ValueProvider, TokenProvider, FactoryProvider } from "./provider.ts";
import { Constructor, Factory, Token } from "./token.ts";

export interface Disposable {
    dispose(): Promise<void> | void
}

export interface Container extends Disposable {
    register<T>(token: Token<T>, provider: Provider<T>): Container
    register<T>(token: Token<T>, provider: ClassProvider<T>): Container
    register<T>(token: Token<T>, provider: FactoryProvider<T>): Container
    register<T>(token: Token<T>, provider: TokenProvider<T>): Container
    register<T>(token: Token<T>, provider: ValueProvider<T>): Container

    registerAll(
        registers: [
            Token<any>,
            Provider<any>
        ][]
    ): Container

    resolve<T>(token: Token<T>): T

    createChildContainer(): Container

    getDependency<T>(token: Token<T>): T
    getParent(): Container | undefined

    dispose(): Promise<void> | void
}
