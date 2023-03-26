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
    static global() {
        throw new Error("Method not implemented.");
    }
    private _parent?: InternalContainer;
    private _disposed = false;

    private registry: Registry
    private static _global: Registry

    private disposeables: Set<Disposable> = new Set();

    constructor(
        parent?: InternalContainer,
    ) {
        this.registry = new Registry();

        this._parent = parent;
    }

    public get global(): Registry {
        if (!InternalContainer._global) {
            InternalContainer._global = new Registry();
        }
        return InternalContainer._global
    }

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

    public registerAll(registers: [Token<any>, Provider<any>][]): InternalContainer {
        throw new Error("Method not implemented.");
    }

    public resolve<T>(token: Token<T>): T {
        console.log("---start resolve---")

        const registration = this.registry.get(token as Token<T>)
        console.log("registration is exists?", registration ? "yes" : "no")

        if (!registration && isNormalToken(token)) {
            throw new Error(ERROR_MESSAGE.REGISTRATION_NOT_FOUND(token));
        }

        if (registration) {
            const resolvedRegistration = this.resolveRegistration(registration);
            return resolvedRegistration
        }

        if (isConstructorToken(token)) {
            const result = this.construct(token as Constructor<T>)
            return result
        }

        throw new Error(ERROR_MESSAGE.REGISTRATION_NOT_FOUND(token));

    }

    public resolveRegistration<T>(registration: Registration<T>): T {
        this.ensureNotDisposed()

        const { provider, options } = registration;

        const isSingleton = registration.options?.lifetime === LIFETIME.Singleton
        const isScoped = registration.options?.lifetime === LIFETIME.Scoped
        const returnInstance = isSingleton || isScoped


        let resolved: T;

        console.log(provider, options)

        if (isClassProvider(provider)) {
            console.log("isClassProvider")
            // クラスならインスタンス化する.
            const { useClass } = provider as ClassProvider<T>;
            console.log(registration)
            console.log("useClass is exists?", useClass ? "yes" : "no")
            console.log(useClass);
            resolved = returnInstance ?
                registration.instance || (registration.instance = this.construct(useClass)) :
                this.construct(useClass)
            if (options?.lifetime === "singleton") {
                this.global.set(useClass as Token<any>, { provider, options, instance: resolved })
            }
        } else if (isTokenProvider(provider)) {
            console.log("isTokenProvider")
            // トークンなら再度解決する
            const { useToken } = provider as TokenProvider<T>;
            resolved = this.resolve(useToken)
        } else if (isFactoryProvider(provider)) {
            console.log("isFactoryProvider")
            // ファクトリなら自身を引数に渡して実行する
            const { useFactory } = provider as FactoryProvider<T>;
            resolved = useFactory(this)
            if (options?.lifetime === "singleton") {
                this.global.set(useFactory as Token<any>, { provider, options, instance: resolved })
            }
        } else if (isValueProvider(provider)) {
            console.log("isValueProvider")
            // 値ならそのまま返す
            const { useValue } = provider as ValueProvider<T>;
            resolved = useValue
        } else {
            resolved = provider as T
        }

        console.log("resolved", resolved)

        return resolved;
    }

    private construct<T>(
        newable: Constructor<T>
    ): T {
        const parameterTypes = Reflect.getMetadata("design:paramtypes", newable)
        console.log("construct", parameterTypes)

        const instance = (() => {
            console.log("parameterTypes", parameterTypes);
            if (typeof parameterTypes === "undefined" || !parameterTypes) {
                console.log("new without args")
                return new newable()
            } else {
                const args = parameterTypes.map((paramType: Token<any>) => {
                    console.log("construct args: ", paramType)
                    const res = this.resolve(paramType)
                    console.log(res)
                    return res
                })
                console.log("args", args)
                console.log("new with args")
                return new newable(...args)
            }
        })()
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
