import { Provider } from "./provider.ts";
import { RegistrationOptions } from "./interfaces/registration.ts";

export type Registration<T = any> = {
  provider: Provider<T>;
  options: RegistrationOptions;
  instance?: T;
};
