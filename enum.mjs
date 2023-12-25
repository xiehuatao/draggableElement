/**
 * @enum
 * @description
 * Basic type.
 */
const BASIC_TYPE = {
    'null': 0,
    'undefined': 1,
    'number': 2,
    'string': 3,
    'symbol': 4,
    'bigint': 5,
    'boolean': 6,
}


/**
 * @enum
 * @description
 * Complex type.
 */
const COMPLEX_TYPE = {
    'object': 0,
    'function': 1,
}


/**
 * @enum
 * @description
 * Drag event type.
 */
const DRAG_EVENT_TYPE = {
    'dragstart': 1,
    'drag': 2,
    'dragend': 3,
    'drop': 4,
    'change': 5,
}

Object.freeze(BASIC_TYPE);
Object.freeze(COMPLEX_TYPE);
Object.freeze(DRAG_EVENT_TYPE);

export {
    BASIC_TYPE,
    COMPLEX_TYPE,
    DRAG_EVENT_TYPE,
}