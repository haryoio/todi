import { container, Injectable, Inject } from 'https://raw.githubusercontent.com/haryoio/todi/main/mod.ts';

interface Logger {
    log(message: string): void;
}

class ConsoleLogger implements Logger {
    log(message: string): void {
        console.log(message);
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

container.register("Logger", { useClass: ConsoleLogger })
const app = container.resolve(App);
app.run();
