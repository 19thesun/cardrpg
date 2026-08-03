export class Renderer {

    // Shit code, remove later
    shaderSource = `

    struct VertexOutput {

        @builtin(position)
        position : vec4<f32>,

        @location(0)
        color : vec3<f32>

    };


    @vertex
    fn vs_main(

        @location(0)
        position : vec2<f32>,

        @location(1)
        color : vec3<f32>

    ) -> VertexOutput {

        var output : VertexOutput;

        output.position = vec4<f32>(
            position,
            0.0,
            1.0
        );

        output.color = color;

        return output;

    }


    @fragment
    fn fs_main(

        input : VertexOutput

    ) -> @location(0) vec4<f32> {

        return vec4<f32>(
            input.color,
            1.0
        );

    }

    `;

    constructor(canvas, screenCanvas = null) {
        this.canvas = canvas;
        this.screenCanvas = screenCanvas;
        this.camera = null;
        this.overlayContext = null;
    }

    async initialize() {

        if (!navigator.gpu) {
            throw new Error("WebGPU isn't supported.");
        }

        this.adapter = await navigator.gpu.requestAdapter();

        if (!this.adapter) {
            throw new Error("Couldn't find GPU adapter.");
        }

        this.device = await this.adapter.requestDevice();

        this.context = this.canvas.getContext("webgpu");

        if (this.screenCanvas) {
            this.overlayContext = this.screenCanvas.getContext("2d");
        }

        this.format = navigator.gpu.getPreferredCanvasFormat();

        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: "premultiplied"
        });

        this.resize();

        this.shaderModule = this.device.createShaderModule({
            code: this.shaderSource
        });

        this.pipeline = this.device.createRenderPipeline({
            layout: "auto",

            vertex: {
                module: this.shaderModule,
                entryPoint: "vs_main",

                buffers: [
                    {
                        arrayStride: 20,

                        attributes: [

                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: "float32x2"
                            },

                            {
                                shaderLocation: 1,
                                offset: 8,
                                format: "float32x3"
                            }

                        ]
                    }
                ]
            },

            fragment: {
                module: this.shaderModule,
                entryPoint: "fs_main",

                targets: [
                    {
                        format: this.format
                    }
                ]
            },

            primitive: {
                topology: "triangle-list"
            }
        });
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width =
            Math.floor(this.canvas.clientWidth * dpr);

        this.canvas.height =
            Math.floor(this.canvas.clientHeight * dpr);

        if (this.screenCanvas) {
            this.screenCanvas.width = this.canvas.width;
            this.screenCanvas.height = this.canvas.height;
        }

        if (this.context) {
            this.context.configure({
                device: this.device,
                format: this.format,
                alphaMode: "premultiplied"
            });
        }
    }

    updateScreenScale(scene) {

        const scale =
            this.canvas.clientWidth / 1440;


        for (const shape of scene.getShapes()) {

            if (shape.space === "screen") {
                shape.screenScale = scale;
            }
            else {
                shape.screenScale = 1;
            }

        }

    }

    drawScreenShape(shape) {

        const {
            x,
            y,
            width,
            height
        } = shape.getBounds();

        const color = {
            ...shape.color,
            a: shape.color.a ?? 1
        };

        this.overlayContext.fillStyle =
            `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${color.a})`;

        this.overlayContext.fillRect(
            x,
            y,
            width,
            height
        );

    }

    drawShape(shape, pass) {

        const shapeVertices = shape.getVertices();

        const vertices = [];


        for (let i = 0; i < shapeVertices.length; i += 2) {

                let screenPoint;

                if (shape.space === "screen") {

                    screenPoint = {
                        x: shapeVertices[i],
                        y: shapeVertices[i + 1]
                    };

                } else {

                    screenPoint =
                        this.camera.worldToScreen(
                            shapeVertices[i],
                            shapeVertices[i + 1]
                        );

                }


            // Then convert screen pixels to WebGPU clip space
            const converted = this.screenToClip(
                screenPoint.x,
                screenPoint.y
            );


            vertices.push(

                converted[0],
                converted[1],

                shape.color.r,
                shape.color.g,
                shape.color.b

            );

        }


        const vertexData = new Float32Array(vertices);


        const vertexBuffer = this.device.createBuffer({

            size: vertexData.byteLength,

            usage: GPUBufferUsage.VERTEX |
                GPUBufferUsage.COPY_DST,

            mappedAtCreation: true

        });


        new Float32Array(
            vertexBuffer.getMappedRange()
        ).set(vertexData);

        vertexBuffer.unmap();


        pass.setPipeline(this.pipeline);

        pass.setVertexBuffer(
            0,
            vertexBuffer
        );

        pass.draw(
            vertexData.length / 5
        );

    }

    screenToClip(x, y) {

        const clipX =
            (x / this.canvas.clientWidth) * 2 - 1;

        const clipY =
            1 - (y / this.canvas.clientHeight) * 2;

        return [
            clipX,
            clipY
        ];

    }

    render(scene) {

        this.updateScreenScale(scene);

        const encoder = this.device.createCommandEncoder();

        const pass = encoder.beginRenderPass({

            colorAttachments: [
                {
                    view: this.context
                        .getCurrentTexture()
                        .createView(),

                    clearValue: {
                        r: 0,
                        g: 0,
                        b: 0,
                        a: 0
                    },

                    loadOp: "clear",

                    storeOp: "store"
                }
            ]

        });


        pass.setPipeline(this.pipeline);


        for (const shape of scene.getShapes()) {
            if (shape.visible === false) {
                continue;
            }

            if (shape.space === "screen") {
                continue;
            }

            if (shape.selected) {
                const borderWeight = 4;

                shape.outline.x =
                    shape.x - borderWeight;

                shape.outline.y =
                    shape.y - borderWeight;

                shape.outline.width =
                    shape.width + borderWeight * 2;

                shape.outline.height =
                    shape.height + borderWeight * 2;

                shape.outline.scale =
                    shape.scale;

                shape.outline.space =
                    shape.space;

                shape.outline.screenScale =
                    shape.screenScale;

                this.drawShape(shape.outline, pass);
            }

            this.drawShape(shape, pass);
        }


        pass.end();

        this.renderScreenShapes(scene);


        this.device.queue.submit([
            encoder.finish()
        ]);

    }

    renderScreenShapes(scene) {

        if (!this.overlayContext || !this.screenCanvas) {
            return;
        }

        this.overlayContext.clearRect(
            0,
            0,
            this.screenCanvas.width,
            this.screenCanvas.height
        );

        for (const shape of scene.getShapes()) {
            if (shape.space !== "screen") {
                continue;
            }

            if (shape.visible === false) {
                continue;
            }

            this.drawScreenShape(shape);
        }

    }

    clear(color = { r: 0, g: 0, b: 0, a: 0 }) {

        const encoder = this.device.createCommandEncoder();

        const pass = encoder.beginRenderPass({

            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),

                clearValue: color,

                loadOp: "clear",

                storeOp: "store"
            }]
        });

        pass.end();

        this.device.queue.submit([encoder.finish()]);

    }

}