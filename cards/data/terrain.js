export default {

    tree: {
        cardNumber: 4,
        name: "Tree",
        rank: "C",
        description: "A tree. Can be harvested for wood.",
        image: "tree.png"
    },

    rock: {
        cardNumber: 5,
        name: "Rock",
        rank: "D",
        description: "A stupid little rock. Gay."

    },

    cave: {
        cardNumber: 6,
        name: "Cave",
        
        actions: [
            {
                effect: "spawn",
                spawn: "rock",
                message: "You searched through the cave and found a rock."
            }
        ]

    }

};