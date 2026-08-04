export default {

    tree: {

        name: "Tree",
        rank: "C",
        description: "A tree. Can be harvested for wood.",
        image: "tree.png"
    },

    rock: {
        
        name: "Rock",
        rank: "D",
        description: "A stupid little rock. Gay."

    },

    cave: {

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