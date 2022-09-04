import React, {useEffect, useRef, createRef, useCallback, FC} from 'react';
import classNames from 'classnames';

import {useCustomScroll} from './useFn/useCustomScroll';
import {useVirtual} from './useFn/useVirtual';
import {IProps, TObj} from './ScrollBox.d';
import './ScrollBox.less';

function ScrollBox<T>({
    maxHeight = 500,
    maxWidth,
    width,
    className,
    style,

    children,

    list,
    renderItem,
    virtual,
    virtualIsFixedHeight,
    rowKey,
}: IProps<T>) {
    const boxRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const {rightJsxElement, bottomJsxElement, showRight, showBottom} = useCustomScroll(boxRef, contentRef);
    const {leftLine, virtualRenderData} = useVirtual<T>({
        // list: new Array(500001).fill({a: 1}).map((ii, index) => ({...ii, index, cr: Math.random() > 0.5, dd: false})),
        // renderItem: (item: TObj) => {
        //     let dd;
        //     // if (item.cr) {
        //     if (item.dd) {
        //         dd = (
        //             <div style={{marginTop: -18}}>33333</div>
        //         );
        //     }
        //     return (
        //         <div onClick={() => console.log(boxRef)}>
        //             {item.index}
        //             {dd}
        //         </div>
        //     );
        // },
        // rowKey: (ii: TObj) => ii.index,
        list,
        renderItem,
        virtual,
        virtualIsFixedHeight,
        rowKey,
    }, contentRef);


    return (
        <div className="zzzz-scroll-box" ref={boxRef} style={{maxWidth, width}}>
            {rightJsxElement}
            {bottomJsxElement}
            <div
                className={classNames('zzzz-scroll-content', {'open-right': showRight, 'open-bottom': showBottom})}
                ref={contentRef}
                style={{maxHeight}}
            >
                {/* 容器 */}
                <div className={className} style={Object.assign(style || {}, {position: 'relative'})}>
                    {
                        typeof children !== 'undefined'
                            ? children
                            : (
                                <>
                                    {leftLine}
                                    {virtualRenderData}
                                </>
                            )
                    }
                </div>
            </div>
        </div>
    );
}

export default ScrollBox;
