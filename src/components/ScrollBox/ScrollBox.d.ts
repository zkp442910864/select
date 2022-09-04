import React, {ReactChildren, ReactChild, ReactNode} from 'react';

export interface IProps<T = TObj> {
    /**
     * 滚动容器最大高度
     * @default 500
     */
    maxHeight?: number;
    /** 滚动容器最大宽度，默认100% */
    maxWidth?: number;
    /** 固定宽度 */
    width?: number | string;
    /** 内容容器 class */
    className?: string;
    /** 内容容器 style */
    style?: React.CSSProperties;
    /** 通过children 插入数据 */
    children?: ReactNode;
    /** 通过遍历数据渲染 */
    list?: T[];
    /** 对应 list 每项的渲染 */
    renderItem?: (item: T, list: T[]) => JSX.Element;
    /**
     * 虚拟滚动
     *
     * 只有传入 list 数据时候才有效
     *
     * 数据超过 100 条自动开启，可手动控制
     */
    virtual?: boolean;
    /**
     * 虚拟滚动 是否固定高度
     * @default true
     */
    virtualIsFixedHeight?: boolean;
    /** 数据key */
    rowKey?: (item: T) => string | number;
}

export type TVirtualData<T> = Pick<IProps<T>, 'list' | 'renderItem' | 'virtual' | 'virtualIsFixedHeight' | 'rowKey'>;

export type TObj = Record<string, any>;
