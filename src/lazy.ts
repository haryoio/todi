import { Newable } from "./types.ts";


export class DelayedConstructor<T> {
    private reflectMethods: ReadonlyArray<keyof ProxyHandler<any>> = [
        "get",
        "getPrototypeOf",
        "setPrototypeOf",
        "getOwnPropertyDescriptor",
        "defineProperty",
        "has",
        "deleteProperty",
        "ownKeys",
        "apply",
        "construct",
        "set"
    ]

    constructor(private wrap: () => Newable<T>) { }

    public createProxy(resolver: (target: Newable<T>) => T): T {
        const target: object = {}
        let init = false;
        let value: T
        const delayedObject: () => T = () => {
            if (!init) {
                value = resolver(this.wrap())
                init = true
            }
            return value
        }
        return new Proxy(target, this.createHandler(delayedObject)) as T;
    }

    private createHandler(delayedObject: () => T): ProxyHandler<object> {
        const handler: ProxyHandler<object> = {};
        const install = (name: keyof ProxyHandler<any>): void => {
            handler[name] = (...args: any[]) => {
                args[0] = delayedObject();
                const method = Reflect[name]
                return (method as any)(...args);
            }
        }
        this.reflectMethods.forEach(install)
        return handler
    }
}

export function delay<T>(
    wrappedConstructor: () => Newable<T>
): DelayedConstructor<T> {
    if (typeof wrappedConstructor === "undefined") {
        throw new Error(
            "Attempt to `delay` undefined. Constructor must be wrapped in a callback"
        )
    }
    return new DelayedConstructor(wrappedConstructor)
}
