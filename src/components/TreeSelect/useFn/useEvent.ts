
import {useStateAutoStop, debounce, empty} from '../../utils';
import {IItemData, TSelected} from '../TreeSelect.d';

export function useEvent<T>() {

    /** 展开/收缩 */
    const expandEvent = (item: IItemData<T>) => {
        item.isExpansion = !item.isExpansion;
    };

    /** 多选 选中/取消 */
    const multipleSelectItem = (item: IItemData<T>, rawSelected: TSelected) => {
        const {hasChildren, checkedStatus, value, childrenAllKeyArr} = item;
        const newSetSelectData: TSelected = {...rawSelected};

        if (hasChildren) {

            childrenAllKeyArr.forEach((key) => {
                if (checkedStatus === 2) {
                    delete newSetSelectData[key];
                } else if (checkedStatus === 1 || checkedStatus === 0) {
                    newSetSelectData[key] = true;
                }
            });

        } else {
            if (checkedStatus === 2) {
                delete newSetSelectData[value];
            } else {
                newSetSelectData[value] = true;
            }
        }

        return newSetSelectData;
    };

    /** 单选 选中/取消 */
    const singleSelectItem = (item: IItemData<T>) => {
        const {hasChildren, checkedStatus, value} = item;
        const newSetSelectData: TSelected = {};

        if (checkedStatus === 2) {
            delete newSetSelectData[value];
        } else {
            newSetSelectData[value] = true;
        }

        return newSetSelectData;
    };

    return {
        expandEvent,
        multipleSelectItem,
        singleSelectItem,
    };
}
