export default {

    forest: {

        name: "Forest",

        rank: "B",
        image: "./assets/forest.jpg",
        description: "leave this on the board for a bit, and eventually a tree will grow",

        behavior: {
            type: "timer",
            interval: 10000,

            action: {
                type: "spawn",
                card: "tree"
            }
        }

    },

    tree: {
        name: "Tree",
        rank: "C",
        description: "A tree. Can be harvested for wood.",
        image: "./assets/tree.png"
    },


    cave: {
        name: "Cave",
        rank: "C",
        image: "./assets/cave.webp",
        description: "Scary cave!",
        actions: [
            {
                effect: "spawn",
                spawn: "rock",
                message: "You searched through the cave and found a rock."
            },

        ]

    }

};