import { Container, Disposable } from "./src/interfaces/container.ts"
import { RegistrationOptions, Registration } from "./src/interfaces/registration.ts";
import { Constructor, Token } from "./src/interfaces/token.ts";
import { Registry } from "./src/registry.ts";
import { InternalContainer, container, createContainer } from "./src/container.ts";
import { Injectable, Inject, GlobalRegister, Singleton, Register } from "./src/decorator.ts";
import { Provider } from "./src/interfaces/provider.ts";

export {
    Registry,
    InternalContainer,
    Injectable,
    Inject,
    GlobalRegister,
    Singleton,
    container,
    createContainer,
    Register,
};

export type {
    Constructor,
    Provider,
    Token,
    Container,
    RegistrationOptions,
    Registration
};
