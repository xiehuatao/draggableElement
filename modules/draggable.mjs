import { DRAG_EVENT_TYPE } from './enum.mjs';
import { dataTypeChecker, getRootDirectChild, requestAnimation, getDropIndex, runEffect } from './tool.mjs';


/**
 * @class 
 * @author HuaTao <1462234449@qq.com> 
 * @param {Element} element 
 * @returns {object} 
 * @example new DraggableElement(element);
 * @classdesc Instantiate a draggable element.
 */
class DraggableElement {


    /**
     * @static 
     * @private 
     * @type {Function} 
     */
    static #defaultRender = function (item) {
        let str = String(item);
        return `<li>${window.encodeURI(str)}</li>`
    }


    /**
     * @member 
     * @private 
     * @type {Element} 
     */
    #draggable = null;


    /**
     * @member 
     * @private 
     * @type {Array<any>} 
     */
    #dragData = null;


    /**
     * @member 
     * @private 
     * @type {Function} 
     */
    #dataRender = null;


    /**
     * @member 
     * @private 
     * @type {object} 
     */
    #dragControllers = null;


    /**
     * @static 
     * @private 
     * @typedef {object} DragEvent
     * @type {object} dragEventListener
     * @type {Set} dragEventListener.dragstart
     * @type {Set} dragEventListener.drag
     * @type {Set} dragEventListener.dragend
     * @type {Set} dragEventListener.drop
     * @type {Set} dragEventListener.change
     */
    #dragEventListener = {
        'dragstart': null,
        'drag': null,
        'dragend': null,
        'drop': null,
        'change': null,
    }


    /**
    * @member 
    * @private 
    * @typedef DragEnvir
    * @type {object} envirData  --Private, Record various information about the event process.
    * @type {number} envirData.current  --The index before the event started.
    * @type {number} envirData.dropIndex  --The index of the element in the drop event.
    * @type {Element} envirData.dragElement  --Dragging element.
    * @type {MouseEvent} envirData.origin  --Origin mouse event.
    * @type {Array<DOMRect>} envirData.domRects  --A set of the sibling elements' DOMRect info.
    * @type {Array<[number,number]>} envirData.pointSet  --A set of the sibling elements' central positon.
    */
    #envirData = null;


    /**
     * @constructor 
     * @param {Element} element 
     * @returns {object}
     */
    constructor(element) {
        dataTypeChecker(element, Element, { errorPoster: true })
        this.#draggable = element;
        this.#dataRender = DraggableElement.#defaultRender;
        this.#dragControllers = {
            'mousedown': this.#dragStartController.bind(this),
            'mousemove': this.#draggingController.bind(this),
            'mouseup': this.#dragEndController.bind(this),
        }
        this.#init();
    }


    /**
     * @method 
     * @private 
     * @param {MouseEvent} event 
     * @returns {void|boolean} 
     * @description 
     * Drag event —— start.
     */
    #dragStartController(event) {
        let { target, currentTarget } = event;
        if (target === currentTarget) return;
        let current, pointSet = [], domRects = [];
        let { children } = this.#draggable;
        let dragElement = getRootDirectChild(this.#draggable, target);
        for (let i = 0; i < children.length; i++) {
            let element = children[i];
            let rect = element.getBoundingClientRect();
            pointSet.push([rect.left + rect.width / 2, rect.top + rect.height / 2]);
            domRects.push(rect);
            let newStyle = {
                transition: 'transform 0s',
                transform: 'translate3d(0px, 0px, 0px)',
            }
            Object.assign(element.style, newStyle);
            (element === dragElement) && (current = i);
        }
        // Run async drag event callbacks.
        {
            let dragEventCallbacks = this.#dragEventListener['dragstart'];
            let data = this.#dragData[current];
            runEffect(dragEventCallbacks, event, data, current);
        }
        this.#envirData.origin = event;
        this.#envirData.current = current;
        this.#envirData.dropIndex = current;
        this.#envirData.domRects = domRects;
        this.#envirData.pointSet = pointSet;
        this.#envirData.dragElement = dragElement;
    }


    /**
     * @method 
     * @private 
     * @param {MouseEvent} event 
     * @returns {void|boolean} 
     * @description 
     * Drag event —— dragging.
     */
    #draggingController(event) {
        if (this.#envirData?.dragElement) {
            let { dragElement, origin, pointSet, domRects, dropIndex: preIndex, current } = this.#envirData;
            let translateX = event.clientX - origin.clientX;
            let translateY = event.clientY - origin.clientY;
            let newStyle = {
                transition: 'transform 0s',
                transform: `translate3d(${translateX}px, ${translateY}px, 0px)`,
            }
            Object.assign(dragElement.style, newStyle);
            let dropIndex = getDropIndex(dragElement, current, pointSet);
            // Attention: Reduce unnecessary animations!
            dropIndex !== preIndex && requestAnimation(this.#draggable.children, domRects, current, dropIndex);
            this.#envirData.dropIndex = dropIndex;
            // Run async drag event callbacks.
            {
                let dragEventCallbacks = this.#dragEventListener['drag'];
                let data = this.#dragData[current];
                runEffect(dragEventCallbacks, event, data, current, dropIndex);
            }

        }
    }


    /**
     * @method 
     * @private 
     * @returns {void|boolean} 
     * @description 
     * Drag event —— end.
     */
    #dragEndController(event) {
        if (this.#envirData?.dragElement) {
            let dragData = this.#dragData;
            let { children } = this.#draggable;
            let { dragElement, current, dropIndex } = this.#envirData;
            // If the dragElement's position changed.
            if (current !== dropIndex) {
                if (dropIndex === children.length) {
                    this.#draggable.appendChild(dragElement);
                } else if (dropIndex === 0) {
                    /**
                     * @see {@link Polyfill.mjs} If your browser does not support this method.
                     */
                    this.#draggable.prepend(dragElement);
                } else {
                    if (current < dropIndex) {
                        children[dropIndex].after(dragElement);
                    } else {
                        /**
                         * @see {@link Polyfill.mjs} If your browser does not support this method.
                         */
                        children[dropIndex].before(dragElement);
                    }
                }
                // Data moves with the action.
                dragData.splice(dropIndex, 0, ...dragData.splice(current, 1));

                // Run async drag event callbacks.
                {
                    let dragEventCallbacks = this.#dragEventListener['change'];
                    let data = dragData[dropIndex];
                    runEffect(dragEventCallbacks, event, data, current, dropIndex);
                }
            }
            for (let i = 0; i < children.length; i++) {
                let newStyle = {
                    transition: 'transform 0s',
                    transform: `translate3d(0px, 0px, 0px)`,
                }
                Object.assign(children[i].style, newStyle);
            }

            // Run async drag event callbacks.
            {
                let dragEventCallbacks = this.#dragEventListener['drop'];
                let data = dragData[current];
                runEffect(dragEventCallbacks, event, data, current, dropIndex);
            }

            this.#envirData.current = -1;
            this.#envirData.dropIndex = -1;
            this.#envirData.origin = null;
            this.#envirData.positon = null;
            this.#envirData.pointSet = null;
            this.#envirData.dragElement = null;
        }
    }


    /**
     * @method 
     * @private 
     * @returns {void} 
     * @description 
     * Mount the drag event.
     */
    #init() {
        let controllers = this.#dragControllers;
        for (let eventName in controllers) {
            this.#draggable.addEventListener(eventName, controllers[eventName]);
        }
        this.#envirData = {
            current: -1,
            dropIndex: -1,
            origin: null,
            positon: null,
            pointSet: null,
            dragElement: null,
        }
    }


    /**
     * @method 
     * @private 
     * @returns {void} 
     * @description 
     * Reload the drag event.
     */
    #refresh() {
        let element = this.#draggable;
        let dragData = this.#dragData || [];
        let render = this.#dataRender || DraggableElement.#defaultRender;
        element.innerHTML = dragData.map(item => render(item)).join('');
    }


    /**
     * @method 
     * @public 
     * @param {boolean} [clear=true] 
     * @returns {void} 
     * @description 
     * Clean up rendered data as needed
     */
    remove(clear = true) {
        let controllers = this.#dragControllers;
        for (let eventName in controllers) {
            this.#draggable.removeEventListener(eventName, controllers[eventName]);
        }
        clear && (this.#draggable.innerHTML = '');
        this.#draggable = null;
        this.#dragData = null;
        this.#envirData = null;
        this.#dataRender = null;
    }


    /**
     * @method 
     * @public 
     * @returns {Element} 
     * @description 
     * Get draggable element.
     */
    getDraggableElement() {
        return this.#draggable;
    }


    /**
     * @method 
     * @public 
     * @returns {void} 
     * @description 
     * Set draggable element.
     */
    setDraggableElement(element) {
        dataTypeChecker(element, Element, { errorPoster: true });
        this.remove(false);
        this.#draggable = element;
        this.#init();
        this.#refresh();
    }


    /**
     * @method 
     * @public 
     * @returns {Array|null} 
     * @description 
     * Get dragData.
     */
    getDragData() {
        return this.#dragData;
    }


    /**
     * @method 
     * @public 
     * @returns {void} 
     * @description 
     * Set dragData.
     */
    setDragData(data) {
        dataTypeChecker(data, Array, { errorPoster: true });
        this.#dragData = data;
        this.#refresh();
    }


    /**
     * @method 
     * @public 
     * @returns {Function} 
     * @description 
     * Get render.
     */
    getRender() {
        return this.#dataRender;
    }


    /**
     * @method 
     * @public 
     * @param {Function} render 
     * @returns {void} 
     * @description 
     * Set render.
     */
    setRender(render) {
        dataTypeChecker(render, Function, { errorPoster: true });
        this.#dataRender = render;
        this.#refresh();
    }

    /**
     * 
     * @param {'dragstart'|'drag'|'dragend'|'drop'|'change'} eventName 
     * @param {(event:MouseEvent,data:any,index:number,drop?:number) => void} callback 
     */
    addEventListener(eventName, callback) {
        if (DRAG_EVENT_TYPE[eventName]) {
            let callbackSet = this.#dragEventListener[eventName];
            if (callbackSet) {
                callbackSet.add(callback);
            } else {
                callbackSet = new Set([callback]);
                this.#dragEventListener[eventName] = callbackSet;
            }
        }
    }


    /**
     * 
     * @param {'dragstart'|'drag'|'dragend'|'drop'|'change'} eventName 
     * @param {(event:MouseEvent,data:any,index:number,drop?:number) => void} callback 
     */
    removeEventListener(eventName, callback) {
        if (DRAG_EVENT_TYPE[eventName]) {
            let callbackSet = this.#dragEventListener[eventName];
            callbackSet && callbackSet.has(callback) && callbackSet.delete(callback);
        }
    }
}


export {
    DraggableElement,
}