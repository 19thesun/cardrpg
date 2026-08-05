export default {
    furnace: {

        name: "Furnace",

        behavior: {

            type: "proximity",

            radius: 200,

            target: "ore",

            action: {

                type: "transform",

                into: "ingot"

            }

        }

    }
}