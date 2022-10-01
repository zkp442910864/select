import {useEffect, useRef} from 'react';

import {useStateAutoStop, debounce, empty, jsCopy, isCopyType} from '../../utils';
import {IProps, IOptions, TObj, IItemData, Expand} from '../TreeSelect.type';

export function useSearch<T>(rootOptions: IItemData<T>[], allOptions: IItemData<T>[], externalSearch: string, filterOption: IProps<T>['filterOption'] = 'title') {
    type TArrData = typeof rootOptions;

    const [, update] = useStateAutoStop({});
    const cache = useRef<Record<string, typeof data.current>>({});
    const data = useRef({
        /** 根节点数据 */
        filterRootData: [] as TArrData,
        /** 根据搜索条件过滤出来的数据 */
        filterAllData: [] as TArrData,
    });

    /** 复制数据 */
    const currentCopy = (data: any, cache = new WeakMap()) => {
        // debugger;
        if (!isCopyType(data)) return data;

        const find = cache.get(data);
        if (find) {
            return find;
        }

        const isArray = Array.isArray(data);
        const newData: any = isArray ? [] : {};
        cache.set(data, newData);
        cache.set(newData, newData);

        if (isArray) {
            Object.keys(data).forEach((key) => {
                newData[key] = currentCopy(data[+key], cache);
            });
        } else {
            [
                // 保证 每一步处理，需要的前置数据都存在
                'path', 'value', 'children', 'disabled', 'childrenAllKeyArr', 'hasChildren', 'parent',
                ...Object.keys(data),
            ].forEach((key) => {
                // 存在，不在处理
                if (Reflect.has(newData, key)) return;

                if (!isArray && key === 'childrenAllKeyArr') {
                    // 清空 重新收集
                    newData.childrenAllKeyArr = [];
                } else if (!isArray && key === 'children') {
                    // 清空 重新收集
                    newData.children = Array.isArray(data.children) ? [] : undefined;
                } else if (!isArray && key === 'parent') {
                    // 在这一层 进行收集
                    const parentData = newData[key] = currentCopy(data[key], cache);
                    // const findParent = (item: any, cb: any) => {
                    //     cb(item);
                    //     item.parent && findParent(item.parent, cb);
                    // };

                    if (parentData) {
                        // debugger
                        // 因为数据都是按顺序的，直接找到父级push进去
                        parentData.children.push(newData);

                        // 最后一层的数据挂到所有父级上
                        if (!newData.hasChildren && !newData.disabled) {
                            newData.path.forEach((item: any) => {
                                // collectMap[newItem.value] = newItem;
                                item.children?.length && item.childrenAllKeyArr.push(newData.value);
                            });
                        }
                        // !newData.hasChildren && findParent(parentData, (item: any) => {
                        //     item.childrenAllKeyArr.push(newData.value);
                        // });
                    }
                } else if (!isArray && key === 'isExpansion') {
                    // 搜索时候，默认都展开
                    newData.isExpansion = true;
                } else {
                    newData[key] = currentCopy(data[key], cache);
                }
            });
        }

        return newData;
    };

    /** 按搜索条件进行过滤 */
    const filterItem = (() => {
        let searchArr: string[] | null = null;

        const judge = (keyword: string, value: number | string) => {
            const str = keyword.toString().trim().toLowerCase();
            const val = value.toString().trim().toLowerCase();
            // return dataStr.indexOf(value.toString().toLowerCase()) !== -1;
            // return str.indexOf(val) !== -1 || val.indexOf(str) !== -1;
            return val.indexOf(str) !== -1;
        };

        return (search: string, item: TArrData[number]) => {
            if (!searchArr) {
                searchArr = search.replace(/[,|，]/g, ',').toLowerCase().split(',').filter(ii => !empty(ii));
            }

            return searchArr.some((keyword) => {
                // if (item.title === '巴彦浩特新华街道办事处') {
                //     debugger;
                // }

                if (filterOption === 'title') {
                    return judge(keyword, item.title);
                }

                if (filterOption === 'value') {
                    return judge(keyword, item.value);
                }

                return judge(keyword, item.title) || judge(keyword, item.value);
            });
        };
    })();

    /** 填充过滤后数据 */
    const fillFilterData = (filterData: typeof data.current.filterAllData) => {
        let fillData: TArrData = [];
        // let dataCache = new WeakMap<TArrData[number], {oldChildren?: TArrData; newChildren?: TArrData}>();

        /** 去重 */
        const deWeight = (list: TArrData, newList: TArrData) => {
            return newList.filter(ii => list.indexOf(ii) === -1);
        };

        // 按 路径 进行补充数据, 并完善最后一层children的数据
        let rootIndex = 0;
        while (rootIndex < filterData.length) {
            const item = filterData[rootIndex];

            const pathLen = item.path.length - 1;
            item.path.forEach((pathItem, index) => {
                // debugger;

                if (fillData.indexOf(pathItem) === -1) {
                    fillData.push(pathItem);
                }

                if (index === pathLen && Array.isArray(pathItem.children)) {
                    const child = deWeight(filterData, pathItem.children);
                    if (!child.length) return;

                    const dataIndex = filterData.indexOf(pathItem);
                    dataIndex > -1 && filterData.splice(dataIndex + 1, 0, ...deWeight(filterData, pathItem.children));
                }
            });

            rootIndex++;
        }

        // debugger;
        // 复制一份
        fillData = currentCopy(fillData);

        return fillData;
    };

    /** 处理函数 */
    const handlerData = (search: string) => {

        const curData = data.current = {
            filterRootData: [] as TArrData,
            filterAllData: [] as TArrData,
        };
        const filterData: TArrData = [];

        allOptions.forEach((item) => {
            // 获取匹配数据
            if (filterItem(search, item)) {
                filterData.push(item);
            }
        });

        curData.filterAllData = fillFilterData(filterData);
        curData.filterRootData = curData.filterAllData.filter(ii => ii.parent === undefined);

        cache.current[search] = curData;
    };

    const init = () => {
        /** 判断缓存是否存在，存在进行更新 */

        // 空
        if (empty((externalSearch || '').toString().trim()) || !rootOptions.length || !allOptions.length) {
            data.current = {
                filterRootData: rootOptions,
                filterAllData: allOptions,
            };
            update({});
            return;
        }

        // 缓存
        if (cache.current[externalSearch]) {
            data.current = cache.current[externalSearch];
            update({});
            return;
        }

        handlerData(externalSearch);
        update({});
    };

    /** 清空缓存 */
    useEffect(() => {
        cache.current = {};
        init();
    }, [rootOptions, allOptions]);

    /** 过滤条件变动 */
    useEffect(() => {
        const t = setTimeout(() => {
            init();
        }, 300);

        return () => {
            clearTimeout(t);
        };
    }, [rootOptions, allOptions, externalSearch]);

    return data.current;
}

