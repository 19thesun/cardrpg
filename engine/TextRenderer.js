export class TextRenderer {

    constructor(renderer) {

        this.renderer = renderer;

        this.device = renderer.device;

        this.cache = new Map();


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



    createTexture(text) {

        const fontSize = 20;
        const padding = 10;

        const cacheKey = `${text}_${fontSize}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }


        const canvas =
            document.createElement("canvas");

        const ctx =
            canvas.getContext("2d");


        ctx.font =
            `${fontSize}px Arial`;


        const width =
            Math.ceil(
                ctx.measureText(text).width
            ) + padding * 2;


        const height =
            fontSize + padding * 2;


        canvas.width = width;
        canvas.height = height;


        ctx.font =
            `${fontSize}px Arial`;

        ctx.fillStyle =
            "white";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";


        ctx.fillText(
            text,
            width / 2,
            height / 2
        );


        const texture =
            this.device.createTexture({

                size: [
                    canvas.width,
                    canvas.height
                ],

                format:
                    "rgba8unorm",

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


        const data = {

            texture,

            width:
                canvas.width,

            height:
                canvas.height

        };


        this.cache.set(
            cacheKey,
            data
        );


        return data;

    }




    draw(

        pass,

        text,

        screenX,

        screenY,

        scale = 1

    ) {


        const data =
            this.createTexture(text);



        const width =
            data.width * scale;


        const height =
            data.height * scale;



        const x1 =
            screenX - width / 2;


        const y1 =
            screenY - height / 2;


        const x2 =
            screenX + width / 2;


        const y2 =
            screenY + height / 2;



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



        const buffer =
            this.device.createBuffer({

                size:
                    clipVertices.length *
                    4,


                usage:
                    GPUBufferUsage.VERTEX,


                mappedAtCreation:
                    true

            });



        new Float32Array(
            buffer.getMappedRange()
        ).set(
            clipVertices
        );


        buffer.unmap();



        const bindGroup =
            this.device.createBindGroup({

                layout:
                    this.pipeline
                    .getBindGroupLayout(0),


                entries: [

                    {

                        binding: 0,

                        resource:
                            data.texture
                            .createView()

                    },


                    {

                        binding: 1,

                        resource:
                            this.sampler

                    }

                ]

            });



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