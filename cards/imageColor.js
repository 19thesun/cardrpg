export function getAverageImageColor(src) {

    return new Promise((resolve) => {

        const img = new Image();

        img.onload = () => {

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Small size is enough for average
            canvas.width = 1;
            canvas.height = 1;

            ctx.drawImage(
                img,
                0,
                0,
                1,
                1
            );


            const pixel =
                ctx.getImageData(
                    0,
                    0,
                    1,
                    1
                ).data;


            resolve({
                r: pixel[0] / 255,
                g: pixel[1] / 255,
                b: pixel[2] / 255,
                a: 1
            });

        };


        img.src = src;

    });

}