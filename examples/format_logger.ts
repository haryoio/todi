import { container, Injectable, Inject } from "../mod.ts";


interface Logger {
    log(message: string): void;
}

interface Formatter {
    format(message: string): string;
}

class ConsoleLogger implements Logger {
    log(message: string): void {
        console.log(message)
    }
}


class UpperCaseFormatter implements Formatter {
    format(message: string): string {
        return message.toUpperCase();
    }
}

@Injectable()
class App {
    constructor(
        @Inject("Logger") private logger: Logger,
        @Inject("Formatter") private formatter: Formatter
    ) { }

    run(): void {
        this.logger.log(this.formatter.format("Hello, World!"));
    }
}

container.register<Logger>("Logger", { useClass: ConsoleLogger })
container.register<Formatter>("Formatter", { useClass: UpperCaseFormatter })
const app = container.resolve(App);
app.run();
