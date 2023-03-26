
// Singleton
// 複数のコンテナを通じてインスタンスを一つだけ共有する
// 同じ型を同じコンテナに複数登録することはできない
// Disposableを実装しているオブジェクトの場合,コンテナの破棄とともにオブジェクトがdisposeされる
export type Singleton = 'singleton';

// Scoped
// コンテナ毎に1つずつインスタンスが生成される
// コンテナが一つの場合,Singletonと同じ挙動をする
// Disposableを実装しているオブジェクトの場合,コンテナの破棄とともにオブジェクトがdisposeされる
export type Scoped = 'scoped';

// Transient
// オブジェクトが呼び出されるたびに別のインスタンスを生成する
// Disposeは行われない
export type Transient = 'transient';


export const LIFETIME = {
    Singleton: 'singleton' as Singleton,
    Scoped: 'scoped' as Scoped,
    Transient: 'transient' as Transient,
} as const

export type Lifetime = typeof LIFETIME[keyof typeof LIFETIME];
