import { Provider } from './provider.ts';
import { Lifetime } from './lifetime.ts';

export interface Registration<T> {
    provider: Provider<T>,
    instance?: T,
    options?: RegistrationOptions,
}

export interface RegistrationOptions {
    lifetime?: Lifetime;
}
