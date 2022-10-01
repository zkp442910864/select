import classNames from 'classnames';
import React, {Dispatch, SetStateAction, useEffect, useMemo, useRef} from 'react';

import {useStateAutoStop, debounce, empty} from '../../utils';
import {IProps, TSelected} from '../TreeSelect.type';

export function useInput (
    dom: React.MutableRefObject<HTMLDivElement | null>,
    selectKeys: Array<string | number>,
    setSelectData: Dispatch<SetStateAction<TSelected | undefined>>,
    otherProps: Pick<Required<IProps<any>>, 'popupsMaxHeight' | 'popupsMinWidth'>,
) {

    const ref = useRef<HTMLInputElement | null>(null);

    const [search, setSearch] = useStateAutoStop('');
    const [isFocus, setIsFocus] = useStateAutoStop(false);
    const [downOrUp, setDownOrUp] = useStateAutoStop<'down' | 'up'>('down');
    const [leftOrRight, setLeftOrRight] = useStateAutoStop<'left' | 'right'>('left');

    /** 判断底部剩余距离 */
    const judgeBottom = () => {
        if (!dom.current) return;
        // const scrollTop = document.documentElement.scrollTop;
        const bottomValue = dom.current.getBoundingClientRect().bottom;
        setDownOrUp((window.innerHeight - bottomValue) < otherProps.popupsMaxHeight ? 'up' : 'down');
    };

    /** 判断右部剩余距离 */
    const judgeRight = () => {
        const popupsMinWidth = otherProps.popupsMinWidth;
        if (!dom.current || typeof popupsMinWidth === 'string') return;
        // popupsWidth
        // window.innerWidth
        if (window.innerWidth <= popupsMinWidth) {
            setLeftOrRight('left');
            return;
        }
        const {left} = dom.current.getBoundingClientRect();
        setLeftOrRight((window.innerWidth - left) < popupsMinWidth ? 'right' : 'left');
    };

    /** 进入 */
    const enterView = () => {
        !isFocus && setIsFocus(true);
        judgeBottom();
        judgeRight();
    };

    /** 离开 */
    const leaveView = () => {
        setIsFocus(false);
        setTimeout(() => {
            if (!ref.current) return;
            isFocus && ref.current.blur();
        }, 0);
    };


    useEffect(() => {
        const fn = (e: MouseEvent) => {
            if (!dom.current) return;
            if (dom.current.contains(e.target as Node) === false) {
                leaveView();
            }
        };

        document.documentElement.addEventListener('click', fn, false);

        return () => {
            document.documentElement.removeEventListener('click', fn, false);
        };
    }, []);

    return {
        /** 搜索dom */
        searchDom: useMemo(() => {
            return (
                <>
                    <div className={classNames('zzzz-tree-select-input-placeholder', {'zzzz-tree-select-hidden': !!search.length || selectKeys.length})}>请选择</div>

                    <input
                        className="zzzz-tree-select-input-view"
                        ref={ref}
                        type="text"
                        value={search}
                        onChange={(e) => {
                            !isFocus && setIsFocus(true);
                            setSearch(e.target.value || '');
                        }}
                        onKeyDown={(e) => {
                            // console.log(e.key);

                            // 后退 删除功能
                            if (empty(search) && e.key === 'Backspace') {
                                const val = selectKeys.pop();
                                if (empty(val)) return;

                                const newSelectData = selectKeys.reduce((map, key) => {
                                    map[key] = true;
                                    return map;
                                }, {} as Record<string | number, true>);

                                setSelectData(newSelectData);
                            }
                        }}
                    />
                </>
            );
        }, [search, selectKeys, isFocus]),
        /** 搜索文本 */
        searchText: search,
        /** 清空搜索文本 */
        clearSearch: () => setSearch(''),
        /** 获取焦点 */
        focus: () => {
            setTimeout(() => {
                if (!ref.current) return;
                isFocus && ref.current.focus();
            }, 0);
        },
        /** 焦点 */
        isFocus,
        /** 窗口位置 */
        downOrUp,
        leftOrRight,
        /** 进入函数 */
        enterView,
        /** 离开函数 */
        leaveView,
    };
}

export default useInput;
