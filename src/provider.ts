import { Provider, ClassProvider, ValueProvider, TokenProvider, FactoryProvider } from "./interfaces/provider.ts";

export function isClassProvider<T>(
    provider: Provider<T>
): provider is ClassProvider<any> {
    return !!(provider as ClassProvider<T>).useClass
}

export function isValueProvider<T>(
    provider: Provider<T>
): provider is ValueProvider<T> {
    return (provider as ValueProvider<T>).useValue != undefined
}

export function isTokenProvider<T>(
    provider: Provider<T>
): provider is TokenProvider<any> {
    return !!(provider as TokenProvider<T>).useToken
}

export function isFactoryProvider<T>(
    provider: Provider<T>
): provider is FactoryProvider<any> {
    return !!(provider as FactoryProvider<T>).useFactory
}

export function isProvider(provider: any): provider is Provider {
    return (
        isClassProvider(provider) ||
        isValueProvider(provider) ||
        isTokenProvider(provider) ||
        isFactoryProvider(provider)
    )
}
