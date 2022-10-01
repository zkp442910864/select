import classNames from 'classnames';
import React from 'react';

import {IItemData, TSelected} from './TreeSelect.type';
import {useEvent} from './useFn/useEvent';

function TreeSelectItem<T>({item, multiple, selectData, onShowData, onChange}: IProps<T>) {


    const {hasChildren, isExpansion, disabled, checkedStatus} = item;
    const {expandEvent, multipleSelectItem, singleSelectItem} = useEvent();

    /** 展开/收缩 */
    const changeExpand = () => {
        expandEvent(item);
        onShowData();
    };

    /** 选中/取消 */
    const selectItem = () => {
        const newSetSelectData = multiple ? multipleSelectItem(item, selectData) : singleSelectItem(item);
        onChange(newSetSelectData);
    };

    return (
        <div
            className={classNames({
                'zzzz-tree-select-item': true,
                'zzzz-tree-select-item-disabled': disabled,
            })}
            style={{'--level': `${item.level}px`} as any}
            title={`${item.title}`}
            onClick={(e) => {
                if (disabled) {
                    changeExpand();
                } else if (hasChildren) {
                    if ((e.target as Element).parentElement?.classList.contains('zzzz-tree-select-item-arrows')) {
                        changeExpand();
                    } else {
                        selectItem();
                    }
                } else {
                    selectItem();
                }
            }}
        >
            <div className={classNames('zzzz-tree-select-item-arrows', {'zzzz-tree-select-item-arrows-expand': isExpansion})}>
                {
                    hasChildren
                        ? <div className="zzzz-iconfont zzzz-icon-youjiantou" />
                        : ''
                }
            </div>
            {
                multiple
                    ? (
                        <div className="zzzz-tree-select-item-checkbox">
                            {
                                checkedStatus === 0 &&
                                <div className="zzzz-iconfont zzzz-icon-checkbox-weixuan" />
                            }
                            {
                                checkedStatus === 1 &&
                                <div className="zzzz-iconfont zzzz-icon-checkbox-xuanzhongbufen" />
                            }
                            {
                                checkedStatus === 2 &&
                                <div className="zzzz-iconfont zzzz-icon-checkbox-xuanzhong" />
                            }
                        </div>
                    )
                    : (
                        <div className="zzzz-tree-select-item-checkbox">
                            {
                                checkedStatus === 0 &&
                                <div className="zzzz-iconfont zzzz-icon-radiobuttonunselect" />
                            }
                            {
                                checkedStatus === 2 &&
                                <div className="zzzz-iconfont zzzz-icon-radiobuttonselect" />
                            }
                        </div>
                    )
            }
            <div className="zzzz-tree-select-item-text">{item.title}</div>
        </div>
    );
}

export default TreeSelectItem;

interface IProps<T> {
    item: IItemData<T>;
    multiple: boolean;
    selectData: TSelected;
    /** 通知展示数据发生变化 */
    onShowData: () => void;
    /** 勾选数据发生变化 */
    onChange: (data: TSelected) => void;
}
