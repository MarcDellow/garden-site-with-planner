const workArea = document.getElementById('work-area');
let actionHistory = [];
let redoHistory = [];
let drawingMode = null;
let isDrawing = false;
let currentShape;

// Make subcategory items clickable to add them to the work area, but prevent text being added
const subItems = document.querySelectorAll('.subcategory li');

subItems.forEach((item) => {
    item.addEventListener("click", (event) => {
        event.stopPropagation();  // Prevent the click from adding text

        const type = item.getAttribute("data-type");
        const newItem = document.createElement("div");
        newItem.className = "draggable";
        newItem.textContent = item.textContent;
        newItem.style.left = "50px";
        newItem.style.top = "50px";
        workArea.appendChild(newItem);
        makeDraggable(newItem);
        actionHistory.push(newItem);
        redoHistory = [];
    });
});

// Make images in the sidebar draggable
document.querySelectorAll('.category-item [draggable="true"]').forEach(item => {
    item.addEventListener('dragstart', (e) => {
        const imgSrc = e.target.querySelector('img').src; // Get image source
        const type = e.target.dataset.type; // Get the data-type
        e.dataTransfer.setData('image', imgSrc);
        e.dataTransfer.setData('type', type);
    });
});

// Handle the drop event to add images to the work area
document.querySelector('.work-area').addEventListener('dragover', (e) => {
    e.preventDefault(); // Allow dropping
});

document.querySelector('.work-area').addEventListener('drop', (e) => {
    e.preventDefault();
    const imgSrc = e.dataTransfer.getData('image');
    const type = e.dataTransfer.getData('type');
    
    // Create an image element in the work area
    const img = document.createElement('img');
    img.src = imgSrc;
    img.classList.add('draggable-image'); // Add class for styling
    img.style.position = 'absolute';
    img.style.left = `${e.clientX}px`;
    img.style.top = `${e.clientY}px`;
    document.querySelector('.work-area').appendChild(img);

    // Make the image draggable and resizable after being dropped
    makeDraggableAndResizable(img);
});

// Function to make images draggable and resizable in the work area
function makeDraggableAndResizable(item) {
    interact(item)
        .draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: "parent",
                    endOnly: true,
                }),
            ],
            listeners: {
                move(event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute("data-x", x);
                    target.setAttribute("data-y", y);
                },
            },
        })
        .resizable({
            edges: { bottom: true, right: true },
            listeners: {
                move(event) {
                    const target = event.target;
                    let width = parseFloat(target.style.width) || 100;
                    let height = parseFloat(target.style.height) || 50;

                    width += event.deltaRect.width;
                    height += event.deltaRect.height;

                    target.style.width = `${width}px`;
                    target.style.height = `${height}px`;
                },
            },
        });
}

// Start New (Clear Work Area)
document.getElementById('start-new').addEventListener('click', () => {
    workArea.innerHTML = '';
    actionHistory = [];
    redoHistory = [];
});

// Undo last action
document.getElementById('undo').addEventListener('click', () => {
    if (actionHistory.length > 0) {
        const lastAction = actionHistory.pop();
        redoHistory.push(lastAction);
        lastAction.remove();
    }
});

// Save the workspace
document.getElementById('save').addEventListener('click', () => {
    const workspaceData = {
        html: workArea.innerHTML,
        history: actionHistory.map(el => el.outerHTML),
        redo: redoHistory.map(el => el.outerHTML)
    };
    localStorage.setItem('gardenPlannerSave', JSON.stringify(workspaceData));
    alert('Workspace saved!');
});

// Load the workspace from localStorage
window.addEventListener('load', () => {
    const savedData = JSON.parse(localStorage.getItem('gardenPlannerSave'));
    if (savedData) {
        workArea.innerHTML = savedData.html;
        actionHistory = Array.from(workArea.children);
        redoHistory = [];
        actionHistory.forEach(item => makeDraggable(item));
    }
});

// Draw Lawn
document.getElementById('draw-lawn').addEventListener('click', () => {
    drawingMode = 'lawn';
});

// Draw Path
document.getElementById('draw-path').addEventListener('click', () => {
    drawingMode = 'path';
});

// Drawing Logic for Lawn and Path
workArea.addEventListener('mousedown', (e) => {
    if (drawingMode) {
        isDrawing = true;
        currentShape = document.createElement('div');
        currentShape.className = 'shape draggable';
        currentShape.style.left = `${e.offsetX}px`;
        currentShape.style.top = `${e.offsetY}px`;

        // Lawn: Green for grass
        if (drawingMode === 'lawn') {
            currentShape.style.backgroundColor = 'rgba(106, 170, 100, 0.6)';
        } 
        // Path: Grey for path
        else if (drawingMode === 'path') {
            currentShape.style.backgroundColor = 'rgba(169, 169, 169, 0.6)';
        }

        workArea.appendChild(currentShape);
        actionHistory.push(currentShape);
        redoHistory = [];
        makeDraggableAndResizable(currentShape);  // Make it draggable and resizable
    }
});

workArea.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const width = e.offsetX - parseInt(currentShape.style.left);
        const height = e.offsetY - parseInt(currentShape.style.top);
        currentShape.style.width = `${width}px`;
        currentShape.style.height = `${height}px`;
    }
});

workArea.addEventListener('mouseup', () => {
    isDrawing = false;
    drawingMode = null;
});

// Make shapes draggable and resizable
function makeDraggableAndResizable(item) {
    interact(item)
        .draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: "parent",
                    endOnly: true,
                }),
            ],
            listeners: {
                move(event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute("data-x", x);
                    target.setAttribute("data-y", y);
                },
            },
        })
        .resizable({
            edges: { bottom: true, right: true },
            listeners: {
                move(event) {
                    const target = event.target;
                    let width = parseFloat(target.style.width) || 100;
                    let height = parseFloat(target.style.height) || 50;

                    width += event.deltaRect.width;
                    height += event.deltaRect.height;

                    target.style.width = `${width}px`;
                    target.style.height = `${height}px`;
                },
            },
        });
}

// Collapsible Menu Functionality
const categoryTitles = document.querySelectorAll('.category-title');

categoryTitles.forEach((title) => {
    title.addEventListener('click', () => {
        const subcategory = title.nextElementSibling;
        if (subcategory.style.display === 'block') {
            subcategory.style.display = 'none'; // Hide subcategory
        } else {
            subcategory.style.display = 'block'; // Show subcategory
        }
    });
});

// Handle the image selection and border addition for resizing
document.querySelector('.work-area').addEventListener('click', (e) => {
    // Check if the clicked element is an image
    if (e.target.tagName.toLowerCase() === 'img' && e.target.classList.contains('draggable-image')) {
        // Remove border from all images
        document.querySelectorAll('.draggable-image').forEach(img => {
            img.classList.remove('selected');
        });

        // Add border to the clicked image
        e.target.classList.add('selected');
    } else {
        // Remove the border if clicking outside the images
        document.querySelectorAll('.draggable-image').forEach(img => {
            img.classList.remove('selected');
        });
    }
});

// Add styles for the selected border (CSS)
const style = document.createElement('style');
style.innerHTML = `
    .draggable-image.selected {
        border: 3px solid #00f; /* Blue border for selected image */
        box-sizing: border-box; /* Ensure the border doesn't affect the size */
    }
`;
document.head.appendChild(style);

