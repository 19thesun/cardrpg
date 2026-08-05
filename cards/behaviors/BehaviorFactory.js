export class BehaviorFactory {

    static create(data) {

        if (!data)
            return null;

        switch (data.type) {
            case "timer":
                return new TimerBehavior(data);


            case "proximity":
                return new ProximityBehavior(data);


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