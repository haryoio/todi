import { Lifecycle } from "./interfaces/lifecycle.ts";
import { RegistrationOptions } from "./interfaces/registration.ts";
import {
  ClassProvider,
  FactoryProvider,
  isClassProvider, isFactoryProvider,
  isNormalToken,
  isProvider,
  isTokenDescriptor,
  isTokenProvider,
  isTransformDescriptor,
  isValueProvider,
  Provider,
  TokenProvider,
  ValueProvider
} from "./provider.ts";
import { Registration } from "./registration.ts";
import { ResolutionContext } from "./resolution-context.ts";

import { DependencyContainer, Disposable, PostResolutionInterceptorCallback, PreResolutionInterceptorCallback } from "./interfaces/container.ts";
import { isConstructorToken, isDisposable } from "./provider.ts";
import { Registry } from "./registry.ts";
import { InjectionToken, InterceptorOptions, Newable } from "./types.ts";
import { DelayedConstructor } from "./lazy.ts";
import Interceptors from "./interceptor.ts";
import { ResolutionType } from './interfaces/container.ts';
import { TokenDescriptor } from './provider.ts';

export type ParamInfo = InjectionToken<any> | TokenDescriptor;

export const typeInfo = new Map<Newable<any>, ParamInfo[]>();

export class InternalDependencyContainer implements DependencyContainer {
  private _registry = new Registry();
  private interceptors = new Interceptors();
  private disposed = false;
  private disposable = new Set<Disposable>();

  constructor(private parent?: InternalDependencyContainer) { }

  public register<T>(
    token: InjectionToken<T>,
    provider: ValueProvider<T>,
  ): InternalDependencyContainer;
  public register<T>(
    token: InjectionToken<T>,
    provider: FactoryProvider<T>,
  ): InternalDependencyContainer;
  public register<T>(
    token: InjectionToken<T>,
    provider: TokenProvider<T>,
    options?: RegistrationOptions,
  ): InternalDependencyContainer;
  public register<T>(
    token: InjectionToken<T>,
    provider: ClassProvider<T>,
    option?: RegistrationOptions,
  ): InternalDependencyContainer;
  public register<T>(
    token: InjectionToken<T>,
    provider: Newable<T>,
    options?: RegistrationOptions,
  ): InternalDependencyContainer;
  public register<T>(
    token: InjectionToken<T>,
    providerOrConstructor: Provider<T> | Newable<T>,
    options: RegistrationOptions = { lifecycle: Lifecycle.Transient },
  ): InternalDependencyContainer {
    // コンテナが破棄済みの場合エラー
    this.ensureNotDisposed();

    let provider: Provider<T>;

    if (!isProvider(providerOrConstructor)) {
      provider = { useClass: providerOrConstructor };
    } else {
      provider = providerOrConstructor;
    }

    if (isTokenProvider(provider)) {
      const path = [token];

      let tokenProvider: TokenProvider<T> | null = provider;
      while (tokenProvider != null) {
        const currentToken = tokenProvider.useToken;
        if (path.includes(currentToken)) {
          throw new Error(
            `Token registration cycle detected! ${[...path, currentToken].join(" -> ")}`,
          );
        }

        path.push(currentToken);

        const registration = this._registry.get(currentToken);

        if (registration && isTokenProvider(registration.provider)) {
          tokenProvider = registration.provider;
        } else {
          tokenProvider = null;
        }
      }
    }

    if (
      options.lifecycle === Lifecycle.Singleton ||
      options.lifecycle === Lifecycle.Containerd ||
      options.lifecycle === Lifecycle.Resolution
    ) {
      if (isValueProvider(provider) || isFactoryProvider(provider)) {
        throw new Error(
          `Cannot use lifecycle ${Lifecycle[options.lifecycle]} with ValueProviders or FactoryProviders`,
        );
      }
    }

    this._registry.set(token, { provider, options });
    return this
  }

  public registerType<T>(
    from: InjectionToken<T>,
    to: InjectionToken<T>,
  ): InternalDependencyContainer {
    this.ensureNotDisposed();

    if (isNormalToken(to)) {
      return this.register(from, {
        useToken: to,
      });
    }
    return this.register(from, {
      useClass: to,
    });
  }

  public registerInstance<T>(
    token: InjectionToken<T>,
    instance: T,
  ): InternalDependencyContainer {
    this.ensureNotDisposed();

    return this.register<T>(token, {
      useValue: instance,
    });
  }

