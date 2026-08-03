export class Input {

    constructor(canvas) {

        this.mouse = {
            x: 0,
            y: 0,
            down: false
        };


        canvas.addEventListener(
            "mousemove",
            (event) => {

                const rect = canvas.getBoundingClientRect();

                this.mouse.x =
                    event.clientX - rect.left;

                this.mouse.y =
                    event.clientY - rect.top;

            }
        );


        canvas.addEventListener(
            "mousedown",
            () => {

                this.mouse.down = true;

            }
        );


        canvas.addEventListener(
            "mouseup",
            () => {

                this.mouse.down = false;

            }
        );

    }

}