export default {

    fist: {
        cardNumber: 7,
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
        cardNumber:  8,
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
        cardNumber: 9,
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