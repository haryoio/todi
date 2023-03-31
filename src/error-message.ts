import { Provider } from "./interfaces/provider.ts";
import { Token } from './interfaces/token.ts';

export const ERROR_MESSAGE = {
    REGISTRATION_NOT_FOUND: (token: Token<any>) => `No registration found for token: ${token.toString()}`,

    INVALID_PROVIDER: (provider: any) => `Invalid provider: ${provider.toString()}`
    ,
    DISPOSED_CONTAINER: `Container is disposed.`,
    CIRCULAR_DEPENDENCY: (token: Token<any>) => `Circular dependency detected for token: ${token.toString()}`,
}

