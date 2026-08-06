export class BehaviorFactory {

    static create(data) {

        if (!data)
            return null;

        switch (data.type) {
            case "timer":
                return new TimerBehavior(data);

            case "proximity":
                return new ProximityBehavior(data);

            case "craft":
                return new CraftBehavior(data)

            default:
                console.warn(
                    "Unknown behavior:",
                    data.type
                );

                return null;
        }

    }


    static createAction(data) {

        if (!data)
            return null;


        switch (data.type) {

            case "spawn":
                return new SpawnAction(data);

            default:
                console.warn(
                    "Unknown action:",
                    data.type
                );

                return null;
        }

    }

}


// ---------------------
// Behaviors
// ---------------------

class CraftBehavior {

    constructor(data) {

        this.requires = data.requires;
        this.result = data.result;

    }


    update(card, deltaTime, context) {

        const resources = [];


        for (const requirement of this.requires) {

            const nearby =
                context.scene.getShapes()
                .filter(other =>
                    other !== card &&
                    other.id === requirement.card &&
                    this.distance(card, other) < 200
                );


            if (nearby.length < requirement.amount) {
                return;
            }


            // take only the amount needed
            resources.push(
                ...nearby.slice(0, requirement.amount)
            );

        }


        this.craft(
            card,
            context,
            resources
        );

    }


    craft(card, context, resources) {

        console.log(
            "Crafted",
            this.result
        );


        // consume resources
        for (const resource of resources) {

            context.scene.remove(resource);

        }


        const crafted =
            context.spawner.spawn(
                card.x,
                card.y,
                this.result
            );


        context.scene.add(crafted);


        // remove recipe
        context.scene.remove(card);

    }


    distance(a, b) {

        const dx = a.x - b.x;
        const dy = a.y - b.y;

        return Math.sqrt(
            dx * dx + dy * dy
        );

    }

}

class ProximityBehavior {

    constructor(data) {

        this.requires =
            data.requires;

        this.radius =
            data.radius;

        this.action =
            data.action;

        this.interval =
            data.interval ?? 0;

        this.timer = 0;

        this.target = null;

    }


    update(card, deltaTime, context) {

        // Already processing something
        if (this.target) {

            this.timer += deltaTime;


            if (this.timer >= this.interval) {

                this.timer = 0;

                this.execute(
                    card,
                    this.target,
                    context
                );

                this.target = null;
            }


            return;

        }



        const nearby =
            context.scene.getShapes()
            .find(other =>
                other !== card &&
                other.id === this.requires &&
                this.distance(card, other)
                <= this.radius
            );


        if (nearby) {

            this.target = nearby;

        }

    }


    execute(card, target, context) {

        switch(this.action.type) {

            case "replace":

                const result =
                    context.spawner.spawn(
                        target.x,
                        target.y,
                        this.action.result
                    );


                context.scene.add(result);

                context.scene.remove(target);

                break;

        }

    }


    distance(a,b) {

        const dx = a.x - b.x;
        const dy = a.y - b.y;

        return Math.sqrt(
            dx * dx +
            dy * dy
        );

    }

}

class TimerBehavior {

    constructor(data) {

        this.interval =
            data.interval;

        this.timer = 0;

        this.action =
            BehaviorFactory.createAction(
                data.action
            );

    }


    update(card, deltaTime, context) {
        this.timer += deltaTime;


        if (this.timer >= this.interval) {

            this.timer = 0;

            this.action.execute(
                card,
                context
            );

        }

    }

}


// ---------------------
// Actions
// ---------------------

class SpawnAction {

    constructor(data) {

        this.card =
            data.card;

    }


    execute(card, context) {

        console.log(
            "Spawning",
            this.card,
        );


        const radius = 300;


        // Random angle
        const angle =
            Math.random() * Math.PI * 2;


        // Random distance inside circle
        const distance =
            Math.sqrt(Math.random()) * radius;


        const x =
            card.x +
            Math.cos(angle) * distance;


        const y =
            card.y +
            Math.sin(angle) * distance;


        const created =
            context.spawner.spawn(
                x,
                y,
                this.card
            );


        context.scene.add(created);

    }

}