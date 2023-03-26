import { Reflect } from "./deps.ts";
import { container, Injectable } from "./src/mod.ts";
import { Inject } from "./src/decorators.ts";

interface UserService {
  getUser(id: string): string;
}
interface HelloService {
  hello(): string;
}
class UserServiceImpl implements UserService {
  constructor() { }
  getUser(id: string): string {
    return `User: ${id}`;
  }
}

container.register("UserService", {
  useValue: new UserServiceImpl(),
});

@Injectable()
class HelloServiceImpl implements HelloService {
  constructor(
    @Inject("UserService") private userService: UserService
  ) { }
  hello(): string {
    return "hello" + this.userService.getUser("Taro");
  }
}

container.register("HelloService", {
  useFactory: () => new HelloServiceImpl(container.resolve("UserService"))
});

const userService = container.resolve<UserService>("UserService");
console.log(userService.getUser("1"));
const helloService = container.resolve<HelloService>("HelloService");
console.log(helloService.hello());
