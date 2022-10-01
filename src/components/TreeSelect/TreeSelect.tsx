import React, {FC, ForwardedRef, forwardRef, Ref, RefAttributes, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import classNames from 'classnames';

import '../../assets/iconFont/iconfont.css';

import {useStateAutoStop, debounce, empty, useDebounceEffect} from '../utils';
import {IProps, IItemData, TObj, TSelected, IRef} from './TreeSelect.d';
import ScrollBox from '../ScrollBox';
import TreeSelectItem from './TreeSelectItem';
import SelectedItem from './SelectedItem';
import {useSelectData} from './useFn/useSelectData';
import {useInput} from './useFn/useInput';
import {useHandlerData} from './useFn/useHandlerData';
import {useSearch} from './useFn/useSearch';
import {useShowData} from './useFn/useShowData';
import './TreeSelect.less';

function TreeSelect<T> ({
    popupsMaxHeight = 300,
    virtualIsFixedHeight = true,
    multiple = false,
    disabledRoot = false,
    treeDefaultExpandAll = false,
    maxTagCount = 50,
    popupsMinWidth = '100%',
    filterOption = 'title',
    virtual,
    normalizer,
    options,
    value,
    onChange,
}: IProps<T> & RefAttributes<IRef<T>>, ref: Ref<IRef<T>>) {

    const dom = useRef<HTMLDivElement | null>(null);

    const [lock, setLock] = useStateAutoStop(false);
    const {selectData, selectKeys, setSelectData, isSelected, clearSelectData} = useSelectData();
    const {searchDom, searchText, clearSearch, focus, isFocus, downOrUp, leftOrRight, enterView, leaveView} = useInput(dom, selectKeys, setSelectData, {popupsMaxHeight, popupsMinWidth});
    const {idToItem, getValMap, allData, rootData} = useHandlerData<T>(options, normalizer, {treeDefaultExpandAll});
    const {filterRootData, filterAllData} = useSearch<T>(rootData, allData, searchText, filterOption);
    const {showData, expandUpdateFn} = useShowData<T>(filterRootData, selectData, {multiple, disabledRoot});
    // return <></>;
    // const [, update] = useStateAutoStop({});
    // const {current: state} = useRef({
    //     isFocus: false,
    // });

    // console.log(filterRootData, filterAllData);
    // console.log('~~~~~~~~~~~~~~~~~~~~~~~~', searchText);
    // console.log('rootData', rootData);
    // console.log('filterRootData', filterRootData);
    // console.log('showData', showData);

    useEffect(() => {
        if (!isFocus && searchText !== '') {
            clearSearch();
        }
    }, [isFocus]);

    // 同步外面值
    useEffect(() => {
        // 防止重复触发
        setLock(true);
        if (lock) {
            setLock(false);
            return;
        }

        const newSelectData: typeof selectData = {};

        if (Array.isArray(value)) {
            value.forEach((ii) => (newSelectData[ii] = true));
        } else if (!empty(value)) {
            newSelectData[value!] = true;
        }

        setSelectData(newSelectData);

    }, [value]);

    // 返回值
    useDebounceEffect(() => {
        // 防止重复触发
        setLock(true);
        if (lock) {
            setLock(false);
            return;
        }

        const keys: Array<string | number> = [];
        const items: T[] = [];
        selectKeys.forEach((key) => {
            const item = idToItem[key];
            if (item) {
                keys.push(item.value);
                items.push(item.rawItem);
            } else {
                keys.push(key);
            }
        });

        if (multiple) {
            onChange?.(keys, items);
        } else {
            onChange?.(keys[0], items[0]);
            leaveView();
        }

    }, [selectData], 0, false);

    // console.log(showData);
    // console.log(Object.keys(selectData));
    useImperativeHandle(ref, () => {

        return {
            focus,
            getValMap,
            // valueToItem: idToItem,
            // titleToItem: textToItem,
        };
    }, [options, rootData]);

    return (
        <div className="zzzz-tree-select-input-box" ref={dom} onClick={() => {enterView(); focus();}}>
            <SelectedItem
                idToItem={idToItem}
                maxTagCount={maxTagCount}
                multiple={multiple}
                selectKeys={selectKeys}
                onCloseItem={(key) => {
                    delete selectData[key];
                    setSelectData({...selectData});
                    focus();
                }}
            />
            {searchDom}

            <div className={classNames('zzzz-tree-select-arrows', {rolling: isFocus})}>
                <span className="zzzz-iconfont zzzz-icon-xiala" />
            </div>

            <div
                className={classNames('zzzz-tree-select-clear-all', {'zzzz-tree-select-hidden': !isSelected})}
                onClick={(e) => {
                    e.stopPropagation();
                    clearSelectData();
                    focus();
                }}
            >
                <span className="zzzz-iconfont zzzz-icon-qingchuneirong" />
            </div>

            {useMemo(() => {

                if (!isFocus) return <></>;

                if (!showData.length) {
                    return (
                        <div className={classNames('zzzz-tree-select-expansion-no-data', downOrUp, leftOrRight)} style={{minWidth: popupsMinWidth}}>
                            <div>暂无数据</div>
                        </div>
                    );
                }

                return (
                    <div className={classNames('zzzz-tree-select-expansion-data', downOrUp, leftOrRight)} style={{minWidth: popupsMinWidth}}>
                        <ScrollBox<IItemData<T>>
                            list={showData}
                            maxHeight={popupsMaxHeight}
                            renderItem={(item, list) => {
                                return (
                                    <TreeSelectItem<T>
                                        item={item}
                                        multiple={multiple}
                                        selectData={selectData}
                                        onChange={(newData) => {
                                            setSelectData(newData);
                                            focus();
                                        }}
                                        onShowData={() => {
                                            expandUpdateFn();
                                            focus();
                                        }}
                                    />
                                );
                            }}
                            rowKey={(item) => item.value}
                            virtual={virtual}
                            virtualIsFixedHeight={virtualIsFixedHeight}
                        // width={popupsMinWidth}
                        />
                    </div>
                );

            }, [isFocus, showData, downOrUp, selectData])}
        </div>
    );
}

export default forwardRef(TreeSelect as any) as typeof TreeSelect;

// const TreeSelect = <T extends object>({
//         popupsMaxHeight = 300,
//         virtualIsFixedHeight = true,
//         multiple = false,
//         disabledRoot = false,
//         treeDefaultExpandAll = false,
//         maxTagCount = 50,
//         popupsMinWidth = '100%',
//         virtual,
//         normalizer,
//         options,
//         value,
//         onChange,
//     }: IProps<T> & RefAttributes<IRef<T>>) => {
//     return (
//         <>1</>
//     );
// }
// export default TreeSelect;
