/**
 * ---
 * description: 提供项目通用的 TypeScript 高级工具类型，用于支持类型安全的路径提取和属性访问。
 * ---
 */

/**
 * 用于找值的路径 (e.g. "init.title")
 */
export type Path<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends string | number
          ? `${K}`
          : `${K}.${Path<T[K]>}`
        : never;
    }[keyof T]
  : never;

/**
 * 用于找对象的路径 (e.g. "command" | "command.init")
 * 它只匹配那些值是 object 的路径
 */
export type ObjectPath<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? // 关键点：既包含当前的 K，也包含递归的子路径
              `${K}` | `${K}.${ObjectPath<T[K]>}`
          : never
        : never;
    }[keyof T]
  : never;

/**
 * 用于根据路径 P 提取对象 T 中对应的值的类型
 */
export type PathValue<
  T,
  P extends string,
> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? PathValue<T[Key], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;
