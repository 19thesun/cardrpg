export class TextRenderer {

    constructor(renderer) {

        this.renderer = renderer;

        this.device = renderer.device;

        this.cache = new Map();
        this.bindGroupCache = new Map();

        this.vertexBuffers = [];
        this.currentBuffer = 0;

        this.shader = `

        struct VertexOutput {

            @builtin(position)
            position : vec4<f32>,

            @location(0)
            uv : vec2<f32>

        };


        @vertex
        fn vs_main(

            @location(0)
            position : vec2<f32>,

            @location(1)
            uv : vec2<f32>

        ) -> VertexOutput {

            var output : VertexOutput;

            output.position =
                vec4<f32>(
                    position,
                    0.0,
                    1.0
                );

            output.uv = uv;

            return output;

        }


        @group(0)
        @binding(0)
        var textTexture : texture_2d<f32>;


        @group(0)
        @binding(1)
        var textSampler : sampler;


        @fragment
        fn fs_main(

            input : VertexOutput

        ) -> @location(0) vec4<f32> {


            return textureSample(
                textTexture,
                textSampler,
                input.uv
            );

        }

        `;


        this.createPipeline();
        const originalCreateBuffer = this.device.createBuffer.bind(this.device);

        this.bufferCount = 0;

        this.device.createBuffer = (...args) => {

            this.bufferCount++;

            return originalCreateBuffer(...args);
        };
    }



    createPipeline() {


        const module =
            this.device.createShaderModule({
                code: this.shader
            });



        this.pipeline =
            this.device.createRenderPipeline({

                layout: "auto",


                vertex: {

                    module,

                    entryPoint: "vs_main",


                    buffers: [

                        {

                            arrayStride: 16,


                            attributes: [

                                {
                                    shaderLocation: 0,
                                    offset: 0,
                                    format: "float32x2"
                                },


                                {
                                    shaderLocation: 1,
                                    offset: 8,
                                    format: "float32x2"
                                }

                            ]

                        }

                    ]

                },


                fragment: {

                    module,

                    entryPoint: "fs_main",

                    targets: [
                        {
                            format: this.renderer.format,

                            blend: {

                                color: {

                                    srcFactor: "src-alpha",

                                    dstFactor: "one-minus-src-alpha"

                                },

                                alpha: {

                                    srcFactor: "one",

                                    dstFactor: "one-minus-src-alpha"

                                }

                            }

                        }
                    ]

                },


                primitive: {

                    topology:
                        "triangle-list"

                }

            });


        this.sampler =
            this.device.createSampler({

                magFilter: "linear",

                minFilter: "linear"

            });


    }

    wrapText(text, maxWidth, ctx) {

        const words = text.split(" ");
        const lines = [];

        let currentLine = "";

        for (const word of words) {

            const testLine =
                currentLine.length === 0
                    ? word
                    : currentLine + " " + word;


            const width =
                ctx.measureText(testLine).width;


            if (width > maxWidth && currentLine.length > 0) {

                lines.push(currentLine);

                currentLine = word;

            }
            else {

                currentLine = testLine;

            }

        }


        if (currentLine.length > 0) {
            lines.push(currentLine);
        }


        return lines;

    }

    createTextureFromCanvas(canvas) {

        if (canvas.width <= 0 || canvas.height <= 0) {
            console.warn("Invalid text canvas size", canvas.width, canvas.height);
            return null;
        }

        const texture =
            this.device.createTexture({

                size: [
                    canvas.width,
                    canvas.height
                ],

                format: "rgba8unorm",

                usage:
                    GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_DST |
                    GPUTextureUsage.RENDER_ATTACHMENT

            });


        this.device.queue.copyExternalImageToTexture(

            {
                source: canvas
            },

            {
                texture
            },

            [
                canvas.width,
                canvas.height
            ]

        );


        return texture;

    }

    createTexture(text, bounds = null, startingFontSize = 20, align = "center") {
        
        let fontSize = startingFontSize;
        const padding = 5;

        const resolution = 3;

        const canvas =
            document.createElement("canvas");

        const ctx =
            canvas.getContext("2d");


        let lines = [];


        const maxWidth =
            bounds?.width ?? Infinity;

        const maxHeight =
            bounds?.height ?? Infinity;


    do {

        ctx.font =
            `${fontSize}px Arial`;

        lines =
            this.wrapText(
                text,
                maxWidth - padding * 2,
                ctx
            );

        const height =
            lines.length * fontSize + padding * 2;


        if (
            height <= maxHeight &&
            Math.max(
                ...lines.map(line =>
                    ctx.measureText(line).width
                )
            ) <= maxWidth
        ) {
            break;
        }


        fontSize -= 1;

    }
    while (fontSize > 6);



        ctx.font =
            `${fontSize}px Arial`;


        const width =
            Math.max(
                1,
                Math.min(
                    maxWidth,
                    Math.max(
                        ...lines.map(line =>
                            ctx.measureText(line).width
                        )
                    ) + padding * 2
                )
            );


        const height =
            Math.max(
                1,
                lines.length * fontSize + padding * 2
            );


        canvas.width = Math.ceil(width * resolution);
        canvas.height = Math.ceil(height * resolution);

        ctx.scale(resolution, resolution);
        ctx.font =
            `${fontSize}px Arial`;

        ctx.fillStyle = "black";

        ctx.textAlign = align;
        ctx.textBaseline = "middle";


        lines.forEach((line, i) => {

            ctx.fillText(
                line,
                align === "left"
                    ? padding
                    : width / 2,
                padding +
                fontSize / 2 +
                i * fontSize
            );

        });

        return {
            texture: this.createTextureFromCanvas(canvas),
            width: canvas.width / resolution,
            height: canvas.height / resolution
        };

    }

    getVertexBuffer() {

        if (!this.vertexBuffers[this.currentBuffer]) {

            this.vertexBuffers[this.currentBuffer] =
                this.device.createBuffer({

                    size: 6 * 4 * 4,

                    usage:
                        GPUBufferUsage.VERTEX |
                        GPUBufferUsage.COPY_DST

                });

        }

        return this.vertexBuffers[this.currentBuffer++];

    }


    draw(
        pass,
        text,
        screenX,
        screenY,
        scale = 1,
        bounds = null,
        fontSize = 20,
        align = "center",
        anchor = "center"
    ) {

        const key =
            JSON.stringify({
                text,
                bounds,
                fontSize,
                align
            });


        let data = this.cache.get(key);


        if (!data) {

            data =
                this.createTexture(
                    text,
                    bounds,
                    fontSize,
                    align
                );

            this.cache.set(
                key,
                data
            );

        }

        const width =
            data.width * scale;


        const height =
            data.height * scale;

        let x1;
        let y1;

        if (anchor === "top-left") {

            x1 = screenX;
            y1 = screenY;

        }
        else {

            x1 = screenX - width / 2;
            y1 = screenY - height / 2;

        }

        const x2 = x1 + width;
        const y2 = y1 + height;



        const vertices = [

            x1, y1,   0, 0,
            x2, y1,   1, 0,
            x1, y2,   0, 1,

            x1, y2,   0, 1,
            x2, y1,   1, 0,
            x2, y2,   1, 1

        ];



        const clipVertices = [];


        for (
            let i = 0;
            i < vertices.length;
            i += 4
        ) {


            const clip =
                this.renderer.screenToClip(

                    vertices[i],

                    vertices[i + 1]

                );



            clipVertices.push(

                clip[0],
                clip[1],

                vertices[i + 2],
                vertices[i + 3]

            );

        }

        const buffer = this.getVertexBuffer();

        this.device.queue.writeBuffer(
            buffer,
            0,
            new Float32Array(clipVertices)
        );

        let bindGroup =
            this.bindGroupCache.get(key);

        if (!bindGroup) {

            bindGroup =
                this.device.createBindGroup({

                    layout:
                        this.pipeline
                        .getBindGroupLayout(0),

                    entries: [
                        {
                            binding: 0,
                            resource:
                                data.texture.createView()
                        },

                        {
                            binding: 1,
                            resource:
                                this.sampler
                        }
                    ]

                });


            this.bindGroupCache.set(
                key,
                bindGroup
            );

        }



        pass.setPipeline(
            this.pipeline
        );


        pass.setBindGroup(
            0,
            bindGroup
        );


        pass.setVertexBuffer(
            0,
            buffer
        );


        pass.draw(6);

    }

}