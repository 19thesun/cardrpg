export default {

    fist: {
        name: "Your Bare Hands",
        rank: "C",
        image: "./assets/fist.png",
        description: "Punch stuff?",
        actions: [
            {
                target: "tree",
                effect: "harvest",
                drop: "wood",
                message: "You punched the tree, and got some wood."
            },

            {
                target: "cave",
                effect: "spawn",
                spawn: "rock",
                message: "You punched the cave and found a rock."
            },

            {
            target:"pickaxe",
            effect:"harvest",
            drop:"broken_pickaxe",
            message:
                "You punched the pickaxe LOL"
            }

        ]

    },


    axe: {
        name: "Axe",
        rank: "C",
        image: "./assets/axe.webp",
        description: "Great for chopping down trees and killing goblins in caves",
        actions: [
            {
                target: "tree",
                effect: "harvest",
                drop: "wood",
                message: "You chopped down the tree, and got some wood."
            },
            {
                target: "forest",
                effect: "spawn",
                spawn: "wood",
                message: "You went into the forest and got some wood."
            },
            {
                target: "cave",
                effect: "spawn",
                spawn: "goblin_corpse",
                message: "You went into the cave and killed a goblin!"
            }
        ]

    },


    pickaxe: {

        name:"Pickaxe",
        rank: "C",
        image: "./assets/pickaxe.png",
        description: "I wonder what this is used for",
        actions:[
            {
                target:"cave",
                effect:"spawn",
                spawn: "iron_ore",
                message: "You mined some iron."
            },
            {
                target:"rock",
                effect:"harvest",
                drop: "flint",
                message: "You crushed the rock into flint (is that how flint works?)."
            },
            {
                target:"tree",
                effect:"harvest",
                drop: "thatch",
                message: "wow just like ark"
            }
        ]
    }

};