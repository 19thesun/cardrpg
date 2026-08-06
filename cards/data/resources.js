export default {

    wood: {
        name: "Wood",
        rank: "C",
        description: "Yeah it's wood. Whatever.",
        image: "./assets/wood.webp",
        actions: [
            {
                target: "wood",
                effect: "harvest",
                drop: "fire",
                message: "You rubbed two pieces of wood together and made a fire."
            }
        ]
    },

    fire: {

        name: "Fire",
        rank: "B",
        image: "./assets/fire.webp",
        description:
            "A small fire. Useful for heating things.",

        actions: [

            {
                target: "iron_ore",
                effect: "spawn",
                spawn: "furnace_recipe",
                message:
                    "it doesn't work that way IDIOT! But it does give you an idea..."
            }

        ]

    },

    thatch: {
        name: "Thatch",
        image: "./assets/thatch.webp",
        rank: "F",
        description: "Dry grass and plant fibers. Useful for simple construction."
    },

    broken_pickaxe: {
        name: "Broken Pickaxe",
        rank: "F",
        image: "./assets/broken_pickaxe.jpg",
        description: "A worn out pickaxe. Needs repair before it can mine again."
    },

    iron_bar: {
        name: "Iron Bar",
        image: "./assets/iron_bar.png",
        rank: "B",
        description: "Smelted iron, doesn't do anything yet."
    },

    flint: {
        name: "Flint",
        image: "./assets/flint.webp",
        rank: "D",
        Description: "this is from Ark" 
    },

    rock: {
        name: "Rock",
        image: "./assets/rock.png",
        rank: "D",
        description: "A little rock you found on the ground",
        actions: [
            {
                target: "cave",
                effect: "spawn",
                spawn: "basic_pickaxe_recipe",
                message: "You tried hitting a rock with another rock. It didn't do anything, but you figured something out."
            },

            {
                target: "tree",
                effect: "spawn",
                spawn: "basic_axe_recipe",
                message: "You hit the tree with a rock. It wasn't very effective, but you figured out a better tool."
            }
        ]
    },

    iron_ore: {
        name: "Iron Ore",
        image: "./assets/Iron_Ore.webp",
        rank: "C",
        description: "a little chunk of metal from the cave."
    },

    goblin_corpse: {
        name: "Dead Goblin",
        image: "./assets/Dead_Goblin.webp",
        rank: "F",
        description: "He had a family"
    },

    pain_and_suffering: {
        name: "Pain and Suffering",
        image: "./assets/skull.png",
        rank: "?",
        description: "In those days people will seek death and will not find it. They will long to die, and death will flee from them.",
        actions: [
            {
                target: "pain_and_suffering",
                effect: "harvest",
                drop: "",
                message: "depart from me."
            },

            {
                effect: "spawn",
                spawn: "",
                message: "What did you want to happen?"
            }
        ]
    }

};