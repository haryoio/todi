import { InternalContainer, typeInfo } from "./container.ts";
import { Constructor, Token } from "./interfaces/token.ts";
import { Reflect } from "./reflect.ts";
import { Dictionary } from "./type.ts";
import {
    TARGET_TYPE_METADATA_KEY,
    DEPENDENCIES_METADATA_KEY
} from "./interfaces/reflect.ts"
import { container as globalContainer } from './container.ts';
import { LIFETIME } from "./interfaces/lifetime.ts";


function setTypeInfo(target: Constructor<any>, tokens: Dictionary<Token<any>>) {
    const params: any[] = Reflect.getMetadata("design:paramtypes", target) || [];

    Object.keys(tokens).forEach(key => {
        params[+key] = tokens[key];
    });

    typeInfo.set(target, params);
}

export function Injectable<T>(): (target: Constructor<T>) => void {
    return (target: Constructor<T>) => {
        // パラメータに付与されたトークン情報を取得
        const tokens: Dictionary<Token<any>> = Reflect.getOwnMetadata(
            TARGET_TYPE_METADATA_KEY, target) || {}

        setTypeInfo(target, tokens)

    }
}

export function Inject(
    token: Token<any>,
): (target: any, propertyKey: string | symbol, parameterIndex: number) => any {
    return (
        target: any,
        _key: string | symbol,
        idx: number,
    ): any => {
        const dependencies = Reflect.getMetadata(DEPENDENCIES_METADATA_KEY, target.constructor) || {};
        dependencies[idx as number] = token;

        Reflect.defineMetadata(DEPENDENCIES_METADATA_KEY, dependencies, target.constructor);

        const descriptors: Dictionary<Token<any>> = Reflect.getOwnMetadata(TARGET_TYPE_METADATA_KEY, target) || {};

        descriptors[idx] = token;
        Reflect.defineMetadata(TARGET_TYPE_METADATA_KEY, descriptors, target);
    };
}

export function GlobalRegister<T>(token: Token<T>) {
    return function (target: Constructor<T>) {
        const provider = {
            useClass: target,
        }
        globalContainer.register(token, provider, { lifetime: LIFETIME.Singleton })
    }
}

export function Singleton<T>() {
    return (target: Constructor<T>) => {

        // シングルトンであることをメタデータに付与
        Reflect.defineMetadata("di:singleton", true, target);

        const tokens: Dictionary<Token<any>> = Reflect.getOwnMetadata(TARGET_TYPE_METADATA_KEY, target) || {};
        setTypeInfo(target, tokens);
    }
}

export function Register<T>(token: Token<T>, container: InternalContainer = globalContainer) {
    return (target: Constructor<T>) => {
        const provider = {
            useClass: target,
        }
        container.register(token, provider)
    }
}
