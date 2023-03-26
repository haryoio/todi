import { Token, NormalToken, Constructor } from "./interfaces/token.ts";

export function isNormalToken(
    token: Token<any>
): token is NormalToken {
    return (
        typeof token === "string" || typeof token === "symbol"
    )
}

export function isConstructorToken(
    token: Token<any>
): token is Constructor<any> {
    return typeof token === "function"
}

export function isToken(
    token: any
): token is Token<any> {
    return (
        isNormalToken(token) || isConstructorToken(token)
    )
}
