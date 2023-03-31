import { Registration } from "./interfaces/registration.ts";
import { Token } from "./interfaces/token.ts";
export default abstract class RegistryBase<T> {
    protected _registryMap = new Map<Token<any>, T[]>();

    public entries(): IterableIterator<[Token<any>, T[]]> {
        return this._registryMap.entries();
    }

    public forEach(callbackfn: (value: T[], key: Token<any>, map: Map<Token<any>, T[]>) => void, thisArg?: any): void {
        this._registryMap.forEach(callbackfn, thisArg);
    }

    public getAll(key: Token<any>): T[] {
        this.ensure(key);
        return this._registryMap.get(key)!;
    }

    public get(key: Token<any>): T | null {
        this.ensure(key);
        const value = this._registryMap.get(key)!;
        return value[value.length - 1] || null;
    }

    public set(key: Token<any>, value: T): void {
        this.ensure(key);
        this._registryMap.get(key)!.push(value);
    }

    public setAll(key: Token<any>, value: T[]): void {
        this._registryMap.set(key, value);
    }
    public has(key: Token<any>): boolean {
        this.ensure(key);
        return this._registryMap.get(key)!.length > 0;
    }

    public clear(): void {
        this._registryMap.clear();
    }

    public ensure(key: Token<any>): void {
        if (!this._registryMap.get(key)) {
            this._registryMap.set(key, []);
        }
    }
}

export class Registry extends RegistryBase<Registration<any>> {
    private static _global?: Registry;
    public static get global(): Registry {
        if (!this._global) {
            this._global = new Registry();
        }
        return this._global;
    }
}

