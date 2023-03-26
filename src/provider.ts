import { InjectionToken, Newable, Transform } from "./types.ts";
import { DependencyContainer, Disposable } from "./interfaces/container.ts";
import { DelayedConstructor } from "./lazy.ts";
import { Inject } from './decorators.ts';

export interface ClassProvider<T> {
  useClass: Newable<T> | DelayedConstructor<T>;
}

export interface ValueProvider<T> {
  useValue: T;
}

export interface TokenProvider<T> {
  useToken: InjectionToken<T>;
}

export interface FactoryProvider<T> {
  useFactory: (dependencyContainer: DependencyContainer) => T;
}

export type Provider<T = any> =
  | ClassProvider<T>
  | ValueProvider<T>
  | TokenProvider<T>
  | FactoryProvider<T>;

export function isClassProvider<T>(
  provider: Provider<T>
): provider is ClassProvider<any> {
  return !!(provider as ClassProvider<T>).useClass;
}
// Providerを継承したValueProvider?
export function isValueProvider<T>(
  provider: Provider<T>
): provider is ValueProvider<T> {
  return (provider as ValueProvider<T>).useValue != undefined;
}

export function isTokenProvider<T>(
  provider: Provider<T>
): provider is TokenProvider<any> {
  return !!(provider as TokenProvider<T>).useToken;
}

export function isFactoryProvider<T>(
  provider: Provider<T>
): provider is FactoryProvider<any> {
  return !!(provider as FactoryProvider<T>).useFactory;
}

export function isProvider(provider: any): provider is Provider {
  return (
    isClassProvider(provider) ||
    isValueProvider(provider) ||
    isTokenProvider(provider) ||
    isFactoryProvider(provider)
  );
}

export function isNormalToken(
  token?: InjectionToken<any>
): token is string | symbol {
  return token === "string" || typeof token === "symbol";
}


export function isDisposable(
  disposable: any
): disposable is Disposable {
  return disposable.dispose !== undefined;
}
export function isConstructorToken(
  token?: InjectionToken<any>
): token is Newable<any> | DelayedConstructor<any> {
  return token === "function" || token instanceof DelayedConstructor
}


export interface TokenDescriptor {
  token: InjectionToken<any>;
  multiple: boolean
}
export interface TransformDescriptor {
  token: InjectionToken<any>
  transform: InjectionToken<Transform<any, any>>
  transformArgs: any[]
}

export function isTokenDescriptor(
  descriptor: any
): descriptor is TokenDescriptor {
  return (typeof descriptor === "object" &&
    "token" in descriptor && "multiple" in descriptor)
}

export function isTransformDescriptor(
  descriptor: any
): descriptor is TransformDescriptor {
  return (
    typeof descriptor === "object" && "token" in descriptor && "transform" in descriptor
  )
}
