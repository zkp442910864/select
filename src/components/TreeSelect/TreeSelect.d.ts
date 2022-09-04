
export interface IProps<T> {
    /**
     * 弹出窗口宽度，默认跟谁输入框
     * @default 100%
     */
    popupsMinWidth?: number | string;
    /**
     * 弹出窗口最大高度
     * @default 300
     */
    popupsMaxHeight?: number;
    /**
     * 虚拟滚动
     *
     * 数据超过 100 条自动开启，可手动控制
     */
    virtual?: boolean;
    /**
      * 虚拟滚动 是否固定高度
      * @default true
      */
    virtualIsFixedHeight?: boolean;
    /**
     * 树形数据
     *
     * 如果字段key不是标准类型，请使用 handlerItem 函数进行处理
     *
     * {title, value, children, disabled, className}
     */
    options?: T[];
    /** 字段映射处理 */
    handlerItem?: (item: T, level: number) => IOptions<T>;
    /** 选中值 */
    value?: TValue;
    /**
     * 选中回调
     *
     * 当出现匹配不到数据的时候，items会存在缺失的情况
     */
    onChange?: (keys: TValue, items: T | T[]) => void;
    /**
     * 多选
     * @default false
     */
    multiple?: boolean;
    /**
     * 禁选根部节点
     * @default false
     */
    disabledRoot?: boolean;
    /** 默认展开所有数据 */
    treeDefaultExpandAll?: boolean;
    /**
     * 最多显示多少个 tag
     * @default 50
     */
    maxTagCount?: number;
}

export interface IRef {
    focus: () => void;
}

export type TText = string | number;
export type TValue = string | number | Array<string | number>;

/** 0未选 1半选 2全选 */
export type TCheckStatus = 0 | 1 | 2;
export type TSelected = Record<string | number, true>;
export type TObj = {[key: TText]: any};

export interface IOptions<T> {
    /** 标题 */
    title: TText;
    /** key值 */
    value: TText;
    children?: T[];
    disabled?: boolean;
    className?: string;
    /** 是否展开 */
    isExpansion?: boolean;
}

/** 处理后的数据 */
export interface IItemData<T> extends Omit<IOptions<T>, 'children'> {
    /** 子级数据，处理过的 */
    children?: IItemData<T>[];
    /** 原生数据 */
    rawItem: T;
    /** 有子级 */
    hasChildren: boolean;
    /** 选中状态 */
    checkedStatus: TCheckStatus;
    /** 层级 */
    level: number;
    /** 父级数据 */
    parent?: IItemData<T>;
    /** 路径 */
    path: IItemData<T>[];
    /** 路径名称 */
    pathTitle: string;
    /** 路径key值 */
    pathValue: string;
    /** 收集所有子级key，方便判断 */
    childrenAllKeyArr: TText[];
    // childrenAllKeyMap: Partial<Record<number | string, IItemData<T>>>,
}


/** 类型展开 */
export type Expand<T> = T extends infer E
    ? {[O in keyof E]: Expand<E[O]>}
    : never;

// export type Expand2<T> = T extends infer E
//     ? [0, E] extends [infer E2, infer E3]
//         ? 0 | E3
//         : never
//     : never;
// export type Expand2<T, U> = T extends infer E
//     ? E | U
//     : never;

// type ee = Expand<IItemData<any>>;