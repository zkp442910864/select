
/**
 * 为数据 生成唯一key
 */
export const generateDataKey = ({
    data,
    childrenKeyName,
    defaultField = '$extendTimeIndex',
    fillData = [],
}: IData) => {

    const handle = (data: TObj[], level = 0) => {

        data.forEach((item, index) => {
            if (!item[defaultField]) {
                item[defaultField] = `${Date.now()}-${parseInt((Math.random() * 100000000) + '', 10)}-${level}-${index}-${fillData.join('-')}`;
            }

            if (childrenKeyName) {
                const childKey = childrenKeyName;
                const child = item[childKey];
                if (child?.length) {
                    handle(child, level + 1);
                }
            }
        });
    };

    handle(data);

};


type TObj = {[key: string]: any};

interface IData {
    /**
     * 数据
     */
    data: TObj[];
    /**
     * 子级key
     */
    childrenKeyName?: string;
    /**
     * 生成 key 存放字段
     *
     * @default $extendTimeIndex
     */
    defaultField?: string;
    /**
     * 生成key 填充参数
     */
    fillData?: (string | number)[];
}
