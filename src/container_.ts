// import { Reflect } from "https://deno.land/x/reflect_metadata@v0.1.12/mod.ts";
// import { InjectionToken, Newable, Provider } from "./types.ts";
// import * as ts from "npm:typescript";
// import { DelayedConstructor } from './lazy.ts';

// export interface Injector {
//   resolve<T>(key: string): T;
//   register<T>(key: string, provider: Provider<T>): void;
// }

// export const KEY_TO_TOKEN = new Map<string, InjectionToken<any>>();

// class Container implements Injector {
//   private static instance: Container;
//   constructor(private registry = new Map<InjectionToken<any>, Provider<any>>()) { }

//   public static getInstance(): Container {
//     if (!Container.instance) {
//       Container.instance = new Container();
//     }
//     return Container.instance;
//   }

//   public resolve<T>(key: string): T {
//     // console.log(KEY_TO_TOKEN);
//     const token = KEY_TO_TOKEN.get(key);
//     if (!token) {
//       throw new Error(`No token found for key ${key}`);
//     }

//     const provider = this.registry.get(token);
//     if (!provider) {
//       throw new Error(`No provider found for key ${key}`);
//     }
//     // console.log("resolve key", key);
//     // console.log("provider ", provider.useClass);
//     if (provider.useClass) {
//       // useClass内のクラスで依存関係の解決を行う.
//       const dependencies = getDependencies(provider.useClass);
//       const instance = dependencies ? new provider.useClass(...dependencies) : new provider.useClass();
//       console.log(instance);
//       provider.instance = instance;
//     }
//     if (provider.useFactory) {
//       const instance = provider.useFactory();
//       provider.instance = instance;
//     }
//     if (provider.useValue) {
//       return provider.useValue;
//     }
//     if (provider.instance) {
//       return provider.instance;
//     }
//     throw new Error(``);
//   }

//   public register<T>(key: string, provider: Provider<T>): void {
//     // console.log(`token ${key} is registered for registry`);
//     const token = Symbol(key);
//     KEY_TO_TOKEN.set(key, token);
//     this.registry.set(token, provider);
//   }
// }

// function getDependencies<T>(target: Newable<T> | DelayedConstructor<T>): any[] | null {
//   const o = Object.entries(target).map(([name, impl]: [any, any]) => {
//     return container.resolve(name);
//   });
//   console.log(o);
//   return o;
// }

// export const container = Container.getInstance();
