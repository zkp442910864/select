
import React, {FC, forwardRef, useEffect, useRef} from 'react';

import {useStateAutoStop, debounce, empty} from '../../utils';
import {IProps, IOptions, TObj, IItemData} from '../TreeSelect.d';

export function useHandlerData<T> (options: IProps<T>['options'], handlerItem: IProps<T>['handlerItem'], otherProps: Pick<Required<IProps<T>>, 'treeDefaultExpandAll'>) {
    type TItemData = IItemData<T>;

    const [, update] = useStateAutoStop({});
    const data = useRef({
        /** 对应项 */
        idToItem: {} as Record<string | number, IItemData<T>>,
        /** 所有数据 */
        allData: [] as IItemData<T>[],
        /** 根节点数据 */
        rootData: [] as IItemData<T>[],
    });

    const defaultHandlerItem: Required<IProps<T>>['handlerItem'] = (item, level) => {
        return {
            ...(item as unknown as IOptions<T>),
        };
    };

    /** 处理 */
    const handlerData = () => {
        if (!Array.isArray(options)) return;
        const handler = handlerItem || defaultHandlerItem;

        const curData = data.current;
        const idToItem = curData.idToItem;
        const rootData = curData.rootData;
        const allData = curData.allData;

        /** 从根到最后子级 */
        const rootToLast = (data?: typeof options, parent?: TItemData, arr: TItemData[] = [], level = 0) => {

            if (!data) return arr;

            data.forEach((rawItem) => {
                const item = handler(rawItem, level);
                const key = item.value;
                const children = item.children;
                const hasChildren = !!children?.length;

                const newItem: TItemData = {
                    ...item,
                    children: undefined,
                    /** 原生数据 */
                    rawItem,
                    /** 有子级 */
                    hasChildren,
                    /** 是否展开 */
                    isExpansion: typeof item.isExpansion === 'boolean' ? item.isExpansion : otherProps.treeDefaultExpandAll,
                    /** 是否隐藏，用在搜索时候，进行过滤 */
                    // hide: false,
                    /** 选中状态 */
                    checkedStatus: 0,
                    /** 可选的条数，过滤禁用，过滤根 */
                    // haveChoiceCount: [],
                    /** 层级 */
                    level,
                    /** 父级数据 */
                    parent,
                    /** 路径 */
                    path: [...(parent?.path || [])],
                    pathTitle: '',
                    pathValue: '',
                    /** 收集所有子级key，方便判断 */
                    childrenAllKeyArr: [],
                };

                // 键值对
                if (idToItem[key]) {
                    console.warn(`出现了重复唯一值: ${key}`, idToItem[key], newItem);
                    return;
                } else {
                    idToItem[key] = newItem;
                }

                // 挂靠子级数据
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(newItem);
                }

                if (!hasChildren) {
                    newItem.path.forEach((item) => {
                        // collectMap[newItem.value] = newItem;
                        item.childrenAllKeyArr.push(newItem.value);
                    });
                }

                // 路径
                newItem.path.push(newItem);
                newItem.pathTitle = newItem.path.map(ii => ii.title).join('-');
                newItem.pathValue = newItem.path.map(ii => ii.value).join('-');
                // 数据push
                arr.push(newItem);
                // 递归
                rootToLast(children, newItem, arr, level + 1);

            });

            return arr;
        };

        options.forEach((item, index) => {

            // if (index !== 0) return;
            // if (index !== 15) return;
            // debugger;
            const rootAllData = rootToLast([item]);
            // const rootAllData = rooToLast2([item]);

            // console.log(rootAllData);

            // // 因为重复id，可能会导致没值
            if (rootAllData.length) {
                rootData.push(rootAllData[0]);
                allData.push(...rootAllData);
            }
        });

        // console.log(filterData);
        // console.log(curData);

        update({});
    };

    /** 数据源变动 */
    useEffect(() => {
        data.current = {
            idToItem: {},
            allData: [],
            rootData: [],
        };
        // console.time('aa');
        handlerData();
        // console.timeEnd('aa');
    }, [options]);

    return {
        ...data.current,
    };
}
