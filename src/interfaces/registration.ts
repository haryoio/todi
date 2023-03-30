import { Provider } from './provider.ts';
import { Lifetime } from './lifetime.ts';
import { Token } from "./token.ts";

export interface Registration<T> {
    provider: Provider<T>,
    instance?: T,
    options?: RegistrationOptions,
}

export interface RegistrationOptions {
    lifetime?: Lifetime;
}

export interface InjectableOptions extends RegistrationOptions {
    token?: Token<any>
}
