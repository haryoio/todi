import { assertEquals, assertThrows } from "../deps.ts";
import { InternalContainer } from "../src/container.ts"
import { Injectable, Inject, Singleton } from "../src/decorator.ts"
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

    container.register<Test>(token, { useToken: Test })

    const resolvedInstance = container.resolve<Test>(token)
    assertEquals(resolvedInstance.value, "test")
})

Deno.test("DI Container: Register duplicate token Override", () => {
    const container = new InternalContainer();

    interface ITest {
        echo(value: string): string
    }

    @Injectable()
    class Test implements ITest {
        v = "test"
        echo(value: string) {
            return value + this.v
        }
    }

    @Injectable()
    class Test2 implements ITest {
        v = "test2"
        echo(value: string) {
            return value + this.v
        }
    }

    container.register<ITest>("Test", { useClass: Test });
    container.register<ITest>("Test", { useClass: Test2 });

    const testInstance = container.resolve<ITest>("Test");
    assertEquals(testInstance.echo("!"), "!test2");
})

Deno.test("DI Container: RegisterAll and resolve", () => {

})

Deno.test("DI Container: Register and resolveAll class provider", () => { })

Deno.test("DI Container: Test transient lifetime", () => { })

Deno.test("DI Container: Test singleton lifetime", () => {
    const container = new InternalContainer();

    @Singleton()
    class SingletonTest {
        value = "test"
    }

    container.register<SingletonTest>("Test", { useClass: SingletonTest })

    const testInstance1 = container.resolve<SingletonTest>("Test");
    const testInstance2 = container.resolve<SingletonTest>("Test");
    assertEquals(testInstance1 === testInstance2, true);
    assertEquals(testInstance1.value, "test");
})

Deno.test("DI Container: Test singleton and override item", () => {
    const container = new InternalContainer();

    @Singleton()
    class SingletonTest {
        value = "test"
    }

    @Singleton()
    class SingletonTest2 {
        value = "test2"
    }

    container.register<SingletonTest>("Test", { useClass: SingletonTest })
    container.register<SingletonTest>("Test", { useClass: SingletonTest2 })

    const testInstance1 = container.resolve<SingletonTest>("Test");
    const testInstance2 = container.resolve<SingletonTest>("Test");
    assertEquals(testInstance1 === testInstance2, true);
    assertEquals(testInstance1.value, "test2");
})

Deno.test("DI Container: Test scoped lifetime", () => { })
