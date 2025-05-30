export type ResourceState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'empty' }
  | { status: 'loaded'; data: T }; 