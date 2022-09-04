
/**
 * 判断值为空
 */
export function empty <T>(val: T | '') {
    if (typeof val === 'undefined' || val === null || val === '') {
        return true as TCheckEmpty<T>;
    }
    return false as TCheckEmpty<T>;
}

type TEmptyType = null | undefined | '';
type TCheckEmpty<T> = T extends TEmptyType ? true : false;

/**
 * 判断数组为空
 */
export const emptyArray = (val: any) => {
    if (empty(val)) return true;
    if (!Array.isArray(val)) {
        console.warn('判断数据，不为数组，请注意');
        return true;
    }

    if (!val.length) return true;

    return false;
};