  public resolve<T>(token: InjectionToken<T>, context: ResolutionContext = new ResolutionContext()): T {
    this.ensureNotDisposed();

    const registration = this.getRegistration(token);
    console.log("registration", registration)

    if (!registration && isNormalToken(token)) {
      throw new Error(
        `Attempted to resolve unregistered dependency token: ${token.toString()}`,
      );
    }

    this.executePreResolutionInterceptors<T>(token, "Single")

    if (registration) {
      const result = this.resolveRegistration(registration, context) as T;
      this.executePostResolutionInterceptors(token, result, "Single")
      return result;
    }
    console.log(isConstructorToken(token))
    if (isConstructorToken(token)) {
      const result = this.construct(token, context);
      this.executePostResolutionInterceptors(token, result, "Single")
      return result;
    }

    throw new Error(
      "Attempted to construct an undefined constructor. Could mean a circular dependency problem. Try using `delay` function."
    );
  }

  private executePreResolutionInterceptors<T>(
    token: InjectionToken<T>,
    resolutionType: ResolutionType
  ): void {
    if (this.interceptors.preResolutions.has(token)) {
      const remainingInterceptors = []
      for (const interceptor of this.interceptors.preResolutions.getAll(token)) {
        if (interceptor.options.frequency != "Once") {
          remainingInterceptors.push(interceptor)
        }
        interceptor.callback(token, resolutionType)
      }
      this.interceptors.preResolutions.setAll(token, remainingInterceptors)
    }
  }
  private executePostResolutionInterceptors<T>(
    token: InjectionToken<T>,
    result: T | T[],
    resolutionType: ResolutionType
  ): void {
    if (this.interceptors.postResolutions.has(token)) {
      const remainingInterceptors = []

      for (const interceptor of this.interceptors.postResolutions.getAll(token)) {
        if (interceptor.options.frequency != "Once") {
          remainingInterceptors.push(interceptor)
        }
        interceptor.callback(token, result, resolutionType)
      }

      this.interceptors.postResolutions.setAll(token, remainingInterceptors)
    }
  }

  public resolveAll<T>(
    token: InjectionToken<T>,
    context: ResolutionContext = new ResolutionContext(),
  ): T[] {
    this.ensureNotDisposed()

    const registrations = this.getAllRegistrations(token);

    if (!registrations && isNormalToken(token)) {
      throw new Error(
        `Attempted to resolve unregisterd depedency token: "${token.toString()}"`
      )
    }

    this.executePreResolutionInterceptors(token, "All")

    if (registrations) {
      const result = registrations.map((registration: Registration<any>) => this.resolveRegistration<T>(registration, context))

      this.executePostResolutionInterceptors(token, result, "All")
      return result;
    }

    const result = [this.construct(token as Newable<T>, context)]
    this.executePostResolutionInterceptors(token, result, "All")
    return result

  }
  public getAllRegistrations<T>(token: InjectionToken<T>): Registration[] | null {
    if (this.isRegistered(token)) {
      return this._registry.getAll(token);
    }
    if (this.parent) {
      return this.parent.getAllRegistrations(token);
    }

    return null;
  }

  private resolveRegistration<T>(registration: Registration, context: ResolutionContext): T {
    this.ensureNotDisposed();

    if (
      registration.options.lifecycle === Lifecycle.Resolution && context.scopedResolutions.has(registration)
    ) {
      return context.scopedResolutions.get(registration);
    }

    const isSingleton = registration.options.lifecycle === Lifecycle.Singleton;
    const isContainerd = registration.options.lifecycle === Lifecycle.Containerd;
    const returnInstance = isSingleton || isContainerd;

    let resolved: T;

    if (isValueProvider(registration.provider)) {
      resolved = registration.provider.useValue;
    } else if (isTokenProvider(registration.provider)) {
      resolved = returnInstance
        ? registration.instance ||
        (registration.instance = this.resolve(registration.provider.useToken, context))
        : this.resolve(registration.provider.useToken, context);
    } else if (isClassProvider(registration.provider)) {
      resolved = returnInstance
        ? registration.instance ||
        (registration.instance = this.construct(
          registration.provider.useClass,
          context,
        ))
        : this.construct(registration.provider.useClass, context);
    } else if (isFactoryProvider(registration.provider)) {
      resolved = registration.provider.useFactory(this);
    } else {
      resolved = this.construct(registration.provider, context);
    }

    if (registration.options.lifecycle === Lifecycle.Resolution) {
      context.scopedResolutions.set(registration, resolved);
    }

    return resolved;
  }

