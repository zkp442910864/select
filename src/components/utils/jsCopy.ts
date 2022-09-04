
type TJsCopyObj = <T>(data: T, cache?: WeakMap<object, any>) => T;

/**
 * 深拷贝
 */
export const jsCopy: TJsCopyObj = (data: any, cache = new WeakMap()) => {
    // debugger
    // if (data === null || typeof data !== 'object') {
    //     return data;
    // }

    // if (typeof data === 'object' && data._isAMomentObject) return
    data = specialType(data);

    if (!isCopyType(data)) return data;

    // 循环引用
    const find = cache.get(data);
    if (find) {
        return find;
    }

    const obj: any = Array.isArray(data) ? [] : {};

    cache.set(data, obj);

    Object.keys(data).forEach((key: string) => {
        obj[key] = jsCopy(data[key], cache);
    });

    return obj;
};

/**
 * 判断是否符合的拷贝对象
 */
export const isCopyType = (data: any) => {

    if (
        typeof data !== 'object' ||
        data === null ||
        // 排除其他数据类型
        ![
            '[object Object]',
            '[object Array]',
            '[object Number]',
            '[object Boolean]',
            '[object String]',
        ].includes(Object.prototype.toString.call(data))
    ) return false;

    return true;
};

/**
 * 特殊类型复制
 *
 * 针对 Date moment 进行处理
 */
export const specialType = <T extends object>(data: any) => {

    if (data === null || typeof data !== 'object') return data as T;

    if (Object.prototype.toString.call(data) === '[object Date]') {
        return new Date(data) as T;
    }

    return data as T;
};
