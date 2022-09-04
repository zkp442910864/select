import {useEffect, useRef, useState, useCallback, useMemo} from 'react';


/**
 * 同 useState 使用
 *
 * 扩展了返回上一次值的功能
 *
 * 组件销毁后不再执行
 * @param {*} val
 * @returns
 */
export const useStateAutoStop = <T>(val?: T) => {
    const [value, setValue] = useState(val);
    const lock = useRef(false);
    // 上一个值
    const prevValue = useRef<T>();

    const setNewValue: typeof setValue = (nVal) => {
        if (lock.current) return;

        prevValue.current = value;
        setValue(nVal);
    };

    // 开关控制
    useEffect(() => {
        lock.current = false;

        return () => {
            lock.current = true;
        };
    }, []);

    return [value, setNewValue, prevValue.current] as [T, typeof setValue, T];
};