  private construct<T>(
    ctor: Newable<T> | DelayedConstructor<T>,
    context: ResolutionContext,
  ): T {

    if (ctor instanceof DelayedConstructor) {
      return ctor.createProxy((target: Newable<T>) =>
        this.resolve(target, context))
    }
    const instance: T = (() => {
      const paramInfo = typeInfo.get(ctor);
      if (!paramInfo || paramInfo.length === 0) {
        if (ctor.length === 0) {
          return new ctor();
        } else {
          throw new Error(`TypeInfo not known for "${ctor.name}"`);
        }
      }
      const params = paramInfo.map(this.resolveParams(context, ctor));
      return new ctor(...params);
    })();

    if (isDisposable(instance)) {
      this.disposable.add(instance);
    }
    return instance;
  }

  private resolveParams<T>(context: ResolutionContext, ctor: Newable<T>) {
    console.log(context, ctor)
    return (param: ParamInfo, idx: number) => {
      console.log(param, idx, context, ctor)
      try {
        if (isTokenDescriptor(param)) {
          if (isTransformDescriptor(param)) {
            return param.multiple
              ? this.resolve(param.transform).transform(
                this.resolveAll(param.token),
                ...param.transformArgs
              ) : this.resolve(param.transform).transform(this.resolve(param.token, context), ...param.transformArgs)
          } else {
            return param.multiple ? this.resolveAll(param.token, context) : this.resolve(param.token, context);
          }
        } else if (isTransformDescriptor(param)) {
          return this.resolve(param.transform, context).transform(
            this.resolve(param.token, context), ...param.transformArgs
          )
        }
        return this.resolve(param, context);
      } catch (e) {
        throw new Error(`Error resolving parameter ${idx} of ${ctor.name}: ${e.message}`);
      }
    };
  }

  public async dispose(): Promise<void> {
    this.disposed = true;
    const promises: Promise<unknown>[] = [];
    this.disposable.forEach((disposable) => {
      const maybePromise = disposable.dispose();

      if (maybePromise) {
        promises.push(maybePromise);
      }
    });

    await Promise.all(promises);
  }

  public isRegistered<T>(token: InjectionToken<T>, recursive = false): boolean {
    this.ensureNotDisposed();

    return (
      this._registry.has(token) ||
      (recursive &&
        (this.parent || false) &&
        this.parent.isRegistered(token, true))
    );
  }

  public reset(): void {
    this.ensureNotDisposed();
    this._registry.clear();
    this.interceptors.preResolutions.clear();
    this.interceptors.postResolutions.clear();
  }

  public clearInstances(): void {
    this.ensureNotDisposed();

    for (const [token, registrations] of this._registry.entries()) {
      this._registry.setAll(
        token,
        registrations.filter(registration => !isValueProvider(registration.provider)).map(registration => {
          registration.instance = undefined;
          return registration
        })
      )
    }
  }

  beforeResolution<T>(
    token: InjectionToken<T>,
    callback: PreResolutionInterceptorCallback<T>,
    options: InterceptorOptions = { frequency: "Always" }
  ): void {
    this.interceptors.preResolutions.set(token, {
      callback: callback,
      options: options
    });
  }

  afterResolution<T>(
    token: InjectionToken<T>,
    callback: PostResolutionInterceptorCallback<T>,
    options: InterceptorOptions = { frequency: "Always" }
  ): void {
    this.interceptors.postResolutions.set(token, {
      callback: callback,
      options: options
    });
  }

  private getRegistration<T>(token: InjectionToken<T>): Registration | null {
    console.log("getRegistration", token)
    if (this.isRegistered(token)) {
      console.log("isRegistered", this.isRegistered(token))
      return this._registry.get(token)!;
    }
    if (this.parent) {
      return this.parent.getRegistration(token);
    }
    return null;
  }

  private ensureNotDisposed(): void {
    if (this.disposed) {
      throw new Error(
        "This container has been disposed, you cannot interact with a disposed container",
      );
    }
  }
}

export const container: DependencyContainer = new InternalDependencyContainer()
export default container
