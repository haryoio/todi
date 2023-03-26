import { assertEquals, assertThrows } from "../deps.ts";
import { InternalContainer } from "../src/container.ts"
import { Injectable, Inject } from "../src/decorator.ts"
import { Token } from "../src/interfaces/token.ts";

Deno.test("DI Container: Register and resolve class provider", () => {
    const container = new InternalContainer();

    @Injectable()
    class Test {
        value = "test"
    }

    container.register<Test>("Test", { useClass: Test });

    const testInstance = container.resolve<Test>(Test);
    assertEquals(testInstance.value, "test");
})

Deno.test("DI Container: Register and resolve value provider", () => {
    const container = new InternalContainer();
    const token: Token<string> = "test value token"
    const value = "test value"

    container.register(token, { useValue: value });

    const testInstance = container.resolve(token);
    assertEquals(testInstance, value);
})

Deno.test("DI Container: Register and resolve factory provider", () => {
    const container = new InternalContainer();
    const token: Token<string> = "test value token"
    const value = "test value"

    container.register(token, { useFactory: () => value });

    const resolvedValue = container.resolve(token);
    assertEquals(resolvedValue, value);
})

Deno.test("DI Container: Register and resolve token provider", () => {
    const container = new InternalContainer();

    @Injectable()
    class Test {
        value = "test"
    }

    const token: Token<Test> = "test token"

    container.register<Test>(Test, { useClass: Test })
    container.register<Test>(token, { useToken: Test })

    const resolvedInstance = container.resolve<Test>(token)
    assertEquals(resolvedInstance.value, "test")
})

Deno.test("DI Container: RegisterAll and resolve", () => {

})

Deno.test("DI Container: Register and resolveAll class provider", () => { })

Deno.test("DI Container: Test transient lifetime", () => { })

Deno.test("DI Container: Test singleton lifetime", () => { })

Deno.test("DI Container: Test scoped lifetime", () => { })
