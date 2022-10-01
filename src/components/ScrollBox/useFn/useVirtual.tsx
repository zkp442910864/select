import React, {useEffect, useMemo, useRef} from 'react';
import ReactDom from 'react-dom';
// import {createRoot} from 'react-dom/client';
import classNames from 'classnames';

import {useStateAutoStop, debounce} from '../../utils';
import {TObj, TVirtualData} from '../ScrollBox.d';

/** 兼容 reactDom 18 及以下 */
const compatibility = (dom: HTMLElement) => {
    const createRoot = undefined as any;
    let mount = (jsx: JSX.Element) => {};
    let unMount = () => {};

    if (typeof createRoot === 'undefined') {
        mount = (jsx: JSX.Element) => {
            ReactDom.render(jsx, dom);
        };

        unMount = () => {
            ReactDom.unmountComponentAtNode(dom);
        };
    } else {
        const root = createRoot(dom);
        mount = (jsx: JSX.Element) => {
            root.render(jsx);
        };

        unMount = () => {
            root.unmount();
        };
    }

    return {mount, unMount};
};

export function useVirtual<T>(virtualData: TVirtualData<T>, scrollBox: React.MutableRefObject<HTMLDivElement | null>) {
    const {
        list = [],
        virtualIsFixedHeight = true,
        renderItem,
        virtual,
        rowKey,
    } = virtualData;

    /** 默认高度 */
    const {current: config} = useRef({
        /** 开启虚拟滚动 */
        isVirtual: false,
        /** 默认高度 */
        defaultRowHeight: 10,
        /** 记录最后一次修改的值 */
        lastInfo: {
            start: undefined as number | undefined,
            end: undefined as number | undefined,
            scrollTop: -1 as number,
            totalHeight: undefined as number | undefined,
            reactDomEvent: null as null | ReturnType<typeof compatibility>,
        },
    });
    const totalRef = useRef<HTMLDivElement | null>(null);
    const domRef = useRef<HTMLDivElement | null>(null);
    const {current: mapRowHeight} = useRef<Record<string, number | undefined>>({});
    /** 开启滚动标识 */
    const [virtualStatus, setVirtualStatus] = useStateAutoStop(false);
    /** 重置标识 */
    const [resetFlag, reset] = useStateAutoStop({});

    /** 负责渲染数据 */
    const renderData = (data: T[], start: number, end: number) => {

        // if (config.lastInfo.start === start && config.lastInfo.end === end && virtualStatus) return;

        // 为了得到第一次渲染完成的时机
        return new Promise<void>((rel, rej) => {
            if (!domRef.current) {
                rej();
                return;
            }

            if (!config.lastInfo.reactDomEvent) {
                config.lastInfo.reactDomEvent = compatibility(domRef.current);
            }

            config.lastInfo.start = start;
            config.lastInfo.end = end;

            // config.lastInfo.reactDomEvent.unMount();
            config.lastInfo.reactDomEvent.mount(
                <>
                    {
                        data.slice(start, end).map((item) => {
                            const key = rowKey!(item);
                            return (
                                <div
                                    data-key={key}
                                    key={key}
                                    ref={(realDom) => {
                                        const domHeight = config.defaultRowHeight = realDom?.offsetHeight || config.defaultRowHeight;
                                        mapRowHeight[key] = domHeight || mapRowHeight[key];

                                        // 取最小
                                        // if (typeof mapRowHeight[key] === 'number' && typeof mapRowHeight.rowHeight === 'number') {
                                        //     mapRowHeight.rowHeight = Math.min(mapRowHeight[key]!, mapRowHeight.rowHeight);
                                        // } else if (typeof mapRowHeight[key] === 'number') {
                                        //     mapRowHeight.rowHeight = mapRowHeight[key]!;
                                        // }
                                        rel();
                                    }}
                                >
                                    {renderItem!(item, list!)}
                                </div>
                            );
                        })
                    }
                </>,
            );

            // 解决虚拟滚动 抖动问题
            // if (!config.isVirtual) return;
            // Promise.resolve().then(() => {
            //     setTimeout(() => {
            //         if (scrollBox.current) {
            //             scrollBox.current.scrollTop = config.lastInfo.scrollTop;
            //         }
            //     }, 0);
            // });
        });

    };

    /** 设置撑开dom高度 */
    const setDomTotalHeight = (val: number) => {
        if (config.lastInfo.totalHeight === val || !totalRef.current) return false;
        config.lastInfo.totalHeight = val;
        totalRef.current.style.height = `${val}px`;

        return true;
    };

    /** 设置距离顶部距离 */
    const setDomTopValue = (val: number) => {
        if (config.lastInfo.scrollTop === val || !domRef.current) return false;
        config.lastInfo.scrollTop = val;

        domRef.current.style.top = `${val}px`;

        return true;
    };

    /** 获取滚动事件和dom */
    const getScrollData = () => {

        /** 数据长度 */
        const listLength = list.length;
        /** 滚动容器 */
        const scrollBoxDom = scrollBox.current!;
        /** 滚动逻辑函数 */
        let scrollEvent = () => {};

        if (virtualIsFixedHeight) {

            scrollEvent = async () => {
                /** 容器可视高度 */
                const clientHeight = scrollBoxDom.clientHeight;
                /** 默认行高 */
                const rowHeight = config.defaultRowHeight;
                /** 条数 */
                const rows = Math.ceil(clientHeight / rowHeight) + 1;

                const scrollTop = scrollBoxDom.scrollTop;

                const start = Math.floor(scrollTop / rowHeight);
                const end = start + rows;

                // console.log(listLength);
                // console.log(rowHeight);
                // console.log(listLength * rowHeight);

                setDomTotalHeight(listLength * rowHeight);
                setDomTopValue(start * rowHeight);
                await renderData(list, start, end);
            };

        } else {

            /** 获取计算值 */
            const getComputedValue = (() => {
                /** 记录 scrollTop 对应的数据下标 */
                const scrollTopMap: Record<number, {topValue: number;startIndex: number}> = {};
                /** 对高度进行缓存 */
                let recordTotalHeight: number | undefined;

                return (scrollTop: number, defaultHeight: number) => {

                    const recordScrollData = scrollTopMap[scrollTop];

                    /** 判断是否统计真实高 */
                    let isTotalHeightRecord = true;
                    let totalHeight = recordTotalHeight || 0;
                    let topValue = typeof recordScrollData === 'object' ? recordScrollData?.topValue : 0;
                    let startIndex = typeof recordScrollData === 'object' ? recordScrollData?.startIndex : -1;

                    // 读缓存
                    if (totalHeight > 0 && typeof recordScrollData === 'object') {
                        return {
                            topValue,
                            totalHeight,
                            startIndex,
                        };
                    }

                    // 遍历统计
                    list.forEach((item, index) => {
                        const key = rowKey!(item);

                        // 有缓存总高时，不执行
                        if (typeof recordTotalHeight === 'undefined') {
                            totalHeight += (mapRowHeight[key] || defaultHeight);
                            if (typeof mapRowHeight[key] === 'undefined') {
                                isTotalHeightRecord = false;
                            }
                        }

                        // 得到 topValue startIndex
                        if (startIndex > -1) {
                            return;
                        }

                        // 累计到顶部距离
                        topValue += (mapRowHeight[key] || defaultHeight);
                        if (topValue >= scrollTop) {
                            startIndex = index;

                            topValue -= (mapRowHeight[key] || defaultHeight);

                            // 记录值
                            scrollTopMap[scrollTop] = {
                                startIndex,
                                topValue,
                            };
                        }


                    });

                    if (isTotalHeightRecord && typeof recordTotalHeight === 'undefined') {
                        recordTotalHeight = totalHeight;
                    }

                    return {
                        topValue,
                        totalHeight,
                        startIndex,
                    };
                };
            })();

            scrollEvent = async () => {
                /** 容器可视高度 */
                const clientHeight = scrollBoxDom.clientHeight;
                /** 默认行高 */
                const rowHeight = config.defaultRowHeight;
                /** 条数 */
                const rows = Math.ceil(clientHeight / rowHeight) + 1;

                const scrollTop = scrollBoxDom.scrollTop;
                const {startIndex, topValue, totalHeight} = getComputedValue(scrollTop, rowHeight);

                // const start = getStart(scrollTop, rowHeight);
                const start = startIndex;
                const end = start + rows;

                setDomTotalHeight(totalHeight);
                setDomTopValue(topValue);
                await renderData(list, start, end);
            };
        }

        scrollEvent();

        return {scrollEvent, scrollBoxDom};
    };

    /** 数据变化 */
    useEffect(() => {
        // debugger;
        const data = list;
        const dataLength = data.length;
        config.isVirtual = typeof virtual === 'boolean' ? virtual : (dataLength > 100);

        // 不需要虚拟滚动，直接渲染
        if (!config.isVirtual) {
            setVirtualStatus(false);
            setTimeout(async () => {
                await renderData(data, 0, dataLength);
                setDomTotalHeight(dataLength * config.defaultRowHeight) && setDomTopValue(0);
            }, 0);
            return;
        }

        reset({});
        setVirtualStatus(true);
    }, [list]);

    /** 设置滚动事件 */
    useEffect(() => {
        // debugger;

        if (!virtualStatus || !scrollBox.current) return;

        const {scrollEvent, scrollBoxDom} = getScrollData();
        const resizeEvent = debounce(() => {
            reset({});
        }, 1000);

        // 解决初始高度不对问题
        (async () => {
            await scrollEvent();
            scrollEvent();
        })();

        scrollBoxDom.addEventListener('scroll', scrollEvent, false);
        window.addEventListener('resize', resizeEvent, false);

        return () => {
            scrollBoxDom.removeEventListener('scroll', scrollEvent, false);
            window.removeEventListener('resize', resizeEvent, false);
        };

    }, [virtualStatus, resetFlag]);

    // useEffect(() => {
    //     return () => {
    //         try {
    //             config.lastInfo.reactDomEvent?.unMount();
    //         } catch (error) {
    //             // console.error(error);
    //         }
    //     };
    // }, []);

    // console.log(list.length * config.defaultRowHeight);

    return {
        /** 撑开高度 */
        leftLine: useMemo(() => <div className="zzzz-scroll-virtual-left-line" ref={totalRef} />, []),
        /** 吐出来的数据 */
        virtualRenderData: useMemo(() => <div ref={domRef} style={{left: 0, right: 0, position: 'absolute'}} />, []),
    };
}
