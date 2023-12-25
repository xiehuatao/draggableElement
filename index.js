import { DraggableElement } from "./modules/draggable.mjs";

let list = document.getElementById('list');
function render(node) {
    let element = new DraggableElement(node);
    let data = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    element.setDragData(data);
    element.addEventListener('change', (_, data, start, drop) => {
        console.log(`${data},from ${start} to ${drop}`);
    })
    console.log('--');
    element.addEventListener('change', (_, data, start, drop) => {
        console.log(`${data},from ${start} to ${drop}`);
    })
}

window.addEventListener('DOMContentLoaded', () => render(list));