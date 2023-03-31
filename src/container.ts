import { Reflect } from "./reflect.ts";
import { Container, Disposable } from "./interfaces/container.ts";
import {
    ClassProvider,
    FactoryProvider,
    Provider,
    TokenProvider,
    ValueProvider,
} from "./interfaces/provider.ts";
import { RegistrationOptions, Registration } from "./interfaces/registration.ts";
import { Constructor, Token } from "./interfaces/token.ts";
import { Registry } from "./registry.ts";
import { isProvider, isClassProvider, isFactoryProvider, isTokenProvider, isValueProvider } from './provider.ts';
import { ERROR_MESSAGE } from './error-message.ts';
import { LIFETIME } from './interfaces/lifetime.ts';
import { isNormalToken, isConstructorToken } from './token.ts';

type ParamInfo = Token<any>

export const typeInfo = new WeakMap<Constructor<any>, ParamInfo[]>();

export class InternalContainer implements Container {
    private _parent?: InternalContainer;
    private _disposed = false;

    private registry: Registry
    private static _global: Registry

    // 破棄されるオブジェクトを保持するためのSet
    private disposeables: Set<Disposable> = new Set();

    constructor(
        parent?: InternalContainer,
    ) {
        this.registry = new Registry();

        this._parent = parent;
    }

    // グローバルregistryを返す
    public get global(): Registry {
        if (!InternalContainer._global) {
            InternalContainer._global = new Registry();
        }
        return InternalContainer._global
    }

    // トークン&プロバイダを登録
    // プロバイダの型ごとにオーバーロード
    register<T>(token: Token<T>, provider: Provider<T>): Container;
    register<T>(token: Token<T>, provider: FactoryProvider<T>): Container;
    register<T>(token: Token<T>, provider: TokenProvider<T>): Container;
    register<T>(token: Token<T>, provider: ValueProvider<T>): Container;
    register<T>(token: Token<T>, provider: ClassProvider<T>, options?: RegistrationOptions): Container;
    register<T>(
        token: Token<T>,
        constructorOrProvider: Provider<T> | Constructor<T>,
        options: RegistrationOptions = {
            lifetime: LIFETIME.Transient
        }
    ): InternalContainer {
        this.ensureNotDisposed();

        // まずTransientなスコープで登録する
        let provider: Provider<any>

        if (isProvider(constructorOrProvider)) {
            provider = constructorOrProvider as Provider;
        } else {
            provider = { useClass: constructorOrProvider as Constructor<T> };
        }

        if (isTokenProvider(provider)) {
            const path = [token];

            let tokenProvider: TokenProvider<T> | null = provider;
            while (tokenProvider != null) {
                const currentToken = tokenProvider.useToken as Token<T>;
                if (path.includes(currentToken)) {
                    throw new Error(
                        `Token registration cycle detected! ${[...path, currentToken].join(" -> ")}`,
                    );
                }

                path.push(currentToken);

                const registration = this.registry.get(currentToken);

                if (registration && isTokenProvider(registration.provider)) {
                    tokenProvider = registration.provider;
                } else {
                    tokenProvider = null;
                }
            }
        }

        this.registry.set(token, { provider, options });

        return this;
    }

    // 一度に複数のトークン&プロバイダを登録
    // すべてTransientなスコープとなる.
    public registerAll(registers: [Token<any>, Provider<any>][]): InternalContainer {

        registers.forEach(([token, provider]) => {
            this.register(token, provider);
        });

        return this;
    }

    // トークンを解決し,インスタンスを取得
    public resolve<T>(token: Token<T>): T {

        const registration = this.registry.get(token as Token<T>)

        if (!registration && isNormalToken(token)) {
            throw new Error(ERROR_MESSAGE.REGISTRATION_NOT_FOUND(token));
        }

        if (registration) {
            return this.resolveRegistration(registration);
        }

        if (isConstructorToken(token)) {
            const constructed = this.construct(token as Constructor<T>)
            return constructed
        }

        throw new Error(ERROR_MESSAGE.REGISTRATION_NOT_FOUND(token));

    }


    // 登録情報(Registration)を解決し,インスタンスを取得
    public resolveRegistration<T>(registration: Registration<T>): T {
        this.ensureNotDisposed()

        const { provider, options } = registration;


        const isSingleton = options?.lifetime === LIFETIME.Singleton
        const isScoped = options?.lifetime === LIFETIME.Scoped
        const returnInstance = isSingleton || isScoped

        if (isClassProvider(provider)) {
            // クラスならインスタンス化する.
            const { useClass } = provider as ClassProvider<T>;

            const resolved = returnInstance ?
                registration.instance || (registration.instance = this.construct(useClass)) :
                this.construct(useClass)

            return resolved

        }
        if (isTokenProvider(provider)) {
            // トークンなら再度解決する
            const { useToken } = provider as TokenProvider<T>
            return this.resolve(useToken)
        }
        if (isFactoryProvider(provider)) {
            // ファクトリなら自身を引数に渡して実行する
            const { useFactory } = provider as FactoryProvider<T>;
            const resolved = useFactory(this)
            return resolved
        }
        if (isValueProvider(provider)) {
            // 値ならそのまま返す
            const { useValue } = provider as ValueProvider<T>;
            return useValue
        } else {
            return provider as T
        }
    }

    // コンストラクタよりインスタンスを生成
    // シングルトンならグローバルにインスタンスを登録し,常にそれを返す.
    private construct<T>(
        newable: Constructor<T>
    ): T {
        const parameterTypes = Reflect.getMetadata("design:paramtypes", newable)
        // @Singleton()により付与されるメタデータ
        const isSingleton = Reflect.getMetadata("di:singleton", newable)

        const instance = (() => {
            // シングルトンならインスタンスを返す
            if (isSingleton) {
                const registration = this.global.get(newable)
                // グローバルにインスタンスがあればそれを返す
                if (registration && registration.instance) {
                    return registration.instance
                }
            }
            // これ以上DIがなければパラメータなしでインスタンス化
            if (typeof parameterTypes === "undefined" || !parameterTypes) {
                return new newable()
            } else {
                // DIがあればそれを解決してインスタンス化
                const args = parameterTypes.map((paramType: Token<any>) => {
                    return this.resolve(paramType)
                })
                return new newable(...args)
            }
        })()

        if (isSingleton) {
            const registration = this.global.get(newable)
            // グローバルにインスタンスがなければ登録する
            if (registration && !registration.instance) {
                registration.instance = instance
            }
            // グローバルに登録がなければインスタンスとともに登録する
            else {
                this.global.set(newable, { provider: { useClass: newable }, instance })
            }
        }

        return instance
    }

    createChildren(): InternalContainer {
        throw new Error("Method not implemented.");
    }
    getDependency<T>(token: Token<T>): T {
        throw new Error("Method not implemented.");
    }
    getParent(): InternalContainer | undefined {
        throw new Error("Method not implemented.");
    }

    // コンテナ内のすべての破棄可能オブジェクトを再帰的に破棄する
    public async dispose(): Promise<void> {
        this._disposed = true;
        const promises: Promise<unknown>[] = [];

        this.disposeables.forEach((disposeable) => {
            const result = disposeable.dispose();

            if (result) {
                promises.push(result);
            }
        })

        await Promise.all(promises)
    }

    private ensureNotDisposed() {
        if (this._disposed) {
            throw new Error(ERROR_MESSAGE.DISPOSED_CONTAINER);
        }
    }
}


const container = new InternalContainer();

export default container;
