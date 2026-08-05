export class ImageRenderer {

    constructor(renderer) {

        this.renderer = renderer;
        this.device = renderer.device;

        this.cache = new Map();

        this.sampler =
            this.device.createSampler({

                magFilter: "linear",
                minFilter: "linear"

            });

        this.createPipeline();

    }



    createPipeline() {

        const shader = `

        struct VertexOutput {

            @builtin(position)
            position : vec4<f32>,

            @location(0)
            uv : vec2<f32>

        };


        @vertex
        fn vs_main(

            @location(0) position : vec2<f32>,
            @location(1) uv : vec2<f32>

        ) -> VertexOutput {

            var out : VertexOutput;

            out.position =
                vec4<f32>(
                    position,
                    0.0,
                    1.0
                );

            out.uv = uv;

            return out;

        }


        @group(0)
        @binding(0)
        var imageTexture : texture_2d<f32>;


        @group(0)
        @binding(1)
        var imageSampler : sampler;


        @fragment
        fn fs_main(

            input : VertexOutput

        ) -> @location(0) vec4<f32> {

            return textureSample(
                imageTexture,
                imageSampler,
                input.uv
            );

        }

        `;


        const module =
            this.device.createShaderModule({
                code: shader
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

                    topology: "triangle-list"

                }

            });

    }



    createTexture(image) {

            if (
                !image ||
                !image.width ||
                !image.height
            ) {

                console.warn(
                    "Invalid image:",
                    image
                );

                return null;

            }

        if (this.cache.has(image)) {
            return this.cache.get(image);
        }


        const texture =
            this.device.createTexture({

                size: [

                    image.width,
                    image.height

                ],

                format: "rgba8unorm",

                usage:

                    GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_DST |
                    GPUTextureUsage.RENDER_ATTACHMENT

            });



        this.device.queue.copyExternalImageToTexture(

            {
                source: image
            },

            {
                texture
            },

            [

                image.width,
                image.height

            ]

        );


        const data = {

            texture,

            width: image.width,

            height: image.height

        };


        this.cache.set(
            image,
            data
        );


        return data;

    }


    async loadImage(src) {

        if (this.cache.has(src)) {
            return;
        }


        const img = new Image();

        img.src = src;

        await img.decode();


        const texture =
            this.device.createTexture({

                size:[
                    img.width,
                    img.height
                ],

                format:"rgba8unorm",

                usage:
                    GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_DST |
                    GPUTextureUsage.RENDER_ATTACHMENT

            });


        this.device.queue.copyExternalImageToTexture(
            {
                source: img
            },
            {
                texture
            },
            [
                img.width,
                img.height
            ]
        );


        this.cache.set(
            src,
            {
                texture,
                width: img.width,
                height: img.height
            }
        );

    }



    draw(pass, image, screenX, screenY, width, height) {

        let data;


        // Image is not loaded yet
        if (typeof image === "string") {

            if (!this.cache.has(image)) {

                this.loadImage(image);

                return; // skip this frame

            }


            data =
                this.cache.get(image);

        }
        else {

            data =
                this.createTexture(image);

        }


        if (!data) {
            return;
        }


        const x1 = screenX - width / 2;
        const y1 = screenY - height / 2;

        const x2 = screenX + width / 2;
        const y2 = screenY + height / 2;


        const vertices = [

            x1, y1, 0, 0,
            x2, y1, 1, 0,
            x1, y2, 0, 1,

            x1, y2, 0, 1,
            x2, y1, 1, 0,
            x2, y2, 1, 1

        ];


        const clipVertices = [];

        for (let i = 0; i < vertices.length; i += 4) {

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
                    clipVertices.length * 4,

                usage:
                    GPUBufferUsage.VERTEX,

                mappedAtCreation:
                    true

            });


        new Float32Array(
            buffer.getMappedRange()
        ).set(clipVertices);

        buffer.unmap();


        const bindGroup =
            this.device.createBindGroup({

                layout:
                    this.pipeline.getBindGroupLayout(0),

                entries:[

                    {
                        binding:0,
                        resource:
                            data.texture.createView()
                    },

                    {
                        binding:1,
                        resource:
                            this.sampler
                    }

                ]

            });


        pass.setPipeline(this.pipeline);

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