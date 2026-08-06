import { Card } from "../cards/Card.js";
import { TextRenderer } from "./TextRenderer.js";
import { ImageRenderer } from "./ImageRenderer.js";

export class Renderer {

    // Shit code, remove later
    shaderSource = `

    struct VertexOutput {

        @builtin(position)
        position : vec4<f32>,

        @location(0)
        color : vec3<f32>,

        @location(1)
        uv : vec2<f32>,

        @location(2)
        size : vec2<f32>,

        @location(3)
        radius : f32
    };


    @vertex
    fn vs_main(

        @location(0)
        position : vec2<f32>,

        @location(1)
        color : vec3<f32>,

        @location(2)
        uv : vec2<f32>,

        @location(3)
        size : vec2<f32>,

        @location(4)
        radius : f32

    ) -> VertexOutput {

        var output : VertexOutput;

        output.position =
            vec4<f32>(
                position,
                0.0,
                1.0
            );

        output.color = color;
        output.uv = uv;
        output.size = size;
        output.radius = radius;

        return output;
    }


    // Signed distance rounded rectangle
    fn roundedBox(
        p : vec2<f32>,
        b : vec2<f32>,
        r : f32
    ) -> f32 {

        let q =
            abs(p) - b + vec2<f32>(r);


        return
            length(max(q, vec2<f32>(0.0)))
            - r;

    }


    // Fragment shader
    @fragment
    fn fs_main(

        input : VertexOutput

    ) -> @location(0) vec4<f32> {


        // Convert UV from 0-1 space into -0.5 to 0.5 space
        let aspect =
            input.size.x / input.size.y;

        let p =
            (input.uv - vec2<f32>(0.5))
            * vec2<f32>(
                aspect,
                1.0
            );


        // Half width/height
        let size = vec2<f32>(
            0.42,
            0.42
        );


        // Rounded corner radius
        // 0.1 = fairly rounded
        
        let radius = input.radius;

        let distance =
            roundedBox(
                p,
                vec2<f32>(
                    aspect * 0.5 - radius,
                    0.5 - radius
                ),
                radius
            );


        // Throw away pixels outside the rounded rectangle
        let alpha =
            1.0 - smoothstep(
                0.0,
                0.01,
                distance
            );

        return vec4<f32>(
            input.color,
            alpha
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
                        arrayStride: 40,

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
                            },

                            {
                                shaderLocation: 2,
                                offset: 20,
                                format: "float32x2"
                            },

                            {
                                shaderLocation: 3,
                                offset: 28,
                                format: "float32x2"
                            },

                            {
                                shaderLocation:4,
                                offset: 36,
                                format: "float32"
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
                        format: this.format,

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
        this.textRenderer  = new TextRenderer(this);
        this.imageRenderer = new ImageRenderer(this);
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
            // Ignore dragged cards
                if (shape.dragging) {
                    shape.screenScale = 1;
                }
                else {
                    shape.screenScale = scale;
                }            
            }
            else {
                shape.screenScale = 1;
            }

        }

    }

    drawRecursive(shape, pass, parentTransform = null) {

        if (shape.visible === false) {
            return;
        }

        let transform = {
            x: shape.x,
            y: shape.y,
            scale: shape.scale,
            width: shape.width,
            height: shape.height,
            space: shape.space,
            screenScale: shape.screenScale
        };
        if (parentTransform) {
            shape.geometryDirty = true;
        }
        // Apply parent transform
        if (parentTransform) {

            transform.x =
                parentTransform.x +
                shape.localX * parentTransform.scale * parentTransform.screenScale;

            transform.y =
                parentTransform.y +
                shape.localY * parentTransform.scale * parentTransform.screenScale;

            transform.scale =
                parentTransform.scale;

            transform.width =
                shape.localWidth;

            transform.height =
                shape.localHeight;

            transform.space =
                parentTransform.space;

            transform.screenScale =
                parentTransform.screenScale;
        }

        // Pre-children
        for (const child of shape.preChildren) {
            this.drawRecursive(child, pass, transform);
        }

        // The shape itself
        this.drawShape(shape, pass, transform);

        // Normal children
        for (const child of shape.children) {
            this.drawRecursive(child, pass, transform);
        }
    }

    drawShape(shape, pass, transform = null) {

        const oldX = shape.x;
        const oldY = shape.y;
        const oldScale = shape.scale;
        const oldSpace = shape.space;
        const oldScreenScale = shape.screenScale;
        let transformChanged = false;


        if (transform) {
            transformChanged =
                !shape.lastTransform ||
                shape.lastTransform.x !== transform.x ||
                shape.lastTransform.y !== transform.y ||
                shape.lastTransform.scale !== transform.scale ||
                shape.lastTransform.screenScale !== transform.screenScale;
            
            if (transformChanged) {
                shape.geometryDirty = true;
            }

            shape.lastTransform = {
                x: transform.x,
                y: transform.y,
                scale: transform.scale,
                screenScale: transform.screenScale
            };

            shape.x = transform.x;
            shape.y = transform.y;
            shape.scale = transform.scale;
            shape.space = transform.space;
            shape.screenScale = transform.screenScale;

            shape.width = transform.width ?? shape.width;
            shape.height = transform.height ?? shape.height;

        }

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


            const vertexIndex = i / 2;

            const uvCoordinates = [
                [0, 0], // vertex 0
                [1, 0], // vertex 1
                [0, 1], // vertex 2
                [0, 1], // vertex 3
                [1, 0], // vertex 4
                [1, 1]  // vertex 5
            ];

            const uvX = uvCoordinates[vertexIndex][0];
            const uvY = uvCoordinates[vertexIndex][1];

            vertices.push(

                converted[0],
                converted[1],

                Math.min(shape.color.r * shape.colorMultiplier, 1),
                Math.min(shape.color.g * shape.colorMultiplier, 1),
                Math.min(shape.color.b * shape.colorMultiplier, 1),

                uvX,
                uvY,

                shape.width,
                shape.height,
                
                shape.cornerRadius ?? 0.08
            );

        }

        if (shape.space === "world") {

            if (
                shape.lastCameraX !== this.camera.x ||
                shape.lastCameraY !== this.camera.y ||
                shape.lastZoom !== this.camera.zoom
            ) {

                shape.geometryDirty = true;

                shape.lastCameraX = this.camera.x;
                shape.lastCameraY = this.camera.y;
                shape.lastZoom = this.camera.zoom;
            }

        }

        if (shape.geometryDirty || shape.colorDirty || !shape.vertexBuffer) {

            const vertexData =
                new Float32Array(vertices);


            if (!shape.vertexBuffer) {

                shape.vertexBuffer =
                    this.device.createBuffer({

                        size: vertexData.byteLength,

                        usage:
                            GPUBufferUsage.VERTEX |
                            GPUBufferUsage.COPY_DST

                    });

            }


            this.device.queue.writeBuffer(
                shape.vertexBuffer,
                0,
                vertexData
            );


            shape.vertexCount =
                vertexData.length / 10;


            shape.geometryDirty = false;

        }


        pass.setPipeline(this.pipeline);

        pass.setVertexBuffer(
            0,
            shape.vertexBuffer
        );

        pass.draw(
            shape.vertexCount
        );

        shape.x = oldX;
        shape.y = oldY;
        shape.scale = oldScale;
        shape.space = oldSpace;
        shape.screenScale = oldScreenScale;
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

    isVisible(shape) {

        let bounds = shape.getBounds();


        if (shape.space === "world") {

            const topLeft =
                this.camera.worldToScreen(
                    bounds.x,
                    bounds.y
                );

            const bottomRight =
                this.camera.worldToScreen(
                    bounds.x + bounds.width,
                    bounds.y + bounds.height
                );


            bounds = {

                x: topLeft.x,
                y: topLeft.y,

                width:
                    bottomRight.x - topLeft.x,

                height:
                    bottomRight.y - topLeft.y
            };

        }


        return !(
            bounds.x + bounds.width < 0 ||
            bounds.x > this.canvas.clientWidth ||
            bounds.y + bounds.height < 0 ||
            bounds.y > this.canvas.clientHeight
        );

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
            
            // If card is offscreen
            if (!this.isVisible(shape)) {
                continue;
            }

            if (shape.visible === false) {
                continue;
            }


            this.drawRecursive(shape, pass);



            if (shape instanceof Card) {


                let x;
                let y;
                let scale;



                if (layer === "world") {

                    const screen =
                        this.camera.worldToScreen(
                            shape.x + shape.width / 2,
                            shape.y + shape.height / 2
                        );

                    x = screen.x;
                    y = screen.y;
                    scale = this.camera.zoom;

                }
                else {

                    const bounds =
                        shape.getBounds();

                    x =
                        bounds.x + bounds.width / 2;

                    y =
                        bounds.y + bounds.height / 2;

                    scale =
                        shape.screenScale;

                }



                const cardLeft =
                    x - (shape.width / 2) * scale * shape.scale;

                const cardTop =
                    y - (shape.height / 2) * scale * shape.scale;



                // IMAGE
                if (shape.image) {

                    const cardLeft =
                        x - (shape.width / 2) * scale * shape.scale;

                    const cardTop =
                        y - (shape.height / 2) * scale * shape.scale;


                    const imageX =
                        cardLeft + shape.imageBox.localX * scale * shape.scale
                        + (shape.imageBox.width * scale * shape.scale) / 2;


                    const imageY =
                        cardTop + shape.imageBox.localY * scale * shape.scale
                        + (shape.imageBox.height * scale * shape.scale) / 2;

                    
                    this.imageRenderer.draw(
                        pass,
                        shape.image,
                        imageX,
                        imageY,
                        shape.imageBox.width * scale * shape.scale,
                        shape.imageBox.height * scale * shape.scale
                    );

                }




                // TEXT
                for (const element of shape.textElements) {


                    const textPosition = {

                        x:
                            cardLeft +
                            element.x *
                            scale *
                            shape.scale,


                        y:
                            cardTop +
                            element.y *
                            scale *
                            shape.scale

                    };



                    this.textRenderer.draw(
                        pass,
                        element.text(),
                        textPosition.x,
                        textPosition.y,
                        scale *
                        shape.scale *
                        element.size,
                        element.bounds,
                        element.fontSize,
                        element.align,
                        element.anchor
                    );

                }

            }

        }



        pass.end();


        this.device.queue.submit([
            encoder.finish()
        ]);

    }

    render(scene) {
        this.textRenderer.currentVertexBuffer = 0;

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