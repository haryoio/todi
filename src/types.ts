import { DelayedConstructor } from './lazy.ts';
export type Dictionary<T> = {
  [key: string]: T;
};

export type Factory<T> = () => T;

export type Newable<T> = {
  new(...args: any[]): T
}
export type Abstruct<T> = {
  prototye: T;
};

export type Provider<T> = {
  useClass?: Newable<T> | DelayedConstructor<T>;
  useFactory?: Factory<T>;
  useValue?: T;
  instance?: T;
};

export type InjectionToken<T = any> = string | symbol | Newable<T> | DelayedConstructor<T>;
export interface Transform<TIn, TOut> {
  transform: (incoming: TIn, ...args: any[]) => TOut
}

export type Frequency = 'Once' | 'Always';
export interface InterceptorOptions {
  frequency: Frequency;
}
