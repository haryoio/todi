import { Register, container, Injectable, Inject } from "../mod.ts"
import { Singleton } from "../src/decorator.ts";

interface Logger {
    log(message: string): void;
}
interface Formatter {
    format(message: string): string;
}

@Register("Logger")
@Singleton()
class ConsoleLogger implements Logger {
    log(message: string): void {
        console.log(message);
    }
}

@Register("Formatter")
class UpperCaseFormatter implements Formatter {
    format(message: string): string {
        return message.toUpperCase();
    }
}

@Injectable()
class App {
    constructor(
        @Inject("Logger") private logger: Logger
    ) { }

    run(): void {
        this.logger.log("Hello, World!");
    }
}

const app = container.resolve(App);
app.run();

const logger1 = container.resolve<Logger>("Logger");
const logger2 = container.resolve<Logger>("Logger");

console.log(logger1 === logger2); // true

const formatter1 = container.resolve<Formatter>("Formatter");
const formatter2 = container.resolve<Formatter>("Formatter");

console.log(formatter1 === formatter2); // false
