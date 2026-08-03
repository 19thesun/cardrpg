import { Card } from "../cards/Card.js";
import { TextRenderer } from "./TextRenderer.js";

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

        this.worldContext =
            this.canvas.getContext("webgpu");

        this.screenContext =
            this.screenCanvas.getContext("webgpu");

        this.format = navigator.gpu.getPreferredCanvasFormat();

        this.worldContext.configure({
            device: this.device,
            format: this.format,
            alphaMode: "premultiplied"
        });


        this.screenContext.configure({
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
        this.textRenderer = new TextRenderer(this);
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

    drawOutline(shape, pass) {
        if (shape.selected) {
            shape.updateChildren();
            this.drawShape(shape.outline, pass);
        }
    }

    renderLayer(scene, layer, context) {

        const encoder =
            this.device.createCommandEncoder();


        const pass =
            encoder.beginRenderPass({

                colorAttachments: [
                    {
                        view:
                            context
                            .getCurrentTexture()
                            .createView(),

                        clearValue:{
                            r:0,
                            g:0,
                            b:0,
                            a:0
                        },

                        loadOp:"clear",
                        storeOp:"store"
                    }
                ]

            });


        pass.setPipeline(this.pipeline);


        const shapes =
            [...scene.getShapes()]
            .filter(s => s.space === layer)
            .sort((a,b)=>a.zIndex-b.zIndex);


        for (const shape of shapes) {

            if (shape.visible === false) {
                continue;
            }

            this.drawOutline(shape, pass);

            this.drawShape(shape, pass);


            if (shape instanceof Card) {

                let x;
                let y;
                let scale;


                if (layer === "world") {

                    const screen =
                        this.camera.worldToScreen(
                            shape.x + shape.width/2,
                            shape.y + shape.height/2
                        );

                    x = screen.x;
                    y = screen.y;
                    scale = this.camera.zoom;

                }
                else {

                    const bounds =
                        shape.getBounds();

                    x =
                        bounds.x + bounds.width/2;

                    y =
                        bounds.y + bounds.height/2;

                    scale =
                        shape.screenScale;

                }


                this.textRenderer.draw(
                    pass,
                    shape.name,
                    x,
                    y,
                    scale * shape.scale
                );

            }

        }


        pass.end();


        this.device.queue.submit([
            encoder.finish()
        ]);

    }

    render(scene) {

        this.updateScreenScale(scene);

        this.renderLayer(
            scene,
            "world",
            this.worldContext
        );


        this.renderLayer(
            scene,
            "screen",
            this.screenContext
        );

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

    createTextTexture(text) {

        if (this.textCache.has(text)) {
            return this.textCache.get(text);
        }


        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");


        ctx.font = "32px Arial";


        const width = ctx.measureText(text).width + 20;

        canvas.width = width;
        canvas.height = 50;


        ctx.font = "32px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";


        ctx.fillText(
            text,
            width / 2,
            25
        );


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


        this.textCache.set(
            text,
            texture
        );


        return texture;

    }

}