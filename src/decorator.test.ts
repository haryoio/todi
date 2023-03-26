import { Inject, Injectable, isInjectable, getDependencies } from "./decorator.ts";
import container from './container.ts';

interface ConfigDao {
    get(): string;
}
interface UserDao {
    get(): string;
}

interface UserRepository {
    get(): string;
}

interface UserService {
    get(): string;
}

class ConfigDaoImpl implements ConfigDao {
    get(): string {
        return "config"
    }
}
class UserDaoImpl implements UserDao {
    get(): string {
        return "user"
    }
}


@Injectable()
class UserRepositoryImpl implements UserRepository {
    constructor(
        @Inject("ConfigDao") private configDao: ConfigDao,
        @Inject("UserDao") private userDao: UserDao,
    ) { }
    get(): string {
        return this.userDao.get() + this.configDao.get();
    }
}

@Injectable()
class UserServiceImpl implements UserService {
    constructor(@Inject("UserRepository") private userRepository: UserRepository) { }
    get(): string {
        return this.userRepository.get();
    }
}

console.log("ConfigDaoImpl is Injectable? ", isInjectable(ConfigDaoImpl));
container.register("ConfigDao", { useValue: new ConfigDaoImpl() });

console.log("UserDaoImpl is Injectable? ", isInjectable(UserDaoImpl));
container.register("UserDao", { useValue: new UserDaoImpl() });


container.register("UserRepository", { useClass: UserRepositoryImpl });
console.log("UserRepositoryImpl is Injectable? ", isInjectable(UserRepositoryImpl))
console.log("UserRepositoryImpl dependencies: ", getDependencies(UserRepositoryImpl))

container.register("UserService", { useClass: UserServiceImpl });
console.log("UserServiceImpl is Injectable? ", isInjectable(UserServiceImpl))
console.log("UserServiceImpl dependencies: ", getDependencies(UserServiceImpl))


const userService = container.resolve<UserService>("UserService");
console.log(userService.get())
