# 组件库

[文档地址](https://zkp442910864.github.io/antd-extends/)



平铺数据
    制作映射
        idToPath 找路径
        idToChildren 找子级
        idToPatch 找父级
        idToAllChildren id找所有嵌套子级
            value 做成映射来进行 checkStatsu 设置
        收集 禁用值
    handlerItem(item, level) 调用一个函数产生新对象（关联层级，原数据
        要返回一个新对象，避免污染数据
            {title, value, children, disabled, className}
            isChildren 是否存在子级数据
            isExpansion 是否展开
            isDisabled 是否禁用
            checkStatus 1选中 2未选 3半选
            choosableCount 可选择的条数，过滤禁用的

### 执行命令
```
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
