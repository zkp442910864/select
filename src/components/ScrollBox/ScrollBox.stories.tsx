import React, {FC, useEffect, useRef, useState} from 'react';
import {ComponentStory, ComponentMeta} from '@storybook/react';

import ScrollBox from './ScrollBox';
import {IProps} from './ScrollBox.type';
import {createTypeFn} from "../storybookUtils";

import data from '../../testData/data.json';
import dataOne from '../../testData/dataOne.json';

// const TreeSelect = OldTreeSelect as FC<IProps<any>>;
const Template: ComponentStory<typeof ScrollBox> = (args) => <ScrollBox {...args} />;

export const Base = Template.bind({});
Base.args = {
};
Base.storyName = '1.基础';

export default {
    title: 'ScrollBox 滚动容器',
    component: ScrollBox,
    parameters: {
        docs: {
            description: {
                // 描述内容，可以进行覆盖
                component: '',
            },
        },
    },
    subcomponents: {
    },
} as ComponentMeta<typeof ScrollBox>;