export interface Sorting<T> {
  field: keyof T;
  direction: `ASC` | `DESC`;
}
