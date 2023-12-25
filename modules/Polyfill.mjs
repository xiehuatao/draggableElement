/**
 * @file If your browser does not support these methods, run this file as a amodule.
 */


/**
 * @see {@link https://github.com/jserz/js_piece/blob/master/DOM/Element/prepend()/prepend().md}
 */
(function (arr) {
    arr.forEach(function (item) {
        if (!item.prepend) {
            function prepend() {
                var argArr = Array.prototype.slice.call(arguments);
                var docFrag = document.createDocumentFragment();
                argArr.forEach(function (argItem) {
                    var isNode = argItem instanceof Node;
                    docFrag.appendChild(
                        isNode ? argItem : document.createTextNode(String(argItem)),
                    );
                });
                this.insertBefore(docFrag, this.firstChild);
            };
            item.prepend = prepend;
        }
    });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);


/**
 * @see {@link https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/before()/before().md}
 */
(function (arr) {
    arr.forEach(function (item) {
        if (!item.before) {
            item.before = function before() {
                var argArr = Array.prototype.slice.call(arguments);
                var docFrag = document.createDocumentFragment();
                argArr.forEach(function (argItem) {
                    var isNode = argItem instanceof Node;
                    docFrag.appendChild(
                        isNode ? argItem : document.createTextNode(String(argItem)),
                    );
                });
                this.parentNode.insertBefore(docFrag, this);
            }
        }
    });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
