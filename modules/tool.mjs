import { BASIC_TYPE } from './enum.mjs';


/**
 * @function 
 * @public 
 * @param {any} data
 * @param {'number' | 'string' | 'symbol' | 'bigint' | 'boolean' | Function} type 
 * @param {object} [options] 
 * @param {boolean} options.postError 
 * @return {boolean} 
 * @description Determine whether the variable is the required type.
 */
function dataTypeChecker(data, type, options = { postError: false }) {
    const { postError } = options;
    const typeDescStr = typeof type;
    switch (typeDescStr) {
        case "string": {
            let required = "'number' | 'string' | 'symbol' | 'bigint' | 'boolean' | Function";
            !BASIC_TYPE[type] && TypeErrorPoster(type, required);
            const dataDesc = typeof data;
            const flag = dataDesc === typeDescStr;
            !flag && postError && TypeErrorPoster(dataDesc, typeDescStr);
            return flag;
        }
        case "function": {
            const typeDesc = typeExplorer(type);
            const dataDesc = typeExplorer(data);
            if (BASIC_TYPE[dataDesc.type]) {
                let entered = dataDesc.type;
                let required = typeDesc.tagString || typeDesc.className
                postError && TypeErrorPoster(entered, required);
                return false;
            }
            let flag = data instanceof type;
            let entered = dataDesc.className || dataDesc.type;
            let required = typeDesc.className || typeDesc.type;
            !flag && postError && TypeErrorPoster(entered, required);
            return flag;
        }
        default: {
            let required = "'number' | 'string' | 'symbol' | 'bigint' | 'boolean' | Function";
            TypeErrorPoster(typeDescStr, required);
        }
    }
}


/**
 * @function 
 * @public 
 * @param {any} data 
 * @returns 
 * @description Explore specific types of data.
 */
function typeExplorer(data) {
    const dataDesc = typeof data;
    let result = {
        value: data,
        type: dataDesc,
        construct: null,
        tagString: void 0,
        className: void 0,
    }
    if (dataDesc === 'object' || dataDesc === 'function') {
        let constructor = data?.constructor;
        let className = constructor?.name;
        let reg = /(?<=\s)[a-zA-Z]{0,}/g;
        if (!className || className === '') {
            if (data !== null) {
                className = Object.prototype.toString.call(data).match(reg)[0];
            }
        }
        if (dataDesc === 'function') {
            result.tagString = dataDesc.name;
        }
        result.construct = constructor ?? null;
        result.className = className;
    }
    return result;
}


/**
 * @function 
 * @protected 
 * @param {string} entered 
 * @param {string} required 
 * @throws {TypeError} 
 */
function TypeErrorPoster(entered, required) {
    let message = `Here required ${required}, but entered ${entered}.`
    throw new TypeError(message);
}


/**
 * @function 
 * @param {Element} root 
 * @param {Element} child 
 * @returns {Element | null} 
 * @description 
 * Finds the element that is the immediate child of the element that holds the drag event.
 */
function getRootDirectChild(root, child) {
    if (child === root) return null;
    let eventNode = child;
    while (eventNode !== null && eventNode.parentElement !== root) {
        eventNode = eventNode?.parentElement;
    }
    return eventNode;
}


/**
 * 
 * @param {HTMLCollection} siblings 
 * @param {Array<DOMRect>} domRects 
 * @param {number} dragIndex 
 * @param {number} dropIndex 
 * @returns {void} 
 * @description Animation.
 */
