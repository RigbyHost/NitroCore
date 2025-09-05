
export type Maybe<T> = T | null | undefined
export type Nullable<T> = T | null
export type MaybeUndefined<T> = T | undefined
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>