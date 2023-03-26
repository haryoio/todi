import { ParamInfo } from "./container.ts";
import { INJECTION_TOKEN_METADAT_KEY } from "./decorators.ts";
import { TokenDescriptor } from "./provider.ts";
import { Dictionary, InjectionToken, Newable, Transform } from "./types.ts";
import { Reflect } from "../deps.ts";

export function getParamInfo(target: Newable<any>): ParamInfo[] {
    const params: any[] = Reflect.getMetadata("design:paramtypes", target) || []
    const injectionTokens: Dictionary<InjectionToken<any>> = Reflect.getOwnMetadata(INJECTION_TOKEN_METADAT_KEY, target) || {}
    Object.keys(injectionTokens).forEach(key => {
        params[+key] = injectionTokens[key]
    })
    return params
}

export function defineInjectionTokenMetadata(
    data: any,
    transform?: { transformToken: InjectionToken<Transform<any, any>>; args: any[] }
): (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
) => any {
    return function (
        target: any,
        _propertyKey: string | symbol,
        parametterIndex: number,
    ): any {
        const descriptors: Dictionary<InjectionToken<any> | TokenDescriptor> = Reflect.getOwnMetadata(INJECTION_TOKEN_METADAT_KEY, target) ||
            {};
        descriptors[parametterIndex] = transform ? {
            token: data, transform: transform.transformToken,
            transformArgs: transform.args || []
        } : data;
        Reflect.defineMetadata(INJECTION_TOKEN_METADAT_KEY, descriptors, target);
    };
}
