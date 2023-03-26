import { typeInfo } from "./container.ts";
import { Constructor, Token } from "./interfaces/token.ts";
import { Reflect } from "./reflect.ts"
import { Dictionary } from "./type.ts";

const TARGET_TYPE_METADATA_KEY = Symbol("di:paramtypes")
const INJECTABLE_METADATA_KEY = Symbol("di:injectable")
const DEPENDENCIES_METADATA_KEY = Symbol("di:dependencies")

export function Injectable<T>(): (target: Constructor<T>) => void {
    return (target: Constructor<T>) => {

        // パラメータの型情報を取得
        const params: any[] = Reflect.getMetadata("design:paramtypes", target) || []

        // パラメータに付与されたトークン情報を取得
        const tokens: Dictionary<Token<any>> = Reflect.getOwnMetadata(
            TARGET_TYPE_METADATA_KEY, target) || {}
        Reflect.defineMetadata(INJECTABLE_METADATA_KEY, params, target)
        // パラメータに付与されたトークン情報をパラメータの型情報にマージ
        Object.keys(tokens).forEach(key => {
            params[+key] = tokens[key]
        })

        // パラメータの型情報をグローバルに保存
        typeInfo.set(target, params)

    }
}

export function isInjectable(target: any): boolean {
    return Reflect.hasMetadata(INJECTABLE_METADATA_KEY, target)
}
export function getDependencies(target: any): any[] {
    return Reflect.getMetadata(DEPENDENCIES_METADATA_KEY, target)
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
