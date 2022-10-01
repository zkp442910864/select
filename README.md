# @zzzz-/select

[文档地址](https://zkp442910864.github.io/antd-extends/)

## 执行命令

```base
    // 文档
    npm run storybook

    // 运行
    npm run start

    // 打包
    npm run clear
    npm run build:umd
    npm run build:es
    npm run build:tsc-types
    npm run build:lib // 合并上面4条命令

    // 发布命令
    npm run publish:patch
```

## 公式

- 滚动滑块高度(宽度)计算公式: `2 * 容器可视高度 / 容器滚动高度`
    - 换算方式: `容器可视高度 / 容器滚动高度 = x / 滚动块容器高度`
    - 基本上 `容器可视高度 === 滚动块容器高度`
    - `x 为滑块高度`
    - 滑块比例: `容器可视高度 / 容器滚动高度`

- 滚动距离`(scrollTop/scrollLeft)`换算公式: `滚动距离 * 容器可视高度 / 容器滚动高度`
    - 换算方式: `滚动距离 / 容器滚动高度 = x / 容器可视高度`
    - `x 为 top/left`距离

- 虚拟滚动计算方式:
    0.数据总数
    1.行高: 设置一个默认行高, 通过渲染后获取真实高度, 更新行高。
    2.行数: `容器可视高度 / 行高`, 行数可适当加大, 补充空白位
    3.起始位置(获取渲染数据起始位置): `滚动距离 / 行数`, 需要进行向上取舍
    4.结束位置: `起始位置 + 行数`
    5.设置总高: `数据总数 * 行高`
    6.设置浮动距离: `起始位置 * 行高`
