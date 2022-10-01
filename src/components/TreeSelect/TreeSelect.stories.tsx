import React, {FC, useEffect, useRef, useState} from 'react';
import {ComponentStory, ComponentMeta} from '@storybook/react';

import TreeSelect from './TreeSelect';
import {IProps, IItemData, TObj, IOptions, IRef, TValue} from './TreeSelect.d';
import {createTypeFn} from "../storybookUtils";

import data from '../../testData/data.json';
import dataOne from '../../testData/dataOne.json';

// const TreeSelect = OldTreeSelect as FC<IProps<any>>;
const Template: ComponentStory<FC<IProps<any>>> = (args) => <div style={{minHeight: 250}}><TreeSelect {...args} /></div>;

export const Base = Template.bind({});
Base.args = {
    options: dataOne,
    normalizer: (item, level) => {
        return {
            title: item.NAME,
            value: item.ID,
            children: item.ITEMS,
        };
    },
    multiple: true,
    maxTagCount: 0,
    disabledRoot: true,
    treeDefaultExpandAll: true,
    popupsMaxHeight: 200,
    popupsMinWidth: 300
};
Base.storyName = '1.基础';

export const Search1 = () => {
    const [val, setVal] = useState<TValue>([678]);
    const [options] = useState([
        {
            ID: 'xxxx',
            NAME: '全部',
            ITEMS: data,
        },
    ]);

    return (
        <div style={{minHeight: 400}}>
            <TreeSelect<any>
                multiple={true}
                maxTagCount={0}
                normalizer={(item, level) => {
                    return {
                        title: item.NAME,
                        value: item.ID,
                        children: item.ITEMS,
                        isExpansion: level === 0 ? true : undefined,
                        // disabled: level === 0 ? true : undefined,
                    };
                }}
                options={options}
                // ref={(e) => {
                //     console.log(e);
                // }}
                value={val}
                onChange={(keys, items) => {
                    // console.log(keys, items);
                    setVal(keys);
                }}
            />
        </div>
    );
};
Search1.storyName = '2-1.勾选搜索项';
Search1.parameters = {
    docs: {
        description: {
            story: '搜索 劝业场街道,香港中路街道 进行全选',
        },
    },
};

export const Search2 = () => {
    const [val, setVal] = useState<TValue>([]);
    const [options] = useState([
        {
            ID: 'xxxx',
            NAME: '全部',
            ITEMS: data,
        },
    ]);

    return (
        <div style={{minHeight: 400}}>
            <TreeSelect<any>
                multiple={true}
                maxTagCount={0}
                normalizer={(item, level) => {
                    return {
                        title: item.NAME,
                        value: item.ID,
                        children: item.ITEMS,
                        isExpansion: level === 0 ? true : undefined,
                        // disabled: level === 0 ? true : undefined,
                    };
                }}
                options={options}
                // ref={(e) => {
                //     console.log(e);
                // }}
                value={val}
                onChange={(keys, items) => {
                    // console.log(keys, items);
                    setVal(keys);
                }}
            />
        </div>
    );
};
Search2.storyName = '2-2.逗号间隔搜索';
Search2.parameters = {
    docs: {
        description: {
            story: '搜索 劝业场街道,香港中路街道，新华街道, 吉阳区直辖村级区划, 石嘴山市 进行选择',
        },
    },
};

export const Search3 = () => {
    const [val, setVal] = useState<TValue>([]);
    const [options] = useState([
        {
            ID: 'xxxx',
            NAME: '全部',
            ITEMS: data,
        },
    ]);

    return (
        <div style={{minHeight: 400}}>
            <TreeSelect<any>
                multiple={true}
                maxTagCount={0}
                normalizer={(item, level) => {
                    return {
                        title: item.NAME,
                        value: item.ID,
                        children: item.ITEMS,
                        isExpansion: level === 0 ? true : undefined,
                        // disabled: level === 0 ? true : undefined,
                    };
                }}
                filterOption="all"
                options={options}
                // ref={(e) => {
                //     console.log(e);
                // }}
                value={val}
                onChange={(keys, items) => {
                    // console.log(keys, items);
                    setVal(keys);
                }}
            />
        </div>
    );
};
Search3.storyName = '2-3.title 和 value 值都可搜索';
Search3.parameters = {
    docs: {
        description: {
            story: '1122 或 大相各庄乡',
        },
    },
};

