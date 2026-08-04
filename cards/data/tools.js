export default {

    fist: {

        name: "Fist",

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

        actions: [
            {
                target: "rock",
                effect: "harvest",
                drop: "flint"
            }
        ]

    }

};