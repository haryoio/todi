import { typeInfo } from "./container.ts";
import { Constructor, Token } from "./interfaces/token.ts";
import { Reflect } from "./reflect.ts";
import { Dictionary } from "./type.ts";
import {
    INJECTABLE_METADATA_KEY,
    TARGET_TYPE_METADATA_KEY,
    DEPENDENCIES_METADATA_KEY
} from "./interfaces/reflect.ts"
import { InjectableOptions, RegistrationOptions } from "./interfaces/registration.ts";
import container from './container.ts';
import { LIFETIME } from "./interfaces/lifetime.ts";


export function Injectable<T>(): (target: Constructor<T>) => void {
    return (target: Constructor<T>) => {

        // パラメータの型情報を取得
        const params: any[] = Reflect.getMetadata("design:paramtypes", target) || []

        // パラメータに付与されたトークン情報を取得
        const tokens: Dictionary<Token<any>> = Reflect.getOwnMetadata(
            TARGET_TYPE_METADATA_KEY, target) || {}

        // パラメータに付与されたトークン情報をパラメータの型情報にマージ
        Object.keys(tokens).forEach(key => {
            params[+key] = tokens[key]
        })
        console.log(`@Injectable: target: ${target}, params: ${params}`)

        // パラメータの型情報を保存
        typeInfo.set(target, params)
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
        // injectly
        const dependencies = Reflect.getMetadata(DEPENDENCIES_METADATA_KEY, target.constructor) || {}
        dependencies[idx as number] = token

        Reflect.defineMetadata(DEPENDENCIES_METADATA_KEY, dependencies, target.constructor)

        // tsyringe
        const descriptors: Dictionary<Token<any>> = Reflect.getOwnMetadata(TARGET_TYPE_METADATA_KEY, target) ||
            {};

        descriptors[idx] = token;
        Reflect.defineMetadata(TARGET_TYPE_METADATA_KEY, descriptors, target);
    };
}

export function GlobalRegister<T>(token: Token<T>) {
    return function (target: Constructor<T>) {
        const provider = {
            useClass: target,
        }
        container.register(token, provider, { lifetime: LIFETIME.Singleton })
    }
}

export function Singleton<T>() {
    return (target: Constructor<T>) => {
        Reflect.defineMetadata("di:singleton", "ok", target)

        // パラメータの型情報を取得
        const params: any[] = Reflect.getMetadata("design:paramtypes", target) || []

        // パラメータに付与されたトークン情報を取得
        const tokens: Dictionary<Token<any>> = Reflect.getOwnMetadata(
            TARGET_TYPE_METADATA_KEY, target) || {}

        // パラメータに付与されたトークン情報をパラメータの型情報にマージ
        Object.keys(tokens).forEach(key => {
            params[+key] = tokens[key]
        })
        // console.log(`@Injectable: target: ${target}, params: ${params}`)

        // パラメータの型情報を保存
        typeInfo.set(target, params)

    }
}
