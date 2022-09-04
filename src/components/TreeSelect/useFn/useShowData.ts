
import {useEffect, useRef} from 'react';

import {useStateAutoStop, debounce, empty, jsCopy, isCopyType} from '../../utils';
import {IProps, IOptions, TObj, IItemData, Expand, TCheckStatus, TSelected} from '../TreeSelect.d';

export function useShowData<T>(options: IItemData<T>[], selected: TSelected, other: Pick<IProps<T>, 'multiple' | 'disabledRoot'>) {
    type TArrData = typeof options;

    const [updateFlag, externalUpdate] = useStateAutoStop({});
    const [, update] = useStateAutoStop({});
    const {current: data} = useRef({
        showData: [] as TArrData,
    });

    /** 多选 设置选中状态 */
    const setMultipleCheckedStatus = (item: TArrData[number]) => {
        let checkStatus: TCheckStatus = 0;

        // debugger;
        if (item.hasChildren) {
            /** 命中标识 */
            // let emptyCount = 0;
            const values = item.childrenAllKeyArr;
            const noEmptyCount = values.filter(val => !empty(selected[val])).length;

            if (noEmptyCount === 0) {
                checkStatus = 0;
            } else {
                checkStatus = noEmptyCount === values.length ? 2 : 1;
            }

        } else if (!item.hasChildren) {
            checkStatus = empty(selected[item.value]) ? 0 : 2;
        }

        return checkStatus;
    };

    /** 单选 设置选中状态 */
    const setSingleCheckedStatus = (item: TArrData[number]) => {
        let checkStatus: TCheckStatus = 0;
        checkStatus = empty(selected[item.value]) ? 0 : 2;
        return checkStatus;
    };

    const handler = () => {
        const showData: TArrData = [];
        const list = options.slice();

        let index = 0;
        while (index < list.length) {
            const item = list[index];

            item.checkedStatus = other.multiple ? setMultipleCheckedStatus(item) : setSingleCheckedStatus(item);
            showData.push(item);

            if (item.hasChildren && other.disabledRoot) {
                item.disabled = true;
            }

            if (item.hasChildren && item.isExpansion) {
                // 重复，导致children没值
                list.splice(index + 1, 0, ...(item.children || []));
            }

            index++;
        }

        // console.log(showData);
        data.showData = showData;
    };

    // 数据变更
    useEffect(() => {
        // console.log(2);
        handler();
        update({});
    }, [options, updateFlag, selected]);

    // 数据被修改
    // useEffect(() => {
    //     handler();
    //     update({});
    // }, [updateFlag]);

    return {
        showData: data.showData,
        expandUpdateFn: () => externalUpdate({}),
    };
}
