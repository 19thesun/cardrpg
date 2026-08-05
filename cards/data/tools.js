export default {

    fist: {
        name: "Fist",
        rank: "C",
        description: "Your bare hands. Not very effective.",
        actions: [
            {
                target: "tree",
                effect: "harvest",
                drop: "wood",
                message: "You punched the tree, and got some wood."
            }
        ]

    },


    axe: {
        name: "Axe",
        rank: "D",
        actions: [
            {
                target: "tree",
                effect: "harvest",
                drop: "wood",
                message: "You chopped down the tree, and got some wood."
            }
        ]

    },


    pickaxe: {
        name: "Pickaxe",
        rank: "D",
        actions: [
            {
                target: "rock",
                effect: "harvest",
                drop: "flint"
            }
        ]

    }

};