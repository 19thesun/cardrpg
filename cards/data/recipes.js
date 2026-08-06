export default {

    basic_pickaxe_recipe: {
        name: "Basic Pickaxe Recipe",
        description: "Place 5 wood and 5 rocks near this card to craft a pickaxe",
        image: "./assets/basic_pickaxe_recipe.jpeg",
        behavior: {
            type: "craft",
            requires: [
                {
                    card: "wood",
                    amount: 5
                },
                {
                    card: "rock",
                    amount: 5
                }
            ],
            result: "pickaxe"
        }
    },

    basic_axe_recipe: {

        name: "Basic Axe Recipe",
        image: "./assets/basic_axe_recipe.jpg",
        description:
            "Place 5 wood and 3 flint near this card to craft an axe",

        behavior: {

            type: "craft",

            requires: [

                {
                    card: "wood",
                    amount: 5
                },

                {
                    card: "flint",
                    amount: 3
                }

            ],

            result: "axe"

        }

    },

    furnace_recipe: {

        name:"Furnace Recipe",
        image: "./assets/furnace_recipe.png",
        description:
            "Place 5 rocks near this card, and add some heat.",

        behavior: {

            type:"craft",

            requires:[

                {
                    card:"rock",
                    amount:5
                },

                {
                    card:"fire",
                    amount:1
                }

            ],

            result:"furnace"

        }

    }

};