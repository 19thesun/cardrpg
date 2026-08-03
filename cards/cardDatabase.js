export function getCardData(id) {

    return cardDatabase[id];

}

export const cardDatabase = {

    tree: {
        name: "Tree",
        color: {
            r: 0.2,
            g: 0.7,
            b: 0.2
        },
        actions: []
    },


    wood: {
        name: "Wood",
        color: {
            r: 0.55,
            g: 0.3,
            b: 0.1
        },
        actions: []
    },


    fist: {
        name: "Fist",
        color: {
            r: 0.8,
            g: 0.65,
            b: 0.45
        },
        actions: [
            {
                target: "tree",
                action: "punch_tree"
            },
            {
                target: "rock",
                action: "break_rock"
            }
        ]
    },


    pickaxe: {
        name: "Pickaxe",
        color: {
            r: 0.5,
            g: 0.5,
            b: 0.55
        },
        actions: [
            {
                target: "rock",
                action: "mine_rock"
            },
            {
                target: "cave",
                action: "mine_cave"
            }
        ]
    },


    cave: {
        name: "Cave",
        color: {
            r: 0.15,
            g: 0.15,
            b: 0.18
        },
        actions: [
            {
                target: null,
                action: "spawn_rocks"
            }
        ]
    },


    rock: {
        name: "Rock",
        color: {
            r: 0.45,
            g: 0.45,
            b: 0.45
        },
        actions: []
    }

};