import { assertEquals, assertThrows } from "../deps.ts";
import { container, InternalContainer, createContainer } from "@/container.ts";
import { Injectable, Inject, Singleton, Register } from "@/decorator.ts";
import { Token } from "@/interfaces/token.ts";

Deno.test("Class provider registration and resolution", () => {
    const container = new InternalContainer();

    @Injectable()
    class Test {
        value = "test";
    }

    container.register<Test>("Test", { useClass: Test });

    const testInstance = container.resolve<Test>(Test);
    assertEquals(testInstance.value, "test");
});

Deno.test("Value provider registration and resolutoin", () => {
    const container = new InternalContainer();
    const token: Token<string> = "test value token";
    const value = "test value";

    container.register(token, { useValue: value });

    const testInstance = container.resolve(token);
    assertEquals(testInstance, value);
});

Deno.test("Factory provider registration and resolution", () => {
    const container = new InternalContainer();
    const token: Token<string> = "test value token";
    const value = "test value";

    container.register(token, { useFactory: () => value });

    const resolvedValue = container.resolve(token);
    assertEquals(resolvedValue, value);
});

Deno.test("Token provider registration and resolution", () => {
    const container = new InternalContainer();

    @Injectable()
    class Test {
        value = "test";
    }

    const token: Token<Test> = "test token";

    container.register<Test>(token, { useToken: Test });

    const resolvedInstance = container.resolve<Test>(token);
    assertEquals(resolvedInstance.value, "test");
});

Deno.test("Factory provider registration and resolution", () => {
    const container = new InternalContainer();

    interface ITest {
        echo(value: string): string;
    }

    @Injectable()
    class Test implements ITest {
        v = "test";
        echo(value: string) {
            return value + this.v;
        }
    }

    @Injectable()
    class Test2 implements ITest {
        v = "test2";
        echo(value: string) {
            return value + this.v;
        }
    }

    container.register<ITest>("Test", { useClass: Test });
    container.register<ITest>("Test", { useClass: Test2 });

    const testInstance = container.resolve<ITest>("Test");
    assertEquals(testInstance.echo("!"), "!test2");
});

Deno.test("RegisterAll and resolve", () => {
    const container = new InternalContainer();

    @Injectable()
    class A {
        value = "A";
    }

    @Injectable()
    class B {
        value = "B";
    }

    @Injectable()
    class C {
        value = "C";
    }

    container.registerAll([
        ["A", { useClass: A }],
        ["B", { useClass: B }],
        ["C", { useClass: C }],
    ]);

    const a = container.resolve<A>("A");
    const b = container.resolve<B>("B");
    const c = container.resolve<C>("C");

    assertEquals(a.value, "A");
    assertEquals(b.value, "B");
    assertEquals(c.value, "C");
});

Deno.test("Singleton lifetime", () => {
    const container = new InternalContainer();

    @Singleton()
    class SingletonTest {
        value = "test";
    }

    container.register<SingletonTest>("Test", { useClass: SingletonTest });

    const testInstance1 = container.resolve<SingletonTest>("Test");
    const testInstance2 = container.resolve<SingletonTest>("Test");
    assertEquals(testInstance1 === testInstance2, true);
    assertEquals(testInstance1.value, "test");
});

Deno.test("Singleton with override", () => {
    const container = new InternalContainer();

    @Singleton()
    class SingletonTest {
        value = "test";
    }

    @Singleton()
    class SingletonTest2 {
        value = "test2";
    }

    container.register<SingletonTest>("Test", { useClass: SingletonTest });
    container.register<SingletonTest>("Test", { useClass: SingletonTest2 });

    const testInstance1 = container.resolve<SingletonTest>("Test");
    const testInstance2 = container.resolve<SingletonTest>("Test");
    assertEquals(testInstance1 === testInstance2, true);
    assertEquals(testInstance1.value, "test2");
});

Deno.test("Global @Register", () => {
    @Injectable()
    @Register("A")
    class A {
        value = "A";
    }

    const a = container.resolve<A>("A");
    assertEquals(a.value, "A");
});

Deno.test("Local @Register", () => {
    const newContainer = new InternalContainer();

    @Injectable()
    @Register("A", newContainer)
    class A {
        value = "A";
    }

    const a = newContainer.resolve<A>("A");
    assertEquals(a.value, "A");
});

Deno.test("Unregistered token", () => {
    const container = new InternalContainer();

    class C { }

    try {
        container.resolve<C>("C");
        throw new Error("Expected on error due to unregistered token");
    } catch (error) {
        assertEquals(error.message, "No registration found for token: C");
    }
});

Deno.test("Child container resolves dependencies from parent container", () => {
    interface A { }
    const AToken = Symbol("A");

    class Parent implements A { }
    class Child implements A { }

    const parentContainer = createContainer();
    const childContainer = parentContainer.createChildContainer();

    parentContainer.register<A>("A", { useClass: Parent });
    childContainer.register<A>("A", { useClass: Child });

    const parentA = parentContainer.resolve<A>("A");
    const childA = childContainer.resolve<A>("A");

    assertEquals(parentA instanceof Parent, true);
    assertEquals(childA instanceof Child, true);
});
