import terrain from "./terrain.js";
import resources from "./resources.js";
import tools from "./tools.js";

export const cardDatabase = {
    ...terrain,
    ...resources,
    ...tools
};

export function getCardData(id) {

    return cardDatabase[id];

}