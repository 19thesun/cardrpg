import { Scene } from "./engine/scene.js";
import { Rectangle } from "./objects/Rectangle.js";
import { Card } from "./cards/Card.js";
import { Renderer } from "./engine/renderer.js";
import { Input } from "./engine/input.js";
import { UseSlot } from "./objects/UseSlot.js";
import { Camera } from "./engine/camera.js";
import { CardSpawner } from "./cards/CardSpawner.js";
import { ActionManager } from "./cards/ActionManager.js"

// Width of the menu on the screen
const MENU_WIDTH_RATIO = 0.3;

async function main() {

    const canvas = document.getElementById("game");
    const screenCanvas = document.getElementById("screen");

    const renderer = new Renderer(canvas, screenCanvas);

    await renderer.initialize();

    const input = new Input(canvas);

    const grid = document.getElementById("grid");

    const menuTabs = document.querySelectorAll(".tab-button");
    const menuPanels = document.querySelectorAll(".menu-panel");
    const menuSlotElement = document.getElementById("menu-slot");
    const useButton = document.getElementById("use-button");

    const camera = new Camera();

    renderer.camera = camera;


    let selectedShape = null;

    let clickedEmptySpace = false;

    let tableMoved = false;

    let highlightedShape = null;

    let dragStartPosition = {
        x: 0,
        y: 0
    };
    
    let dragOffset = {
        x: 0,
        y: 0
    };

    let potentialDrag = false;
    let dragStarted = false;

    let mouseDownPosition = {
        x: 0,
        y: 0
    };

    const DRAG_THRESHOLD = 8;

    let worldMouse;

    window.addEventListener("resize", () => {
        renderer.resize();
        
        renderer.updateScreenScale(scene);

        updateMenuLayout();
    });

    // ---------------------------
    // ---- Input Handling -----
    // ---------------------------

    // Camera Controls
    let draggingTable = false;

    let lastMouse = {
        x:0,
        y:0
    };

    canvas.addEventListener("mousemove", () => {

        if (potentialDrag && !dragStarted) {

            const dx =
                input.mouse.x - mouseDownPosition.x;

            const dy =
                input.mouse.y - mouseDownPosition.y;


            const distance =
                Math.sqrt(dx * dx + dy * dy);


            if (distance > DRAG_THRESHOLD) {

                dragStarted = true;

                selectedShape.scale = 1 + (0.1 * camera.zoom);

                selectedShape.space = "screen";
                selectedShape.dragging = true;

                selectedShape.updateChildren();

            }

        }

        if (draggingTable) {

            const dx =
                input.mouse.x - lastMouse.x;

            const dy =
                input.mouse.y - lastMouse.y;


            if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
                tableMoved = true;
            }


            camera.x += dx;
            camera.y += dy;

            updateGrid();

            lastMouse.x = input.mouse.x;
            lastMouse.y = input.mouse.y;

        }

    });

    canvas.addEventListener("wheel", e => {

        e.preventDefault();


        const zoomAmount =
            -e.deltaY * 0.001;


        camera.zoomAt(
            input.mouse.x,
            input.mouse.y,
            zoomAmount
        );

        updateGrid();

    });

    // Card Dragging

    canvas.addEventListener("mousedown", () => {

        clickedEmptySpace = false;
        tableMoved = false;

        const screenMouse = {
            x: input.mouse.x,
            y: input.mouse.y
        };

        worldMouse =
            camera.screenToWorld(
                screenMouse.x,
                screenMouse.y
            );


        let object = null;
        let removedFromSlot = false;


        // -------------------------
        // Check use slot first
        // -------------------------

        if (useSlot.containsPoint(
            screenMouse.x,
            screenMouse.y
        )) {

            if (useSlot.card) {

                object = useSlot.card;
                removedFromSlot = true;

                object.inSlot = false;
                useSlot.card = null;

                object.space = "screen";


                // Mouse position inside the card BEFORE scaling
                const beforeBounds =
                    object.getBounds();

                const relX =
                    (screenMouse.x - beforeBounds.x) /
                    Math.max(beforeBounds.width, 1);

                const relY =
                    (screenMouse.y - beforeBounds.y) /
                    Math.max(beforeBounds.height, 1);


                // Enlarge while dragging, using zoom to keep the pickup size consistent
                const dragScale =
                    1 + (0.1 * camera.zoom);

                object.scale = dragScale;

                const afterBounds =
                    object.getBounds();


                // Keep the point under the cursor anchored while the card scales
                object.x =
                    screenMouse.x -
                    relX * afterBounds.width;

                object.y =
                    screenMouse.y -
                    relY * afterBounds.height;

            }

        }


        // -------------------------
        // Otherwise check world
        // -------------------------

        if (!object) {

            object =
                scene.getShapeAt(
                    screenMouse.x,
                    screenMouse.y,
                    camera
                );

        }


        if (object && object.draggable) {

            selectedShape = object;

        }


        if (selectedShape) {

            scene.bringToFront(selectedShape);


            if (selectedShape.space === "world") {

                dragStartPosition.x = selectedShape.x;
                dragStartPosition.y = selectedShape.y;

            }
            else {

                const world =
                    camera.screenToWorld(
                        selectedShape.x,
                        selectedShape.y
                    );

                dragStartPosition.x = world.x;
                dragStartPosition.y = world.y;

            }


            // Correct offset depending on space
            if (selectedShape.space === "world") {
                dragOffset.x =
                    worldMouse.x - selectedShape.x;

                dragOffset.y =
                    worldMouse.y - selectedShape.y;
            }

            // Cards removed from slot instantly drag
            if (removedFromSlot) {

                selectedShape.space = "screen";
                selectedShape.dragging = true;

                dragOffset.x =
                    screenMouse.x - selectedShape.x;

                dragOffset.y =
                    screenMouse.y - selectedShape.y;

                dragStarted = true;
                potentialDrag = false;

            }
            else {

                dragStarted = false;
                potentialDrag = true;


                mouseDownPosition.x =
                    input.mouse.x;

                mouseDownPosition.y =
                    input.mouse.y;

            }


        }
        else {

            draggingTable = true;

            clickedEmptySpace = true;

            lastMouse.x =
                screenMouse.x;

            lastMouse.y =
                screenMouse.y;

        }

    });

    canvas.addEventListener("mouseup", () => {

        draggingTable = false;



        if (!dragStarted) {

            // Clicked empty board (not a camera drag)
            if (clickedEmptySpace && !tableMoved) {

                if (highlightedShape) {
                    highlightedShape.selected = false;
                    highlightedShape = null;
                }

            }

            // Clicked a card
            else if (selectedShape) {

                if (highlightedShape === selectedShape) {

                    highlightedShape.selected = false;
                    highlightedShape = null;

                }
                else {

                    if (highlightedShape) {
                        highlightedShape.selected = false;
                    }

                    highlightedShape = selectedShape;
                    highlightedShape.selected = true;

                }

            }

            selectedShape = null;
            potentialDrag = false;
            dragStarted = false;

            return;

        }

        if (selectedShape && dragStarted) {

            const overSlot =
                useSlot.containsPoint(
                    input.mouse.x,
                    input.mouse.y
                );


        if (overSlot) {

            const worldPosition =
                camera.screenToWorld(
                    input.mouse.x - dragOffset.x,
                    input.mouse.y - dragOffset.y
                );


            const swappedCard =
                useSlot.placeCard(selectedShape);


            if (swappedCard) {

                swappedCard.inSlot = false;
                swappedCard.space = "world";
                swappedCard.scale = 1;

                swappedCard.x = dragStartPosition.x;
                swappedCard.y = dragStartPosition.y;

            }

        }
            else {

            // Shrink the card back to normal size
            selectedShape.scale = 1;


            // Calculate the new centered scale offset
            const offsetX =
                (selectedShape.width * selectedShape.screenScale -
                selectedShape.width * selectedShape.scale * selectedShape.screenScale) / 2;

            const offsetY =
                (selectedShape.height * selectedShape.screenScale -
                selectedShape.height * selectedShape.scale * selectedShape.screenScale) / 2;


            // Convert mouse position into world space
            const worldMouse =
                camera.screenToWorld(
                    input.mouse.x,
                    input.mouse.y
                );

            selectedShape.scale = 1;

            selectedShape.x =
                worldMouse.x - dragOffset.x;

            selectedShape.y =
                worldMouse.y - dragOffset.y;
            selectedShape.space = "world";
            selectedShape.inSlot = false;
            }

            if (!overSlot) {

                if (highlightedShape) {
                    highlightedShape.selected = false;
                }

                highlightedShape = selectedShape;
                highlightedShape.selected = true;

            }

            selectedShape.dragging = false;

        }


        selectedShape = null;
        potentialDrag = false;
        dragStarted = false;
    });

    // init scene
    const scene = new Scene();

    // Add card slot for menu
    const useSlot = new UseSlot(
        0,
        0
    );

    let activeTab = "use";

    function setMenuTab(tabName) {
        activeTab = tabName;

        menuTabs.forEach(button => {
            button.classList.toggle("active", button.dataset.tab === tabName);
        });

        menuPanels.forEach(panel => {
            panel.classList.toggle("active", panel.dataset.panel === tabName);
        });

        const isUseSlotTab = tabName === "use";

        menuSlotElement.style.display = isUseSlotTab ? "block" : "none";
        useSlot.visible = isUseSlotTab;

        if (useSlot.card) {
            useSlot.card.visible = isUseSlotTab;
        }
    }

    menuTabs.forEach(button => {
        button.addEventListener("click", () => {
            setMenuTab(button.dataset.tab);
        });
    });

    updateMenuLayout();
    scene.add(useSlot);

    // create cards

    const spawner = new CardSpawner(scene);

    spawner.spawnMany([
        { x: 100, y: 100, id: "tree" },
        { x: 100, y: 300, id: "fist" },
        { x: 100, y: 500, id: "cave" },
    ]);

    renderer.resize();
    
    renderer.updateScreenScale(scene);

    setMenuTab("use");
    updateMenuLayout();

    function frame() {

    worldMouse =
        camera.screenToWorld(
            input.mouse.x,
            input.mouse.y
        );

    if (selectedShape && input.mouse.down && dragStarted) {

        if (selectedShape.space === "screen") {

            selectedShape.x =
                input.mouse.x - dragOffset.x;

            selectedShape.y =
                input.mouse.y - dragOffset.y;

        } else {

            selectedShape.x =
                worldMouse.x - dragOffset.x;

            selectedShape.y =
                worldMouse.y - dragOffset.y;

        }
        selectedShape.updateChildren();
    }

        renderer.render(scene);

        requestAnimationFrame(frame);

    }

    frame();

    ///---------------------------
    /// - Buttons and whatever ---
    ///---------------------------

    document
        .getElementById("buy-card")
        .addEventListener("click", () => {

            createRandomCard();

        });

    document
        .getElementById("use-button")
        .addEventListener("click", () => {

            const context = {
                scene,
                spawner,
                canvas,
                camera
            };

            ActionManager.use(
                useSlot.card,
                highlightedShape,
                context
            );

        });

    // ---------------------------
    // ---- Helper Functions -----
    // ---------------------------

    function createRandomCard() {

        const cardIds = [
            "cave",
            "tree"
        ];


        // Pick random card type
        const randomId =
            cardIds[
                Math.floor(Math.random() * cardIds.length)
            ];


        // Pick random screen position
        const screenX =
            Math.random() * canvas.clientWidth * 0.7;

        const screenY =
            Math.random() * canvas.clientHeight;


        // Convert screen -> world
        const world =
            camera.screenToWorld(
                screenX,
                screenY
            );


        const card =
            spawner.spawn(
                world.x,
                world.y,
                randomId
            );


        scene.add(card);

    }

    function updateGrid() {

        const smallGrid = 50 * camera.zoom;
        const largeGrid = 250 * camera.zoom;


        grid.style.backgroundSize =
            `
            ${largeGrid}px ${largeGrid}px,
            ${largeGrid}px ${largeGrid}px,
            ${smallGrid}px ${smallGrid}px,
            ${smallGrid}px ${smallGrid}px
            `;


        grid.style.backgroundPosition =
            `${camera.x}px ${camera.y}px,
            ${camera.x}px ${camera.y}px,
            ${camera.x}px ${camera.y}px,
            ${camera.x}px ${camera.y}px`;
    }

    function isOverMenu(x) {

        const menuStart =
            canvas.width / devicePixelRatio *
            (1 - MENU_WIDTH_RATIO);


        return x > menuStart;

    }

    function updateMenuLayout() {

        const canvasWidth =
            canvas.clientWidth;

        const menuWidth =
            canvasWidth * MENU_WIDTH_RATIO;


        const menuX =
            canvasWidth - menuWidth;


        useSlot.x =
            menuX +
            menuWidth / 2 -
            (useSlot.width * useSlot.screenScale) / 2;

        useSlot.y =
            canvas.clientHeight * 0.40 -
            (useSlot.height * useSlot.screenScale) / 2;


        useButton.style.left =
            `${window.innerWidth * 0.85 - useButton.clientWidth/2}px`;

        useButton.style.top =
            `${window.innerHeight * 0.7}px`;
        

        if (useSlot.card) {
            useSlot.placeCard(useSlot.card);
        }

    }

    function getScale() {

        return canvas.clientWidth / 1440;

    }
}

main();

