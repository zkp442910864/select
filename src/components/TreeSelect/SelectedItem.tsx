import React, {DOMAttributes, MouseEventHandler} from 'react';

import {empty} from '../utils';
import {IItemData, IProps as ITreeSelectProps, TSelected} from './TreeSelect.type';



function SelectedItem<T>({
    multiple,
    selectKeys,
    idToItem,
    onCloseItem,
    maxTagCount,
}: IProps<T>) {

    const list = selectKeys.slice(0, maxTagCount);

    const oneKey = selectKeys[0];
    const oneItem = !empty(oneKey) ? (idToItem[oneKey] || {title: oneKey, value: oneKey}) : undefined;

    const closeItem = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, key: number | string) => {
        e.stopPropagation();
        onCloseItem(key);
    };

    return (
        <>
            {
                multiple
                    ? (
                        <>
                            {
                                list.map((key) => {
                                    const item = idToItem[key] || {title: key, value: key};
                                    return (
                                        <div className="zzzz-tree-select-input-select-item" key={item.value} title={item.title.toString()}>
                                            {item.title}
                                            <span
                                                className="zzzz-iconfont zzzz-icon-qingchuneirong zzzz-tree-select-input-select-item-close"
                                                onClick={(e) => closeItem(e, key)}
                                            />
                                        </div>
                                    );
                                })
                            }

                            {
                                selectKeys.length > list.length &&
                                <div
                                    className="zzzz-tree-select-input-select-item show-count"
                                    title={`+${selectKeys.length - list.length}`}
                                >
                                    +{selectKeys.length - list.length}
                                </div>
                            }
                        </>
                    )
                    : (
                        <>
                            {
                                oneItem &&
                                <div className="zzzz-tree-select-input-select-item-single" title={oneItem.title.toString()}>
                                    {oneItem.title}
                                </div>
                            }
                        </>
                    )
            }
        </>
    );
}


export default SelectedItem;

interface IProps<T> extends Pick<Required<ITreeSelectProps<T>>, 'multiple' | 'maxTagCount'> {
    /** ????????? */
    selectKeys: Array<string | number>;
    /** ???????????? */
    idToItem: Record<string | number, IItemData<T>>;
    /** ?????????????????? */
    onCloseItem: (key: number | string) => void;
}


