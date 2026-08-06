import terrain from "./terrain.js";
import resources from "./resources.js";
import tools from "./tools.js";
import buildings from "./buildings.js";
import recipes from "./recipes.js"

export const cardDatabase = {
    ...terrain,
    ...resources,
    ...tools,
    ...buildings,
    ...recipes
};

export function getCardData(id) {

    return cardDatabase[id];

}