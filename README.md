# todi - A DI Container for TypeScript

todiはDeno向けのシンプルな依存性注入(DI)コンテナライブラリです.
TSyringeを参考にしています.

## 使い方

1. containerをインポートする.

```typescript
import { container } from 'https://raw.githubusercontent.com/haryoio/todi/main/mod.ts';
```

2. 注入したいクラスを定義する.

```typescript
interface Logger {
    log(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string) {
    console.log("LOG: " + message);
  }
}

container.register("Logger", { useClass: Logger });
```

3. 注入先のクラスに@injectable()デコレータを付与する.

```typescript
@injectable()
class App {
  constructor(@Inject("Logger") private logger: Logger) {}

  run() {
    this.logger.log("Hello World!");
  }
}
```

4. 依存関係を解決し, インスタンスを取得する.

```typescript
const app = container.resolve(App);
app.run();
```

### シングルトン

```typescript

@Singleton()
class ConsoleLogger implements Logger {
  log(message: string) {
    console.log("LOG: " + message);
  }
}

container.register<Logger>("Logger", { useClass: ConsoleLogger });

@injectable()
class App {
  constructor(@Inject("Logger") private logger: Logger) {}

  run() {
    this.logger.log("Hello World!");
  }
}

const app = container.resolve(App)
app.run()

const logger1 = container.resolve("Logger");
const logger2 = container.resolve("Logger");

console.log(logger1 === logger2) // true

```

### Registerデコレータ

container.register以外にも, Registerデコレータを使用して依存性を登録することができます.

```typescript
@Register("Logger)
class Logger {
  log(message: string) {
    console.log("LOG: " + message);
  }
}

@injectable()
@Register("Service")
class Service {
  constructor(@Inject("Logger") private logger: Logger) {}

  doSomething() {
    this.logger.log("Hello World!");
  }
}

const service = container.resolve("Service");
service.doSomething();
```
