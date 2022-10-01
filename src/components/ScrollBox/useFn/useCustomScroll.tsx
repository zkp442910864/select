import React, {useEffect, useRef, createRef, useCallback, FC, useMemo} from 'react';
import classNames from 'classnames';

import {useStateAutoStop, throttleDebounce} from '../../utils';

/**
 * 自定义滚动轴
 * @param boxRef 容器盒子
 * @param contentRef 滚动盒子
 */
export const useCustomScroll = (boxRef: React.MutableRefObject<HTMLDivElement | null>, contentRef: React.MutableRefObject<HTMLDivElement | null>) => {

    // dom 相关
    const rightRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const rightChuckRef = useRef<HTMLDivElement | null>(null);
    const bottomChuckRef = useRef<HTMLDivElement | null>(null);

    // 是否展示滚动
    const scrollStatus = useRef({showRight: false, showBottom: false});
    // const [showRight, setShowRight] = useStateAutoStop(false);
    // const [showBottom, setShowBottom] = useStateAutoStop(false);

    // 记录值
    const {current: chuckRight} = useRef({top: 0, height: 0, chunkRatio: 0});
    const {current: chuckBottom} = useRef({left: 0, width: 0, chunkRatio: 0});
    const [, update] = useStateAutoStop({});

    /** 手动修改右边滚动栏样式 */
    const setRightChuckStyle = (data: typeof chuckRight) => {
        rightChuckRef.current!.style.top = `${data.top}px`;
        rightChuckRef.current!.style.height = `${data.height}px`;
    };

    /** 手动修改底部滚动栏样式 */
    const setBottomChuckStyle = (data: typeof chuckBottom) => {
        bottomChuckRef.current!.style.left = `${data.left}px`;
        bottomChuckRef.current!.style.width = `${data.width}px`;
    };

    /** 计算块 */
    const chuckCompute = (clientVal: number, scrollVal: number, barVal: number) => {
        return clientVal / scrollVal * barVal;
    };

    /** 计算值 */
    const resetValue = useCallback(() => {
        const contentDom = contentRef.current!;
        const clientHeight = contentDom.clientHeight;
        const scrollHeight = contentDom.scrollHeight;

        const clientWidth = contentDom.clientWidth;
        const scrollWidth = contentDom.scrollWidth;

        const openRight = scrollHeight > clientHeight;
        const openBottom = scrollWidth > clientWidth;
        // debugger;

        if (openRight) {
            chuckRight.chunkRatio = clientHeight / scrollHeight;
            chuckRight.height = Math.ceil(chuckCompute(clientHeight, scrollHeight, rightRef.current!.offsetHeight));
            chuckRight.height = Math.max(chuckRight.height, 14);
            setRightChuckStyle(chuckRight);
        }

        if (openBottom) {
            chuckBottom.chunkRatio = clientWidth / scrollWidth;
            chuckBottom.width = Math.ceil(chuckCompute(clientWidth, scrollWidth, bottomRef.current!.offsetWidth));
            chuckBottom.width = Math.max(chuckBottom.width, 14);
            setBottomChuckStyle(chuckBottom);
        }

        if (scrollStatus.current.showRight !== openRight || scrollStatus.current.showBottom !== openBottom) {
            scrollStatus.current.showRight = openRight;
            scrollStatus.current.showBottom = openBottom;
            update({});
        }

    }, []);

    /** 设置滚动轴位置 */
    const setScrollLocation = useCallback(() => {
        const contentDom = contentRef.current!;
        const scrollHeight = contentDom.scrollHeight;
        const scrollWidth = contentDom.scrollWidth;

        if (scrollStatus.current.showRight) {
            const offsetHeight = rightRef.current!.offsetHeight;
            const maxVal = offsetHeight - chuckRight.height;
            chuckRight.top = Math.min(chuckCompute(contentDom.scrollTop, scrollHeight, rightRef.current!.offsetHeight), maxVal);
            setRightChuckStyle(chuckRight);
        }

        if (scrollStatus.current.showBottom) {
            const offsetWidth = bottomRef.current!.offsetWidth;
            const maxVal = offsetWidth - chuckBottom.width;
            chuckBottom.left = Math.min(chuckCompute(contentDom.scrollLeft, scrollWidth, bottomRef.current!.offsetWidth), maxVal);
            setBottomChuckStyle(chuckBottom);
        }

    }, []);

    /** 获取滑块事件 */
    const getChuckDownEvent = (type: 'left' | 'top', content: HTMLDivElement) => {

        // const key = ['scrollTop', 'clientY', 'clientHeight', 'scrollHeight'];
        const getClientValue = (event: MouseEvent) => type === 'left' ? event.clientX : event.clientY;
        const getScrollValue = () => type === 'left' ? content.scrollLeft : content.scrollTop;
        const getChunkRatio = () => {
            if (type === 'left') {
                return content.clientWidth / content.scrollWidth;
            } else {
                return content.clientHeight / content.scrollHeight;
            }
        };
        const setScrollValue = (val: number) => {
            if (type === 'left') {
                content.scrollLeft = val;
            } else {
                content.scrollTop = val;
            }
        };

        /** 内部值 */
        const flagObj = {
            clientValue: 0,
            scrollValue: 0,
        };

        const move = (event: MouseEvent) => {
            // 滑动的距离， 把这块距离，根据比例换算成内容高度
            const py = getClientValue(event) - flagObj.clientValue;
            setScrollValue(flagObj.scrollValue + py / getChunkRatio());
        };

        const up = () => {
            document.removeEventListener('mousemove', move, false);
            document.removeEventListener('mouseup', up, false);
        };

        const down = (event: MouseEvent) => {
            event.stopPropagation();
            // event.preventDefault();
            // console.log(event);
            flagObj.clientValue = getClientValue(event);
            flagObj.scrollValue = getScrollValue();

            document.addEventListener('mousemove', move, false);
            document.addEventListener('mouseup', up, false);
            // return false;
        };

        return down;
    };

    /** 滑动轨迹 点击事件 */
    const barClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, barType: 'right' | 'bottom') => {
        // console.log(event.target.getBoundingClientRect().top);
        if (barType === 'right') {
            const local = event.clientY - (event.target as HTMLDivElement).getBoundingClientRect().top;
            contentRef.current!.scrollTop = (local - chuckRight.height / 2) / chuckRight.chunkRatio;
        } else {
            const local = event.clientX - (event.target as HTMLDivElement).getBoundingClientRect().left;
            contentRef.current!.scrollLeft = (local - chuckBottom.width / 2) / chuckBottom.chunkRatio;
        }
    };

    useEffect(() => {
        const boxDom = boxRef.current!;
        const contentDom = contentRef.current!;
        const rightChuckDom = rightChuckRef.current!;
        const bottomChuckDom = bottomChuckRef.current!;
        const rightDownEvent = getChuckDownEvent('top', contentDom);
        const bottomDownEvent = getChuckDownEvent('left', contentDom);
        const resizeEvent = throttleDebounce(() => {
            // debugger
            resetValue();
            setScrollLocation();
        }, 16);
        const observer = new MutationObserver(() => {
            // console.log(1);
            resizeEvent();
        });

        observer.observe(boxDom, {attributes: true, attributeFilter: ['style', 'class']});
        observer.observe(contentDom, {childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['style', 'class']});
        window.addEventListener('resize', resizeEvent, false);
        contentDom.addEventListener('scroll', setScrollLocation, false);
        rightChuckDom?.addEventListener('mousedown', rightDownEvent, false);
        bottomChuckDom?.addEventListener('mousedown', bottomDownEvent, false);

        // resizeEvent();
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', resizeEvent, false);
            contentDom.removeEventListener('scroll', setScrollLocation, false);
            rightChuckDom?.removeEventListener('mousedown', rightDownEvent, false);
            bottomChuckDom?.removeEventListener('mousedown', bottomDownEvent, false);
        };
    }, []);

    return {
        /** 右边滚动轴开启状态 */
        showRight: scrollStatus.current.showRight,
        /** 底部滚动轴开启状态 */
        showBottom: scrollStatus.current.showBottom,
        /** 右边滚动轴 */
        rightJsxElement: useMemo(() => (
            <div
                className={classNames('zzzz-scroll-right', {'zzzz-scroll-hidden': !scrollStatus.current.showRight})}
                ref={rightRef}
                onClick={(e) => barClick(e, 'right')}
            >
                <div
                    className="zzzz-scroll-chuck"
                    ref={rightChuckRef}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        ), [scrollStatus.current.showRight]),
        /** 底部滚动轴 */
        bottomJsxElement: useMemo(() => (
            <div
                className={classNames('zzzz-scroll-bottom', {'zzzz-scroll-hidden': !scrollStatus.current.showBottom})}
                ref={bottomRef}
                onClick={(e) => barClick(e, 'bottom')}
            >
                <div
                    className="zzzz-scroll-chuck"
                    ref={bottomChuckRef}
                    // style={{...chuckBottom}}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        ), [scrollStatus.current.showBottom]),
    };

};
