import {
  ClassProvider,
  FactoryProvider, TokenProvider,
  ValueProvider
} from "../provider.ts";
import { InjectionToken, Newable } from "../types.ts";
import { RegistrationOptions } from "./registration.ts";

export interface Disposable {
  dispose(): Promise<void> | void;
}

export interface DependencyContainer extends Disposable {
  register<T>(
    token: InjectionToken<T>,
    provider: ValueProvider<T>
  ): DependencyContainer;
  register<T>(
    token: InjectionToken<T>,
    provider: FactoryProvider<T>
  ): DependencyContainer;
  register<T>(
    token: InjectionToken<T>,
    provider: TokenProvider<T>,
    option?: RegistrationOptions
  ): DependencyContainer;
  register<T>(
    token: InjectionToken<T>,
    provider: ClassProvider<T>,
    option?: RegistrationOptions
  ): DependencyContainer
  register<T>(
    token: InjectionToken<T>,
    provider: Newable<T>,
    option?: RegistrationOptions
  ): DependencyContainer;

  registerType<T>(
    from: InjectionToken<T>,
    to: InjectionToken<T>
  ): DependencyContainer;

  registerInstance<T>(
    token: InjectionToken<T>,
    instance: T
  ): DependencyContainer;

  resolve<T>(token: InjectionToken<T>): T;
  resolveAll<T>(
    token: InjectionToken<T>,
  ): T[];

  isRegistered<T>(
    token: InjectionToken<T>
    // recursive?: boolean
  ): boolean;

  reset(): void;
  clearInstances(): void;

  dispose(): Promise<void> | void;
}


export type ResolutionType = "Single" | "All"
export interface PreResolutionInterceptorCallback<T = any> {
  (token: InjectionToken<T>, resolutionType: ResolutionType): void;
}
export interface PostResolutionInterceptorCallback<T = any> {
  (token: InjectionToken<T>, result: T | T[], resolutionType: ResolutionType): void;
}