function requestAnimation(siblings, domRects, dragIndex, dropIndex) {
    let siblingsLen = siblings.length;
    if (dragIndex < dropIndex) {
        // Using the GPU rendering animations.
        for (let i = siblingsLen - 1; i >= 0; i--) {
            let sibling = siblings[i];
            if (i < dragIndex || i > dropIndex) {
                let newStyle = {
                    transition: 'transform 0.2s ease 0s',
                    transform: 'translate3d(0px, 0px, 0px)',
                }
                Object.assign(sibling.style, newStyle);
            } else {
                if (i === dragIndex) continue;
                let previousLeft, previousTop;
                if (i === dragIndex + 1) {
                    ({ left: previousLeft, top: previousTop } = domRects[dragIndex]);
                } else {
                    ({ left: previousLeft, top: previousTop } = domRects[i - 1]);
                }
                let { left, top } = domRects[i];
                let translateX = previousLeft - left;
                let translateY = previousTop - top;
                let newStyle = {
                    transition: 'transform 0.2s ease 0s',
                    transform: `translate3d(${translateX}px, ${translateY}px, 0px)`,
                }
                Object.assign(sibling.style, newStyle);
            }
        }
    } else {
        for (let i = 0; i < siblingsLen; i++) {
            let sibling = siblings[i];
            if (i < dropIndex || i > dragIndex) {
                let newStyle = {
                    transition: 'transform 0.2s ease 0s',
                    transform: 'translate3d(0px, 0px, 0px)',
                }
                Object.assign(sibling.style, newStyle);
            } else {
                if (i === dragIndex) continue;
                let nextLeft, nextTop;
                if (i === dragIndex - 1) {
                    ({ left: nextLeft, top: nextTop } = domRects[dragIndex]);
                } else {
                    ({ left: nextLeft, top: nextTop } = domRects[i + 1]);
                }
                let { left, top } = domRects[i];
                let translateX = nextLeft - left;
                let translateY = nextTop - top;
                let newStyle = {
                    transition: 'transform 0.2s ease 0s',
                    transform: `translate3d(${translateX}px, ${translateY}px, 0px)`,
                }
                Object.assign(sibling.style, newStyle);
            }
        }
    }
}


/**
 * @function 
 * @param {Element} dragElement 
 * @param {number} current 
 * @param {Array<[number,number]>} pointSet 
 * @returns {number} 
 * @description 
 * Greedy algorithm：
 * Greedy criterion：
 */
function getDropIndex(dragElement, current, pointSet) {
    let { left, top } = dragElement.getBoundingClientRect();
    let pointSetSize = pointSet.length;
    let lineFeed = false;
    let column = [], row = [];
    for (let i = 0; i < pointSetSize; i++) {
        let [centerX, centerY] = pointSet[i];
        if (i !== current) {
            (left < centerX) && column.push(i);
            (top < centerY) && row.push(i);
        } else {
            if (pointSet[i + 1]) {
                let [centerX, centerY] = pointSet[i + 1];
                (left < centerX) && column.push(i);
                (top < centerY) && row.push(i);
            }
        }
        if (pointSet[0][1] !== centerY) {
            lineFeed = true;
        }
    }
    let rowFlag = row.length === 0;
    let columnFlag = column.length === 0;
    if (rowFlag && columnFlag) return pointSetSize;
    if (rowFlag && !columnFlag) {
        if (lineFeed) {
            column.sort((a, b) => pointSet[a][1] > pointSet[b][1] ? -1 : 1);
            return column[0];
        }
        return pointSetSize;
    }
    if (!rowFlag && columnFlag) {
        if (lineFeed) {
            row.sort((a, b) => pointSet[a][0] > pointSet[b][0] ? -1 : 1);
            return row[0];
        }
        return pointSetSize;
    };
    row.sort((a, b) => pointSet[a][1] < pointSet[b][1] ? -1 : 1);
    column.sort((a, b) => pointSet[a][0] < pointSet[b][0] ? -1 : 1);
    let dropIndex = row.find(item => column.includes(item));
    return dropIndex >= 0 ? dropIndex : pointSetSize;
}

/**
 * 
 * @param {Set<(event:MouseEvent,data:any,index:number,drop?:number) => void>} handles 
 * @param  {[event:MouseEvent,data:any,index:number,drop?:number]} arg 
 * @returns {Array<any>} 
 */
function runEffect(handles, ...arg) {
    if (!handles) return;
    let callbacks = [...handles];
    let promiseArr = [];
    for (let i = 0; i < callbacks.length; i++) {
        let handle = callbacks[i];
        let promiseTask = Promise.resolve().then(() => handle(...arg));
        promiseArr.push(promiseTask);
    }
    return Promise.all(promiseArr);
}

export {
    dataTypeChecker,
    typeExplorer,
    getRootDirectChild,
    requestAnimation,
    getDropIndex,
    runEffect,
}