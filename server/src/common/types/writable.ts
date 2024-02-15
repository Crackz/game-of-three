/* eslint-disable @typescript-eslint/ban-types */
type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

export type WritableKeys<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>;
}[keyof T];

type DeepWritablePrimitive =
  | undefined
  | null
  | boolean
  | string
  | number
  | Function;
type DeepWritableArray<T> = Array<DeepWritable<T>>;
type DeepWritableMap<K, V> = Map<K, DeepWritable<V>>;
type DeepWritableSet<T> = Set<DeepWritable<T>>;
type DeepWritableObject<T> = {
  [K in WritableKeys<T>]: DeepWritable<T[K]>;
};

export type DeepWritable<T> = T extends DeepWritablePrimitive
  ? T
  : T extends Array<infer U>
    ? DeepWritableArray<U>
    : T extends Map<infer K, infer V>
      ? DeepWritableMap<K, V>
      : T extends Set<infer T>
        ? DeepWritableSet<T>
        : DeepWritableObject<T>;
