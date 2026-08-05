import { Scene } from "./engine/scene.js";
import { Rectangle } from "./objects/Rectangle.js";
import { Card } from "./cards/Card.js";
import { Renderer } from "./engine/renderer.js";
import { Input } from "./engine/input.js";
import { UseSlot } from "./objects/UseSlot.js";
import { Camera } from "./engine/camera.js";
import { CardSpawner } from "./cards/CardSpawner.js";
import { ActionManager } from "./cards/ActionManager.js";
import { showMessage } from "./engine/messages.js";
import { Book } from "./objects/Book.js";

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
    const bookContainer = document.getElementById("book-container");
    
    const targetCardText =
        document.getElementById("target-card-text");
    
    const camera = new Camera();

    renderer.camera = camera;


    let selectedShape = null;

    let clickedEmptySpace = false;

    let tableMoved = false;

    let highlightedShape = null;

    let hoveredShape = null;

    let activeTab = "use";

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

        const oldScale = book.scale;

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

        if (book.scrollbar.dragging) {

            book.scrollbar.drag(
                input.mouse.y
            );

        }

        if (hoveredShape) {
            hoveredShape.colorMultiplier = 1;
        }


        hoveredShape =
            scene.getShapeAt(
                input.mouse.x,
                input.mouse.y,
                camera
            );


        if (hoveredShape && !selectedShape) {
            hoveredShape.colorMultiplier = 0.9;
        }
        

        if (potentialDrag && !dragStarted) {

            const dx =
                input.mouse.x - mouseDownPosition.x;

            const dy =
                input.mouse.y - mouseDownPosition.y;


            const distance =
                Math.sqrt(dx * dx + dy * dy);


            if (distance > DRAG_THRESHOLD) {

                dragStarted = true;

                // Convert world position to screen position first
                const screen =
                    camera.worldToScreen(
                        selectedShape.x,
                        selectedShape.y
                    );

                selectedShape.x = screen.x;
                selectedShape.y = screen.y;

                selectedShape.setSpace("screen");

                selectedShape.screenScale =
                    canvas.clientWidth / 1440;

                dragOffset.x =
                    input.mouse.x - selectedShape.x;

                dragOffset.y =
                    input.mouse.y - selectedShape.y;

                selectedShape.scale =
                    camera.zoom * 1.1;

                selectedShape.dragging = true;
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

        if (
            activeTab === "book" &&
            book.containsPoint(
                input.mouse.x,
                input.mouse.y
            )
        ) {

            book.scroll(e.deltaY);

            return;
        }

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

        canvas.addEventListener("mousedown", (e) => {

        if (
            activeTab === "book" &&
            book.scrollbar.containsThumb(
                input.mouse.x,
                input.mouse.y
            )
        ) {

            book.scrollbar.startDrag(input.mouse.y);

            return;

        }

        if  (hoveredShape) {
            hoveredShape.colorMultiplier = 0.8;
        }

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

        if (activeTab === "use" && useSlot.containsPoint(
            screenMouse.x,
            screenMouse.y
        )) {

            if (useSlot.card) {

                object = useSlot.card;
                removedFromSlot = true;
                
                object.inSlot = false;
                useSlot.card = null;
                updateTargetCardText()

                object.setSpace("screen");


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
                    camera.zoom * 1.1;

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
            else {
                // Clicked empty slot, do nothing
                object = null;
            }

        }

        // -------------------------
        // Check book slots
        // -------------------------

        if (
            activeTab === "book"
        ) {

            const slot =
                book.getSlotAt(
                    screenMouse.x,
                    screenMouse.y
                );


            if (slot && slot.card) {

                object = slot.removeCard();

                removedFromSlot = true;

                object.setSpace("screen");

                scene.add(object);
                
                object.scale = 1;

                const beforeBounds =
                    object.getBounds();


                const relX =
                    (screenMouse.x - beforeBounds.x) /
                    beforeBounds.width;


                const relY =
                    (screenMouse.y - beforeBounds.y) /
                    beforeBounds.height;


                object.scale =
                    camera.zoom * 1.1;


                const afterBounds =
                    object.getBounds();


                object.x =
                    screenMouse.x -
                    relX * afterBounds.width;


                object.y =
                    screenMouse.y -
                    relY * afterBounds.height;

            }

        }


        // -------------------------
        // --Otherwise check world--
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
        else {
            // Clicked empty space or non-draggable object,
            // we might still want to handle dragging,
            // but we should clear selection if clicking empty space
            if (!object) {
                if (highlightedShape) {
                    highlightedShape.selected = false;
                    highlightedShape.outline.visible = false;
                    highlightedShape = null;
                    updateTargetCardText();
                }
            }
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

                selectedShape.setSpace("screen");
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
        book.scrollbar.dragging = false;

        if (!dragStarted) {

            // Clicked empty board (not a camera drag)
            if (clickedEmptySpace && !tableMoved) {

                if (highlightedShape) {
                    highlightedShape.selected = false;
                    highlightedShape.outline.visible = false;
                    highlightedShape = null;
                    updateTargetCardText();
                }

            }

                        // Clicked a card
            else if (selectedShape) {

                if (highlightedShape === selectedShape) {
                    // Do nothing, already selected
                }
                else {

                    if (highlightedShape) {
                        highlightedShape.selected = false;
                        highlightedShape.outline.visible = false;
                    }

                    highlightedShape = selectedShape;
                    highlightedShape.selected = true;
                    highlightedShape.outline.visible = true;
                    updateTargetCardText();
                }

            }

            selectedShape = null;
            potentialDrag = false;
            dragStarted = false;

            return;

        }

        if (selectedShape && dragStarted) {

            let targetSlot = null;


            if (activeTab === "use") {

                if (
                    useSlot.containsPoint(
                        input.mouse.x,
                        input.mouse.y
                    )
                ) {

                    targetSlot = useSlot;

                }

            }


            else if (activeTab === "book") {

                targetSlot =
                    book.getSlotAt(
                        input.mouse.x,
                        input.mouse.y
                    );

            }

            if (targetSlot) {

                // Book slots cannot accept a card if already occupied
                if (targetSlot.card && targetSlot !== useSlot
                    && targetSlot.card.id !== selectedShape.id
                ) {

                    // Return card to where it started
                    selectedShape.scale = 1;

                    selectedShape.setSpace("world");

                    selectedShape.x =
                        dragStartPosition.x;

                    selectedShape.y =
                        dragStartPosition.y;

                }

                else {

                    const result =
                        targetSlot.placeCard(selectedShape);

                    updateTargetCardText();


                    // Card was stacked, remove the dragged copy
                    if (result === "stacked") {

                        scene.remove(selectedShape);

                    }


                    // Only UseSlot can swap cards
                    else if (result) {

                        result.inSlot = false;
                        result.setSpace("world");
                        result.scale = 1;

                        result.x =
                            dragStartPosition.x;

                        result.y =
                            dragStartPosition.y;

                        scene.add(result);

                    }

                }


                // Clear highlight
                if (highlightedShape === selectedShape) {

                    highlightedShape.selected = false;
                    highlightedShape.outline.visible = false;
                    highlightedShape = null;
                    updateTargetCardText();
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

            const worldOffset =
                camera.screenDeltaToWorld(
                    dragOffset.x,
                    dragOffset.y
                );

            selectedShape.x =
                worldMouse.x - worldOffset.x;

            selectedShape.y =
                worldMouse.y - worldOffset.y;
            
            selectedShape.setSpace("world");
            selectedShape.inSlot = false;
            }

            if (!targetSlot) {

                if (highlightedShape) {
                    highlightedShape.selected = false;
                    highlightedShape.outline.visible = false;
                }

                highlightedShape = selectedShape;
                highlightedShape.selected = true;
                highlightedShape.outline.visible = true;
                updateTargetCardText();
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


    const book = new Book(
        canvas.clientWidth * 0.7 - 50,
        0,
        canvas.clientWidth * 0.3,
        canvas.clientHeight
    );


    scene.add(useSlot);

    function setMenuTab(tabName) {

        activeTab = tabName;

        menuTabs.forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.tab === tabName
            );
        });

        menuPanels.forEach(panel => {
            panel.classList.toggle(
                "active",
                panel.dataset.panel === tabName
            );
        });


        const isUseSlotTab =
            tabName === "use";


        const isBookTab =
            tabName === "book";


        useSlot.visible =
            isUseSlotTab;


        if (isBookTab) {

            book.x =
                canvas.clientWidth * 0.7 - 10;

            book.y = 10;

            book.addToScene(scene);
            
        }
        else {

            book.removeFromScene(scene);

        }


        menuSlotElement.style.display =
            isUseSlotTab ? "block" : "none";


        if (useSlot.card) {

            useSlot.card.visible =
                isUseSlotTab;

        }

        for (const slot of book.slots) {

            if (slot.card) {

                slot.card.visible = isBookTab;

                // hide slot behind card
                slot.visible = false;

            }
            else {

                slot.visible = isBookTab;

            }

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

    const spawner = new CardSpawner(scene, renderer);

    spawner.spawnMany([
        { x: 100, y: 100, id: "tree" },
        { x: 100, y: 300, id: "fist" },
        { x: 100, y: 500, id: "cave" },
        { x: 200, y: 500, id: "rock" },
        { x: 300, y: 500, id: "rock" },
        { x: 400, y: 500, id: "rock" }
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

    // Auto scroll when holding a card
    if (
        selectedShape &&
        dragStarted &&
        activeTab === "book"
    ) {

        const edgeSize = 80;


        if (
            input.mouse.y <
            book.y + edgeSize
        ) {

            book.scroll(-10);

        }


        if (
            input.mouse.y >
            book.y + book.height - edgeSize
        ) {

            book.scroll(10);

        }

    }

    // Drag card
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
    }

        renderer.render(scene);

        requestAnimationFrame(frame);

    }

    frame();

    ///---------------------------
    /// - Buttons and whatever ---
    ///---------------------------

    document
        .getElementById("use-button")
        .addEventListener("click", () => {

            const context = {
                scene,
                spawner,
                canvas,
                camera,
                message: showMessage
            };

            const used = ActionManager.use(
                useSlot.card,
                highlightedShape,
                context
            );

            if (used && highlightedShape) {
                highlightedShape.outline.visible = false;
                highlightedShape = null;
                updateTargetCardText();
            } 

        });

    // ---------------------------
    // ---- Helper Functions -----
    // ---------------------------

    function updateTargetCardText() {

        if (useSlot.card && highlightedShape) {

            targetCardText.innerText =
                "Target: " + highlightedShape.name;

        }
        else if (useSlot.card) {

            targetCardText.innerText =
                "Target: None";

        } else {
            targetCardText.innerText =
                "";
        }

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

        book.x =
            menuX - 10;


        book.y =
            10;


        book.layoutScale =
            canvas.clientWidth / 1440;

        book.width = menuWidth;

        book.updateSlots();

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
            updateTargetCardText();
        }

    }

    function getScale() {

        return canvas.clientWidth / 1440;

    }
}

main();

