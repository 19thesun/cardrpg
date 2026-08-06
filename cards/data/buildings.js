export default {

    furnace: {

        name:"Furnace",
        rank: "B",
        description: "Will smelt nearby ores",
        image: "./assets/furnace.png",
        behavior: {

            type:"proximity",

            requires:"iron_ore",

            radius:150,

            interval:2000,

            action:{
                type:"replace",
                result:"iron_bar"
            }

        }

    },

    sawmill: {
        name: "Sawmill",
        rank: "B",
        behavior:{
            type:"proximity",
            requires:"wood",
            interval:3000,
            action:{
                type:"replace",
                result:"plank"
            }
        }
    },

    campfire:{
        name: "Campfire",
        rank: "B",
        behavior:{
            type:"proximity",
            requires:"wood",
            interval:10000,
            action:{
                type:"replace",
                result:"charcoal"
            }
        }
    }
}