export const Normalizer = () => {
    const [val, setVal] = useState<TValue>([]);
    const [options] = useState([
        {
            ID: 'xxxx',
            NAME: '全部',
            ITEMS: data,
        },
    ]);

    return (
        <div style={{minHeight: 400}}>
            <TreeSelect<any>
                multiple={true}
                maxTagCount={0}
                normalizer={(item, level) => {
                    return {
                        title: item.NAME,
                        value: item.ID,
                        children: item.ITEMS,
                        isExpansion: level === 0 ? true : undefined,
                        disabled: (!item.ITEMS || !item.ITEMS.length) ? (Math.random() > 0.5 ? true : false) : undefined,
                        // isExpansion: true,
                    };
                }}
                options={options}
                // ref={(e) => {
                //     console.log(e);
                // }}
                value={val}
                onChange={(keys, items) => {
                    // console.log(keys, items);
                    setVal(keys);
                }}
            />
        </div>
    );
};
Normalizer.storyName = '3.数据规范化';
Normalizer.parameters = {
    docs: {
        description: {
            story: '通过 normalizer 进行字段替换，以及一些初始操作，返回的类型看 IOptions <br/>' +
                '规范化的数据 优先级大于 组件属性',
        },
    },
};

export const RefUse = () => {
    const [val, setVal] = useState<TValue>([]);
    const ref = useRef<IRef<any> | null>(null);
    const [options] = useState([
        {
            ID: 'xxxx',
            NAME: '全部',
            ITEMS: dataOne,
        },
    ]);

    useEffect(() => {
        console.log(ref.current?.getValMap());
    }, [ref])

    return (
        <div style={{minHeight: 400}}>
            <TreeSelect<any>
                multiple={true}
                // maxTagCount={0}
                normalizer={(item, level) => {
                    return {
                        title: item.NAME,
                        value: item.ID,
                        children: item.ITEMS,
                    };
                }}
                options={options}
                disabledRoot={true}
                ref={ref}
                value={val}
                onChange={(keys, items) => {
                    // console.log(keys, items);
                    setVal(keys);
                }}
            />
        </div>
    );
};
RefUse.storyName = '4.组件 ref 使用';
RefUse.parameters = {
    docs: {
        description: {
            story: '通过 ref 可以获取到键值映射的map, 控制台输出了',
        },
    },
};

export const Single = () => {
    const [val, setVal] = useState<TValue>([]);
    const ref = useRef<IRef<any> | null>(null);
    const [options] = useState([
        {
            ID: 'xxxx',
            NAME: '全部',
            ITEMS: data,
        },
    ]);

    return (
        <div style={{minHeight: 400}}>
            <TreeSelect<any>
                multiple={false}
                maxTagCount={0}
                normalizer={(item, level) => {
                    return {
                        title: item.NAME,
                        value: item.ID,
                        children: item.ITEMS,
                    };
                }}
                options={options}
                disabledRoot={true}
                treeDefaultExpandAll={true}
                ref={ref}
                value={val}
                onChange={(keys, items) => {
                    // console.log(keys, items);
                    setVal(keys);
                }}
            />
        </div>
    );
};
Single.storyName = '5.单选(multiple) + 禁止根节点(disabledRoot) + 全部展开(treeDefaultExpandAll)';
Single.parameters = {};


export const Story = createTypeFn<IProps<any>>();
export const IOptionsFn = createTypeFn<IOptions<any>>();
export const IRefFn = createTypeFn<IRef<any>>();

export default {
    title: 'TreeSelect 树形组件',
    component: TreeSelect,
    parameters: {
        docs: {
            description: {
                // 描述内容，可以进行覆盖
                component: '',
            },
        },
    },
    subcomponents: {
        Story: Story,
        IOptions: IOptionsFn,
        IRef: IRefFn,
    },
} as ComponentMeta<FC<IProps<any>>>;