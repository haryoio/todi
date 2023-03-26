import {
    INJECTABLE_METADATA_KEY,
    DEPENDENCIES_METADATA_KEY
} from './interfaces/reflect.ts';
import { Reflect } from "https://deno.land/x/reflect_metadata@v0.1.12/mod.ts";

export { Reflect }

export function isInjectable(target: any): boolean {
    return Reflect.hasMetadata(INJECTABLE_METADATA_KEY, target)
}
export function getDependencies(target: any): any[] {
    return Reflect.getMetadata(DEPENDENCIES_METADATA_KEY, target)
}

