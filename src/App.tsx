import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';

import '@/assets/style.less';

import TreeSelect from './components/TreeSelect';
// import ScrollBox from './components/ScrollBox';
import data from './data.json';

import {TValue} from './components/TreeSelect/TreeSelect.d';

// console.log(data);

let root: any;
export default () => {
    // console.time('入口耗时');

    // 主入口
    const Main = () => {
        const [val, setVal] = useState<TValue>([678]);
        const [options] = useState([
            {
                ID: 'xxxx',
                NAME: '全部',
                ITEMS: data,
            },
        ]);

        return (
            <div>
                {/* <div style={{width: 500, paddingLeft: 100, paddingTop: 200}}> */}
                {/* <div onClick={() => setVal([])}>1</div> */}
                <TreeSelect<any>
                    // disabledRoot={true}
                    multiple={true}
                    // multiple={false}
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
                    popupsMinWidth={600}
                    // options={data}
                    // treeDefaultExpandAll={true}
                    // virtualIsFixedHeight={false}
                    ref={(e) => {
                        console.log(e);
                        // e?.focus()
                    }}
                    value={val}
                    // virtual={false}
                    // virtual={true}
                    onChange={(keys, items) => {
                        console.log(keys, items);
                        setVal(keys);
                    }}
                />
                {/* <ScrollBox /> */}
            </div>
        );
    };

    if (!root) {
        root = createRoot(document.getElementById('root')!);
        console.log(root);
    }
    root.render(<Main />);
    // console.timeEnd('入口耗时');
};
