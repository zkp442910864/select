
import {useRef} from 'react';

import {useStateAutoStop, debounce, empty} from '../../utils';
import {IProps, IItemData, TObj, TSelected} from '../TreeSelect.d';

export const useSelectData = () => {
    const [selectData, setSelectData] = useStateAutoStop<TSelected>({});
    const selectKeys = useRef<Array<number | string>>([]);

    const newSetSelectData: typeof setSelectData = (newData) => {
        if (typeof newData === 'object') {
            selectKeys.current = Object.keys(newData).reverse();
            setSelectData(newData);
        }
    };


    return {
        /** 数据，对象 */
        selectData,
        /** 数据，数组 */
        selectKeys: selectKeys.current,
        /** 设置数据 */
        setSelectData: newSetSelectData,
        /** 是否选中数据 */
        isSelected: !!selectKeys.current.length,
        /** 清空数据 */
        clearSelectData: () => newSetSelectData({}),
    };

};
