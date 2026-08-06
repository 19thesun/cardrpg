import { Card } from "../cards/Card.js";
import { createCardById } from "../cards/cardFactory.js";

export class SaveManager {

    static save(scene, camera, useSlot, book) {

    const bookCards = new Set(
        book.slots.map(slot => slot.card).filter(Boolean)
    );

    const data = {

        version: 1,

        tableCards:
            scene.getShapes()
            .filter(shape =>
                shape instanceof Card &&
                !bookCards.has(shape) &&
                shape !== useSlot.card
            )
            .map(card => ({
                id: card.id,
                x: card.x,
                y: card.y,
                zIndex: card.zIndex
            })),


        useSlot: {
            card:
                useSlot.card
                ? useSlot.card.id
                : null
        },


        book: {

            cards:
                book.slots.map((slot, index) => ({

                    slotIndex: index,

                    card:
                        slot.card
                        ? slot.card.id
                        : null,

                    amount:
                        slot.amount

                }))

        },

        camera: {
            x: camera.x,
            y: camera.y,
            zoom: camera.zoom
        }

    };


        localStorage.setItem(
            "gameSave",
            JSON.stringify(data)
        );


        console.log("Game saved");

    }

    static clear() {
        localStorage.removeItem("gameSave");
    }

    static load(scene, camera, useSlot, spawner, book) {

        const raw =
            localStorage.getItem("gameSave");

        console.log({
            scene,
            camera,
            useSlot,
            spawner
        });
        if (!raw) {
            return false;
        }


        const data =
            JSON.parse(raw);


        // Clear everything before loading
        scene.getShapes()
            .filter(shape => shape instanceof Card)
            .forEach(card => scene.remove(card));

        // Restore camera

        camera.x = data.camera.x;
        camera.y = data.camera.y;
        camera.zoom = data.camera.zoom;



        // table
        data.tableCards.forEach(saved => {

            const card =
                createCardById(
                    saved.x,
                    saved.y,
                    saved.id
                );

            scene.add(card);

        });


        // use slot
        if (data.useSlot.card) {

            const card =
                createCardById(
                    0,
                    0,
                    data.useSlot.card
                );

            scene.add(card);

            useSlot.placeCard(card);

        }


        // book
        data.book.cards.forEach(saved => {

            if (!saved.card) return;

            const card =
                createCardById(
                    0,
                    0,
                    saved.card,
                );

            const slot =
                book.slots[saved.slotIndex];

            slot.placeCard(card);

            slot.amount =
                saved.amount ?? 1;
                
            slot.updateCardPosition();
            
            card.visible = false;

        });

        console.log("Game loaded");

        return true;

    }

    static exportSave() {

        const save =
            localStorage.getItem("gameSave");

        if (!save) {
            console.warn("No save found");
            return;
        }


        const blob =
            new Blob(
                [save],
                { type: "application/json" }
            );


        const url =
            URL.createObjectURL(blob);


        const a =
            document.createElement("a");

        a.href = url;
        a.download = "card-game-save.json";

        a.click();


        URL.revokeObjectURL(url);

        console.log("Save exported");

    }



    static importSave(file, callback = null) {

        const reader =
            new FileReader();


        reader.onload = () => {

            try {

                const data =
                    JSON.parse(reader.result);

                console.log("Imported data:", data);

                // Validate basic structure
                if (!data || typeof data !== "object") {
                    throw new Error("Invalid save file");
                }


                localStorage.setItem(
                    "gameSave",
                    JSON.stringify(data)
                );


                console.log("Save imported");


                if (callback) {
                    callback();
                }

            }
            catch (e) {

                console.error(
                    "Failed to import save:",
                    e
                );

            }

        };


        reader.readAsText(file);

    }

}