import { container, Injectable } from "../mod.ts";

class Logger {
    log(message: string): void {
        console.log(message);
    }
}

@Injectable()
class App {
    constructor(
        private logger: Logger
    ) { }

    run(): void {
        this.logger.log("Hello, World!");
    }
}

container.register("Logger", { useClass: Logger })
const app = container.resolve(App);
app.run();

