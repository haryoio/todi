import { Reflect } from "../deps.ts";
import { ParamInfo, typeInfo } from './container.ts';
import { defineInjectionTokenMetadata, getParamInfo } from "./metadata.ts";
import { TokenDescriptor } from './provider.ts';
import { Dictionary, InjectionToken, Newable, Transform } from "./types.ts";

export const INJECTION_TOKEN_METADAT_KEY = "InjectionTokens";

export function Injectable<T>(): (target: Newable<T>) => void {
  return (target: Newable<T>): void => {
    typeInfo.set(target, getParamInfo(target))
  }
}

export function Inject(
  token: InjectionToken<any>,
): (target: any, propertyKey: string | symbol, parameterIndex: number) => any {
  return (
    _target: Object,
    _propertyKey: string | symbol,
    _parameterIndex: number,
  ): any => {
    return defineInjectionTokenMetadata(token);
  };
}

