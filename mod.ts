import { Container, Disposable } from "@/interfaces/container.ts"
import { RegistrationOptions, Registration } from "@/interfaces/registration.ts";
import { Constructor, Token } from "@/interfaces/token.ts";
import { Registry } from "@/registry.ts";
import { InternalContainer, container } from "@/container.ts";
import { Injectable, Inject, GlobalRegister, Singleton } from "@/decorator.ts";
import { Provider } from "@/interfaces/provider.ts";

export {
    Registry,
    InternalContainer,
    Injectable,
    Inject,
    GlobalRegister,
    Singleton,
    container,
};

export type {
    Constructor,
    Provider,
    Token,
    Container,
    RegistrationOptions,
    Registration
};
