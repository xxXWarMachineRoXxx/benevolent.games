(function () {
    'use strict';

    function makeKeyListener() {
        const keyStates = new Map();
        const keyActions = new Map();
        function getKeyState(key) {
            var _a;
            return (_a = keyStates.get(key)) !== null && _a !== void 0 ? _a : { isDown: undefined };
        }
        function setKeyDownState(key, isDown) {
            var _a;
            const oldState = (_a = keyStates.get(key)) !== null && _a !== void 0 ? _a : { isDown: undefined };
            const newState = { ...oldState, isDown };
            const isChanged = oldState.isDown !== isDown;
            keyStates.set(key, newState);
            return isChanged;
        }
        function triggerKeyActions(key) {
            const actions = keyActions.get(key);
            if (actions) {
                const keyState = getKeyState(key);
                for (const action of actions)
                    action(keyState);
            }
        }
        function assertKeyActionSet(key) {
            let set = keyActions.get(key);
            if (!set) {
                set = new Set();
                keyActions.set(key, set);
            }
            return set;
        }
        window.addEventListener("keydown", ({ key }) => {
            key = key.toLowerCase();
            const isChanged = setKeyDownState(key, true);
            if (isChanged)
                triggerKeyActions(key);
        });
        window.addEventListener("keyup", ({ key }) => {
            key = key.toLowerCase();
            const isChanged = setKeyDownState(key, false);
            if (isChanged)
                triggerKeyActions(key);
        });
        return {
            getKeyState,
            on(key, action) {
                const set = assertKeyActionSet(key);
                set.add(action);
                return () => set.delete(action);
            },
            clear(key) {
                const set = assertKeyActionSet(key);
                set.clear();
            },
        };
    }

    function cap(value, min, max) {
        return value < min
            ? min
            : value > max
                ? max
                : value;
    }

    function makeMouseLooker() {
        let sensitivity = 1 / 1000;
        const radian = Math.PI / 2;
        let horizontalRadians = 0;
        let verticalRadians = 0;
        function add(x, y) {
            horizontalRadians += x;
            verticalRadians += y;
            verticalRadians = cap(verticalRadians, -radian, radian);
        }
        window.addEventListener("mousemove", (event) => {
            const { movementX, movementY } = event;
            if (document.pointerLockElement) {
                const x = movementX * sensitivity;
                const y = movementY * sensitivity;
                add(x, y);
            }
        });
        return {
            add,
            get mouseLook() {
                return { horizontalRadians, verticalRadians };
            },
        };
    }

    function spawnCrate({ scene }) {
        return async function (position) {
            const mesh = BABYLON.Mesh.CreateBox("crate", 1, scene);
            mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 1,
                friction: 1,
                restitution: 0.5,
            });
            mesh.position = new BABYLON.Vector3(...position);
        };
    }

    function spawnCamera({ middle, scene, canvas }) {
        return async function () {
            const campos = new BABYLON.Vector3(...middle);
            const camera = new BABYLON.FreeCamera("camera1", campos, scene);
            camera.attachControl(canvas, true);
            camera.minZ = 1;
            camera.maxZ = 2000;
            scene.activeCamera = camera;
            return {
                getCameraPosition() {
                    return [
                        camera.globalPosition.x,
                        camera.globalPosition.y,
                        camera.globalPosition.z,
                    ];
                },
            };
        };
    }

    function rotate(x, y, radians) {
        return [
            (x * Math.cos(radians)) - (y * Math.sin(radians)),
            (x * Math.sin(radians)) + (y * Math.cos(radians)),
        ];
    }
    function magnitude([x, y]) {
        return Math.sqrt(x * x +
            y * y);
    }
    function normalize(vector) {
        const length = magnitude(vector);
        const [x, y] = vector;
        return length === 0
            ? vector
            : [
                x / length,
                y / length,
            ];
    }
    function applyBy(vector, change) {
        return [
            change(vector[0]),
            change(vector[1]),
        ];
    }
    function multiplyBy(vector, factor) {
        return applyBy(vector, a => a * factor);
    }

    function spawnPlayer({ scene, renderLoop, looker, keyListener, thumbsticks, }) {
        return async function (position) {
            const mesh = BABYLON.MeshBuilder.CreateCapsule("player", {
                subdivisions: 2,
                tessellation: 16,
                capSubdivisions: 6,
                height: 1.75,
                radius: 0.25,
            }, scene);
            mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.CapsuleImpostor, {
                mass: 75,
                friction: 2,
                restitution: 0,
            });
            mesh.position = new BABYLON.Vector3(...position);
            const camera = new BABYLON.TargetCamera("camera", BABYLON.Vector3.Zero(), scene);
            camera.minZ = 0.3;
            camera.maxZ = 20000;
            camera.position = new BABYLON.Vector3(0, 0.75, 0);
            camera.parent = mesh;
            scene.activeCamera = camera;
            const box = BABYLON.MeshBuilder.CreateIcoSphere("box1", { radius: 0.003 }, scene);
            box.position = new BABYLON.Vector3(0, 0, 1);
            box.parent = camera;
            box.isPickable = false;
            const boxMaterial = new BABYLON.StandardMaterial("box1-material", scene);
            boxMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
            boxMaterial.disableLighting = true;
            box.material = boxMaterial;
            renderLoop.add(() => {
                { // thumblook
                    const sensitivity = 0.02;
                    const { x, y } = thumbsticks.right.values;
                    looker.add(x * sensitivity, -y * sensitivity);
                }
                const { horizontalRadians, verticalRadians } = looker.mouseLook;
                mesh.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(horizontalRadians, 0, 0);
                camera.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(0, verticalRadians, 0);
            });
            {
                mesh.physicsImpostor.physicsBody.setAngularFactor(0);
                function isPressed(key) {
                    return keyListener.getKeyState(key).isDown;
                }
                // const topSpeed = 2
                const power = 10;
                mesh.physicsImpostor.registerBeforePhysicsStep(impostor => {
                    impostor.wakeUp();
                    const willpower = isPressed("shift")
                        ? power * 2.5
                        : power;
                    let stride = 0;
                    let strafe = 0;
                    if (isPressed("w"))
                        stride += 1;
                    if (isPressed("s"))
                        stride -= 1;
                    if (isPressed("a"))
                        strafe -= 1;
                    if (isPressed("d"))
                        strafe += 1;
                    stride += thumbsticks.left.values.y;
                    strafe += thumbsticks.left.values.x;
                    const intention = rotate(...normalize([strafe, stride]), -looker.mouseLook.horizontalRadians);
                    const force = multiplyBy(intention, willpower);
                    const velocity3d = impostor.getLinearVelocity();
                    // const velocity: V2 = [velocity3d.x, velocity3d.z]
                    // const difference = v2.dot(forceDirection, velocity)
                    // const distance = v2.distance(forceDirection, velocity)
                    // const tanny = v2.atan2(intention, velocity)
                    const [x, z] = force;
                    impostor.setLinearVelocity(new BABYLON.Vector3(x, velocity3d.y, z));
                });
            }
            return {
                getCameraPosition() {
                    return [
                        camera.globalPosition.x,
                        camera.globalPosition.y,
                        camera.globalPosition.z,
                    ];
                },
            };
        };
    }

    async function loadGlb(scene, link) {
        const subpath = null;
        console.log(`📩 load ${link}`);
        const assetContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync(link, subpath, scene, function onProgress({ loaded, total, lengthComputable, }) {
            if (lengthComputable) {
                const percent = (loaded / total) * 100;
                if (percent >= 0 && percent <= 100) {
                    const progress = percent == 100
                        ? "99"
                        : percent.toFixed(0).padStart(2, "0");
                    console.log(`⏳  ${progress}% ${link}`);
                }
            }
        });
        console.log(`🎉 done ${link}`);
        return assetContainer;
    }

    function spawnCharacter({ scene }) {
        return async function () {
            const assets = await loadGlb(scene, "/assets/art/character/android14.glb");
            assets.removeAllFromScene();
            assets.addAllToScene();
            let index = 0;
            const animationGroups = scene.animationGroups;
            setInterval(() => {
                scene.stopAllAnimations();
                const animationGroup = animationGroups[index];
                animationGroup.start(true);
                index += 1;
                if (index >= animationGroups.length)
                    index = 0;
            }, 2 * 1000);
        };
    }

    function spawnDunebuggy({ quality, scene }) {
        return async function (position) {
            const assets = await loadGlb(scene, `/assets/art/dunebuggy/dunebuggy.${quality}.glb`);
            assets.removeAllFromScene();
            assets.addAllToScene();
            // mesh.position = new BABYLON.Vector3(...position)
        };
    }

    async function loadMaterial({ scene, path, label, }) {
        const material = new BABYLON.NodeMaterial(label, scene, { emitComments: false });
        material.setToDefault();
        await material.loadAsync(path)
            .then(() => material.build(false));
        return {
            material,
            assignTextures(textures) {
                const blocks = material.getTextureBlocks();
                for (const [blockName, texturePath] of Object.entries(textures)) {
                    const block = blocks.find(b => b.name === blockName);
                    if (!block)
                        console.error(`cannot find texture block "${blockName}" for node material "${material.name}"`);
                    block.texture = new BABYLON.Texture(texturePath, scene, {
                        invertY: false,
                    });
                }
                return material;
            }
        };
    }

    function spawnEnvironment({ quality, scene, renderLoop }) {
        return async function ({ getCameraPosition }) {
            const assets = await loadGlb(scene, `/assets/art/desert/terrain/terrain.${quality}.glb`);
            const { meshes, deleteMeshes } = prepareAssets(assets);
            hideMeshes(selectLod(2, [...meshes]));
            if (quality === "q0") {
                hideMeshes(selectLod(1, select([...meshes], "cliff", "rock")));
            }
            const unwantedOriginMeshCopies = except(selectOriginMeshes([...meshes]), "terrain");
            hideMeshes(unwantedOriginMeshCopies);
            const physicsForCliffsAndRocks = selectLod(1, select([...meshes], "cliff", "rock"))
                .filter(mesh => !unwantedOriginMeshCopies.includes(mesh));
            applyStaticPhysics(physicsForCliffsAndRocks);
            const statics = selectStatics([...meshes]);
            applyStaticPhysics(statics);
            hideMeshes(statics);
            const texturesHq = "/textures/lod0";
            const textures = quality === "q0"
                ? "/textures/lod0"
                : "/textures/lod1";
            const terrainMesh = [...meshes].find(m => m.name === "terrain");
            await Promise.all([
                applyTerrainShader({
                    scene,
                    texturesDirectory: textures,
                    meshes: [terrainMesh],
                }),
                applyRockslideShader({
                    scene,
                    texturesDirectory: textures,
                    meshes: [...meshes].filter(m => m.name.includes("rockslide")),
                }),
            ]);
            makeSkybox({
                scene,
                size: 5000,
                color: applySkyColor(scene, [0.5, 0.6, 1]),
                cubeTexturePath: `${texturesHq}/desert/sky/cloudy/bluecloud`,
                extensions: [
                    "_ft.jpg",
                    "_up.jpg",
                    "_rt.jpg",
                    "_bk.jpg",
                    "_dn.jpg",
                    "_lf.jpg",
                ],
            });
            const { sun } = makeSunlight({
                scene,
                renderLoop,
                lightPositionRelativeToCamera: [1000, 1000, -1000],
                getCameraPosition,
            });
            const shadowy = select([
                terrainMesh,
                ...selectLod(quality === "q0" ? 0 : 1, [...meshes]),
            ], "terrain", "cliff", "rock");
            applyShadows({
                quality,
                light: sun,
                casters: shadowy,
                receivers: shadowy.filter(m => !m.isAnInstance),
                bias: 0.0001,
                resolution: quality === "q0"
                    ? 4096
                    : 1024,
            });
        };
    }
    function prepareAssets(assets) {
        assets.removeAllFromScene();
        assets.addAllToScene();
        const meshes = new Set(assets.meshes);
        function deleteMeshes(toDelete) {
            for (const mesh of toDelete) {
                mesh.isVisible = false;
                mesh.dispose();
                meshes.delete(mesh);
            }
        }
        return { meshes, deleteMeshes };
    }
    function select(meshes, ...searches) {
        return meshes.filter(mesh => {
            for (const search of searches)
                if (mesh.name.includes(search))
                    return true;
            return false;
        });
    }
    function except(meshes, ...searches) {
        return meshes.filter(mesh => {
            for (const search of searches)
                if (mesh.name.includes(search))
                    return false;
            return true;
        });
    }
    function selectLod(lod, meshes) {
        return meshes.filter(mesh => mesh.name.endsWith(".lod" + lod));
    }
    function makeSunlight({ scene, renderLoop, lightPositionRelativeToCamera, getCameraPosition }) {
        const lightPosition = new BABYLON.Vector3(...lightPositionRelativeToCamera);
        const lightDirection = lightPosition.negate();
        const torus = BABYLON.Mesh.CreateTorus("torus", 100, 50, 10, scene);
        const sun = new BABYLON.DirectionalLight("sun", lightDirection, scene);
        sun.position = lightPosition;
        torus.position = lightPosition;
        sun.intensity = 2;
        renderLoop.add(() => {
            const cameraPosition = getCameraPosition();
            const position = new BABYLON.Vector3(...cameraPosition).add(lightPosition);
            sun.position = position;
            torus.position = position;
        });
        const antidirection = lightDirection.negate().addInPlace(new BABYLON.Vector3(0.3, 0.2, 0.1));
        const antilight = new BABYLON.HemisphericLight("antilight", antidirection, scene);
        antilight.intensity = 0.05;
        antilight.shadowEnabled = false;
        return { sun, antilight, torus };
    }
    function applySkyColor(scene, color) {
        const skycolor = new BABYLON.Color3(...color);
        scene.clearColor = new BABYLON.Color4(...color, 1);
        // scene.ambientColor = skycolor
        scene.fogColor = skycolor;
        scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        scene.fogDensity = 0.00007;
        return skycolor;
    }
    async function applyTerrainShader({ scene, texturesDirectory, meshes }) {
        const nodeMaterial = await loadMaterial({
            scene,
            label: "terrain-material",
            path: "/assets/art/desert/terrain/terrain.shader.json",
        }).then(m => m.assignTextures({
            blendmask: `${texturesDirectory}/desert/terrain/blendmask.jpg`,
            layer1_armd: `${texturesDirectory}/desert/terrain/layer1_armd.jpg`,
            layer1_color: `${texturesDirectory}/desert/terrain/layer1_color.jpg`,
            layer1_normal: `${texturesDirectory}/desert/terrain/layer1_normal.jpg`,
            layer2_armd: `${texturesDirectory}/desert/terrain/layer2_armd.jpg`,
            layer2_color: `${texturesDirectory}/desert/terrain/layer2_color.jpg`,
            layer2_normal: `${texturesDirectory}/desert/terrain/layer2_normal.jpg`,
            layer3_armd: `${texturesDirectory}/desert/terrain/layer3_armd.jpg`,
            layer3_color: `${texturesDirectory}/desert/terrain/layer3_color.jpg`,
            layer3_normal: `${texturesDirectory}/desert/terrain/layer3_normal.jpg`,
        }));
        for (const mesh of meshes)
            mesh.material = nodeMaterial;
    }
    async function applyRockslideShader({ scene, texturesDirectory, meshes }) {
        const nodeMaterial = await loadMaterial({
            scene,
            label: "rockslide-material",
            path: "/assets/art/desert/terrain/rockslide.shader.json",
        }).then(m => m.assignTextures({
            nor: `${texturesDirectory}/desert/rockslides/rockslide_nor.jpg`,
            color: `${texturesDirectory}/desert/rockslides/rockslide_col.jpg`,
            roughness: `${texturesDirectory}/desert/rockslides/rockslide_rgh.jpg`,
            ao: `${texturesDirectory}/desert/rockslides/rockslide_ao.jpg`,
        }));
        const rockslideMeshes = meshes.filter(m => m.name.includes("rockslide"));
        for (const mesh of rockslideMeshes) {
            if (!mesh.isAnInstance)
                mesh.material = nodeMaterial;
        }
    }
    function selectStatics(meshes) {
        return meshes.filter(mesh => {
            const name = mesh.name.toLowerCase();
            return (name.includes("static_") ||
                name.includes(".static"));
        });
    }
    function applyStaticPhysics(meshes) {
        for (const mesh of meshes) {
            mesh.setParent(null);
            mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0, friction: 1, restitution: 0.1 });
        }
    }
    function selectOriginMeshes(meshes) {
        return meshes.filter(mesh => {
            const { x, y, z } = mesh.getAbsolutePosition();
            return (x === 0 &&
                y === 0 &&
                z === 0);
        });
    }
    function hideMeshes(meshes) {
        for (const mesh of meshes)
            mesh.isVisible = false;
    }
    function makeSkybox({ cubeTexturePath, extensions, scene, size, color }) {
        const box = BABYLON.MeshBuilder.CreateBox("skybox", { size }, scene);
        const material = new BABYLON.StandardMaterial("skybox", scene);
        material.backFaceCulling = false;
        material.reflectionTexture = new BABYLON.CubeTexture(cubeTexturePath, scene, extensions);
        material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        material.diffuseColor = color;
        material.specularColor = color;
        box.material = material;
        box.infiniteDistance = true;
        material.disableLighting = true;
        box.applyFog = false;
    }
    function applyShadows({ quality, light, casters, receivers, resolution, bias }) {
        light.shadowMinZ = 500;
        light.shadowMaxZ = 2000;
        const shadows = new BABYLON.ShadowGenerator(resolution, light);
        shadows.bias = bias;
        shadows.forceBackFacesOnly = true;
        shadows.useCloseExponentialShadowMap = true;
        shadows.useBlurCloseExponentialShadowMap = true;
        shadows.usePercentageCloserFiltering = true;
        shadows.blurScale = 2;
        shadows.filteringQuality = quality === "q0"
            ? BABYLON.ShadowGenerator.QUALITY_HIGH
            : BABYLON.ShadowGenerator.QUALITY_LOW;
        for (const mesh of casters)
            shadows.addShadowCaster(mesh);
        for (const mesh of receivers)
            mesh.receiveShadows = true;
    }

    async function makeGame({ quality, thumbsticks, middle = [0, 0, 0], }) {
        console.log("💅", quality);
        const canvas = document.createElement("canvas");
        const engine = new BABYLON.Engine(canvas);
        const scene = new BABYLON.Scene(engine);
        await Ammo();
        const gravity = new BABYLON.Vector3(0, -9.81, 0);
        const physics = new BABYLON.AmmoJSPlugin(false);
        scene.enablePhysics(gravity, physics);
        BABYLON.SceneLoader.ShowLoadingScreen = false;
        engine.loadingScreen = null;
        const renderLoop = new Set();
        engine.runRenderLoop(() => {
            for (const fun of renderLoop)
                fun();
            scene.render();
        });
        canvas.onclick = (event) => {
            const notTouch = event.pointerType !== undefined
                ? event.pointerType !== "touch"
                : true;
            if (notTouch && !document.pointerLockElement)
                canvas.requestPointerLock();
        };
        const options = {
            scene,
            engine,
            canvas,
            middle,
            quality,
            renderLoop,
            thumbsticks,
            looker: makeMouseLooker(),
            keyListener: makeKeyListener(),
        };
        return {
            scene,
            engine,
            ...options,
            resize: () => engine.resize(),
            get framerate() { return engine.getFps(); },
            spawn: {
                camera: spawnCamera(options),
                crate: spawnCrate(options),
                player: spawnPlayer(options),
                character: spawnCharacter(options),
                environment: spawnEnvironment(options),
                dunebuggy: spawnDunebuggy(options),
            }
        };
    }

    function makeFramerateDisplay({ getFramerate }) {
        const element = document.createElement("p");
        element.className = "framerate";
        element.textContent = "-";
        setInterval(() => element.textContent = getFramerate().toFixed(0), 100);
        return element;
    }

    /**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
    const t$1=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,e$2=Symbol(),n$3=new Map;class s$3{constructor(t,n){if(this._$cssResult$=!0,n!==e$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t;}get styleSheet(){let e=n$3.get(this.cssText);return t$1&&void 0===e&&(n$3.set(this.cssText,e=new CSSStyleSheet),e.replaceSync(this.cssText)),e}toString(){return this.cssText}}const o$3=t=>new s$3("string"==typeof t?t:t+"",e$2),r$2=(t,...n)=>{const o=1===t.length?t[0]:n.reduce(((e,n,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+t[s+1]),t[0]);return new s$3(o,e$2)},i$1=(e,n)=>{t$1?e.adoptedStyleSheets=n.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):n.forEach((t=>{const n=document.createElement("style"),s=window.litNonce;void 0!==s&&n.setAttribute("nonce",s),n.textContent=t.cssText,e.appendChild(n);}));},S$1=t$1?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const n of t.cssRules)e+=n.cssText;return o$3(e)})(t):t;

    /**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */var s$2;const e$1=window.trustedTypes,r$1=e$1?e$1.emptyScript:"",h$1=window.reactiveElementPolyfillSupport,o$2={toAttribute(t,i){switch(i){case Boolean:t=t?r$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,i){let s=t;switch(i){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t);}catch(t){s=null;}}return s}},n$2=(t,i)=>i!==t&&(i==i||t==t),l$2={attribute:!0,type:String,converter:o$2,reflect:!1,hasChanged:n$2};class a$1 extends HTMLElement{constructor(){super(),this._$Et=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Ei=null,this.o();}static addInitializer(t){var i;null!==(i=this.l)&&void 0!==i||(this.l=[]),this.l.push(t);}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,s)=>{const e=this._$Eh(s,i);void 0!==e&&(this._$Eu.set(e,s),t.push(e));})),t}static createProperty(t,i=l$2){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const s="symbol"==typeof t?Symbol():"__"+t,e=this.getPropertyDescriptor(t,s,i);void 0!==e&&Object.defineProperty(this.prototype,t,e);}}static getPropertyDescriptor(t,i,s){return {get(){return this[i]},set(e){const r=this[t];this[i]=e,this.requestUpdate(t,r,s);},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||l$2}static finalize(){if(this.hasOwnProperty("finalized"))return !1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this._$Eu=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s]);}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(i){const s=[];if(Array.isArray(i)){const e=new Set(i.flat(1/0).reverse());for(const i of e)s.unshift(S$1(i));}else void 0!==i&&s.push(S$1(i));return s}static _$Eh(t,i){const s=i.attribute;return !1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}o(){var t;this._$Ep=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Em(),this.requestUpdate(),null===(t=this.constructor.l)||void 0===t||t.forEach((t=>t(this)));}addController(t){var i,s;(null!==(i=this._$Eg)&&void 0!==i?i:this._$Eg=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(s=t.hostConnected)||void 0===s||s.call(t));}removeController(t){var i;null===(i=this._$Eg)||void 0===i||i.splice(this._$Eg.indexOf(t)>>>0,1);}_$Em(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this._$Et.set(i,this[i]),delete this[i]);}));}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return i$1(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$Eg)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)}));}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$Eg)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)}));}attributeChangedCallback(t,i,s){this._$AK(t,s);}_$ES(t,i,s=l$2){var e,r;const h=this.constructor._$Eh(t,s);if(void 0!==h&&!0===s.reflect){const n=(null!==(r=null===(e=s.converter)||void 0===e?void 0:e.toAttribute)&&void 0!==r?r:o$2.toAttribute)(i,s.type);this._$Ei=t,null==n?this.removeAttribute(h):this.setAttribute(h,n),this._$Ei=null;}}_$AK(t,i){var s,e,r;const h=this.constructor,n=h._$Eu.get(t);if(void 0!==n&&this._$Ei!==n){const t=h.getPropertyOptions(n),l=t.converter,a=null!==(r=null!==(e=null===(s=l)||void 0===s?void 0:s.fromAttribute)&&void 0!==e?e:"function"==typeof l?l:null)&&void 0!==r?r:o$2.fromAttribute;this._$Ei=n,this[n]=a(i,t.type),this._$Ei=null;}}requestUpdate(t,i,s){let e=!0;void 0!==t&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||n$2)(this[t],i)?(this._$AL.has(t)||this._$AL.set(t,i),!0===s.reflect&&this._$Ei!==t&&(void 0===this._$E_&&(this._$E_=new Map),this._$E_.set(t,s))):e=!1),!this.isUpdatePending&&e&&(this._$Ep=this._$EC());}async _$EC(){this.isUpdatePending=!0;try{await this._$Ep;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Et&&(this._$Et.forEach(((t,i)=>this[i]=t)),this._$Et=void 0);let i=!1;const s=this._$AL;try{i=this.shouldUpdate(s),i?(this.willUpdate(s),null===(t=this._$Eg)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(s)):this._$EU();}catch(t){throw i=!1,this._$EU(),t}i&&this._$AE(s);}willUpdate(t){}_$AE(t){var i;null===(i=this._$Eg)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t);}_$EU(){this._$AL=new Map,this.isUpdatePending=!1;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$Ep}shouldUpdate(t){return !0}update(t){void 0!==this._$E_&&(this._$E_.forEach(((t,i)=>this._$ES(i,this[i],t))),this._$E_=void 0),this._$EU();}updated(t){}firstUpdated(t){}}a$1.finalized=!0,a$1.elementProperties=new Map,a$1.elementStyles=[],a$1.shadowRootOptions={mode:"open"},null==h$1||h$1({ReactiveElement:a$1}),(null!==(s$2=globalThis.reactiveElementVersions)&&void 0!==s$2?s$2:globalThis.reactiveElementVersions=[]).push("1.1.0");

    /**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
    var t;const i=globalThis.trustedTypes,s$1=i?i.createPolicy("lit-html",{createHTML:t=>t}):void 0,e=`lit$${(Math.random()+"").slice(9)}$`,o$1="?"+e,n$1=`<${o$1}>`,l$1=document,h=(t="")=>l$1.createComment(t),r=t=>null===t||"object"!=typeof t&&"function"!=typeof t,d=Array.isArray,u=t=>{var i;return d(t)||"function"==typeof(null===(i=t)||void 0===i?void 0:i[Symbol.iterator])},c=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,v=/-->/g,a=/>/g,f=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,_=/'/g,m=/"/g,g=/^(?:script|style|textarea)$/i,p=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),$=p(1),b=Symbol.for("lit-noChange"),w=Symbol.for("lit-nothing"),T=new WeakMap,x=(t,i,s)=>{var e,o;const n=null!==(e=null==s?void 0:s.renderBefore)&&void 0!==e?e:i;let l=n._$litPart$;if(void 0===l){const t=null!==(o=null==s?void 0:s.renderBefore)&&void 0!==o?o:null;n._$litPart$=l=new N(i.insertBefore(h(),t),t,void 0,null!=s?s:{});}return l._$AI(t),l},A=l$1.createTreeWalker(l$1,129,null,!1),C=(t,i)=>{const o=t.length-1,l=[];let h,r=2===i?"<svg>":"",d=c;for(let i=0;i<o;i++){const s=t[i];let o,u,p=-1,$=0;for(;$<s.length&&(d.lastIndex=$,u=d.exec(s),null!==u);)$=d.lastIndex,d===c?"!--"===u[1]?d=v:void 0!==u[1]?d=a:void 0!==u[2]?(g.test(u[2])&&(h=RegExp("</"+u[2],"g")),d=f):void 0!==u[3]&&(d=f):d===f?">"===u[0]?(d=null!=h?h:c,p=-1):void 0===u[1]?p=-2:(p=d.lastIndex-u[2].length,o=u[1],d=void 0===u[3]?f:'"'===u[3]?m:_):d===m||d===_?d=f:d===v||d===a?d=c:(d=f,h=void 0);const y=d===f&&t[i+1].startsWith("/>")?" ":"";r+=d===c?s+n$1:p>=0?(l.push(o),s.slice(0,p)+"$lit$"+s.slice(p)+e+y):s+e+(-2===p?(l.push(void 0),i):y);}const u=r+(t[o]||"<?>")+(2===i?"</svg>":"");if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return [void 0!==s$1?s$1.createHTML(u):u,l]};class E{constructor({strings:t,_$litType$:s},n){let l;this.parts=[];let r=0,d=0;const u=t.length-1,c=this.parts,[v,a]=C(t,s);if(this.el=E.createElement(v,n),A.currentNode=this.el.content,2===s){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(l=A.nextNode())&&c.length<u;){if(1===l.nodeType){if(l.hasAttributes()){const t=[];for(const i of l.getAttributeNames())if(i.endsWith("$lit$")||i.startsWith(e)){const s=a[d++];if(t.push(i),void 0!==s){const t=l.getAttribute(s.toLowerCase()+"$lit$").split(e),i=/([.?@])?(.*)/.exec(s);c.push({type:1,index:r,name:i[2],strings:t,ctor:"."===i[1]?M:"?"===i[1]?H:"@"===i[1]?I:S});}else c.push({type:6,index:r});}for(const i of t)l.removeAttribute(i);}if(g.test(l.tagName)){const t=l.textContent.split(e),s=t.length-1;if(s>0){l.textContent=i?i.emptyScript:"";for(let i=0;i<s;i++)l.append(t[i],h()),A.nextNode(),c.push({type:2,index:++r});l.append(t[s],h());}}}else if(8===l.nodeType)if(l.data===o$1)c.push({type:2,index:r});else {let t=-1;for(;-1!==(t=l.data.indexOf(e,t+1));)c.push({type:7,index:r}),t+=e.length-1;}r++;}}static createElement(t,i){const s=l$1.createElement("template");return s.innerHTML=t,s}}function P(t,i,s=t,e){var o,n,l,h;if(i===b)return i;let d=void 0!==e?null===(o=s._$Cl)||void 0===o?void 0:o[e]:s._$Cu;const u=r(i)?void 0:i._$litDirective$;return (null==d?void 0:d.constructor)!==u&&(null===(n=null==d?void 0:d._$AO)||void 0===n||n.call(d,!1),void 0===u?d=void 0:(d=new u(t),d._$AT(t,s,e)),void 0!==e?(null!==(l=(h=s)._$Cl)&&void 0!==l?l:h._$Cl=[])[e]=d:s._$Cu=d),void 0!==d&&(i=P(t,d._$AS(t,i.values),d,e)),i}class V{constructor(t,i){this.v=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}p(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:l$1).importNode(s,!0);A.currentNode=o;let n=A.nextNode(),h=0,r=0,d=e[0];for(;void 0!==d;){if(h===d.index){let i;2===d.type?i=new N(n,n.nextSibling,this,t):1===d.type?i=new d.ctor(n,d.name,d.strings,this,t):6===d.type&&(i=new L(n,this,t)),this.v.push(i),d=e[++r];}h!==(null==d?void 0:d.index)&&(n=A.nextNode(),h++);}return o}m(t){let i=0;for(const s of this.v)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class N{constructor(t,i,s,e){var o;this.type=2,this._$AH=w,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cg=null===(o=null==e?void 0:e.isConnected)||void 0===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==i?i:this._$Cg}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=P(this,t,i),r(t)?t===w||null==t||""===t?(this._$AH!==w&&this._$AR(),this._$AH=w):t!==this._$AH&&t!==b&&this.$(t):void 0!==t._$litType$?this.T(t):void 0!==t.nodeType?this.S(t):u(t)?this.A(t):this.$(t);}M(t,i=this._$AB){return this._$AA.parentNode.insertBefore(t,i)}S(t){this._$AH!==t&&(this._$AR(),this._$AH=this.M(t));}$(t){this._$AH!==w&&r(this._$AH)?this._$AA.nextSibling.data=t:this.S(l$1.createTextNode(t)),this._$AH=t;}T(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(void 0===e.el&&(e.el=E.createElement(e.h,this.options)),e);if((null===(i=this._$AH)||void 0===i?void 0:i._$AD)===o)this._$AH.m(s);else {const t=new V(o,this),i=t.p(this.options);t.m(s),this.S(i),this._$AH=t;}}_$AC(t){let i=T.get(t.strings);return void 0===i&&T.set(t.strings,i=new E(t)),i}A(t){d(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new N(this.M(h()),this.M(h()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;void 0===this._$AM&&(this._$Cg=t,null===(i=this._$AP)||void 0===i||i.call(this,t));}}class S{constructor(t,i,s,e,o){this.type=1,this._$AH=w,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=w;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=!1;if(void 0===o)t=P(this,t,i,0),n=!r(t)||t!==this._$AH&&t!==b,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=P(this,e[s+l],i,l),h===b&&(h=this._$AH[l]),n||(n=!r(h)||h!==this._$AH[l]),h===w?t=w:t!==w&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.k(t);}k(t){t===w?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}}class M extends S{constructor(){super(...arguments),this.type=3;}k(t){this.element[this.name]=t===w?void 0:t;}}const k=i?i.emptyScript:"";class H extends S{constructor(){super(...arguments),this.type=4;}k(t){t&&t!==w?this.element.setAttribute(this.name,k):this.element.removeAttribute(this.name);}}class I extends S{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=P(this,t,i,0))&&void 0!==s?s:w)===b)return;const e=this._$AH,o=t===w&&e!==w||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==w&&(e===w||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t);}}class L{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){P(this,t);}}const z=window.litHtmlPolyfillSupport;null==z||z(E,N),(null!==(t=globalThis.litHtmlVersions)&&void 0!==t?t:globalThis.litHtmlVersions=[]).push("2.1.0");

    /**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */var l,o;class s extends a$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Dt=void 0;}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Dt=x(i,this.renderRoot,this.renderOptions);}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Dt)||void 0===t||t.setConnected(!0);}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Dt)||void 0===t||t.setConnected(!1);}render(){return b}}s.finalized=!0,s._$litElement$=!0,null===(l=globalThis.litElementHydrateSupport)||void 0===l||l.call(globalThis,{LitElement:s});const n=globalThis.litElementPolyfillSupport;null==n||n({LitElement:s});(null!==(o=globalThis.litElementVersions)&&void 0!==o?o:globalThis.litElementVersions=[]).push("3.1.0");

    var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
        if (kind === "m") throw new TypeError("Private method is not writable");
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    };
    var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    };
    var _ThumbStick_basis, _ThumbStick_updateBasis;
    class ThumbStick extends s {
        constructor() {
            super(...arguments);
            this.values = { x: 0, y: 0 };
            this.onstickmove = (values) => { };
            _ThumbStick_basis.set(this, void 0);
            _ThumbStick_updateBasis.set(this, () => {
                const base = this.shadowRoot.querySelector(".base");
                const stick = this.shadowRoot.querySelector(".stick");
                const rect = base.getBoundingClientRect();
                const radius = (rect.width / 2) - (stick.getBoundingClientRect().width / 4);
                __classPrivateFieldSet(this, _ThumbStick_basis, { rect, radius }, "f");
            });
        }
        firstUpdated() {
            const base = this.shadowRoot.querySelector(".base");
            const stick = this.shadowRoot.querySelector(".stick");
            const understick = this.shadowRoot.querySelector(".understick");
            __classPrivateFieldGet(this, _ThumbStick_updateBasis, "f").call(this);
            const withinRadius = (x, y) => {
                return (x ** 2) + (y ** 2) < (__classPrivateFieldGet(this, _ThumbStick_basis, "f").radius ** 2);
            };
            const findClosestPointOnCircle = (x, y) => {
                const mag = Math.sqrt((x ** 2) + (y ** 2));
                return [
                    x / mag * __classPrivateFieldGet(this, _ThumbStick_basis, "f").radius,
                    y / mag * __classPrivateFieldGet(this, _ThumbStick_basis, "f").radius,
                ];
            };
            const registerFinalValues = (x, y) => {
                const values = {
                    x: x / __classPrivateFieldGet(this, _ThumbStick_basis, "f").radius,
                    y: -(y / __classPrivateFieldGet(this, _ThumbStick_basis, "f").radius),
                };
                this.values = values;
                this.onstickmove(values);
                stick.style.transform = `translate(${x}px, ${y}px)`;
                const underX = x * 0.5;
                const underY = y * 0.5;
                understick.style.transform = `translate(${underX}px, ${underY}px)`;
            };
            const moveStick = (clientX, clientY) => {
                const { left, top, height, width } = __classPrivateFieldGet(this, _ThumbStick_basis, "f").rect;
                const middleX = left + (width / 2);
                const middleY = top + (height / 2);
                let x = clientX - middleX;
                let y = clientY - middleY;
                if (!withinRadius(x, y)) {
                    [x, y] = findClosestPointOnCircle(x, y);
                }
                registerFinalValues(x, y);
            };
            const resetStick = () => {
                registerFinalValues(0, 0);
            };
            let trackingMouse = false;
            let trackingTouchId;
            base.addEventListener("mousedown", ({ clientX, clientY }) => {
                trackingMouse = true;
                moveStick(clientX, clientY);
            });
            window.addEventListener("mouseup", () => {
                trackingMouse = false;
                resetStick();
            });
            window.addEventListener("mousemove", ({ clientX, clientY }) => {
                if (trackingMouse)
                    moveStick(clientX, clientY);
            });
            base.addEventListener("touchstart", (event) => {
                const touch = event.targetTouches[0];
                trackingTouchId = touch.identifier;
                const { clientX, clientY } = touch;
                moveStick(clientX, clientY);
                event.preventDefault();
            });
            base.addEventListener("touchmove", (event) => {
                const touch = event.touches.item(trackingTouchId);
                if (touch) {
                    const { clientX, clientY } = touch;
                    moveStick(clientX, clientY);
                }
                event.preventDefault();
            });
            base.addEventListener("touchend", () => {
                trackingTouchId = undefined;
                resetStick();
            });
            window.addEventListener("resize", () => {
                __classPrivateFieldGet(this, _ThumbStick_updateBasis, "f").call(this);
            });
            window.addEventListener("scroll", () => {
                __classPrivateFieldGet(this, _ThumbStick_updateBasis, "f").call(this);
            });
        }
        render() {
            return $ `
			<div class=base>
				<div class=stick></div>
				<div class=understick></div>
			</div>
		`;
        }
    }
    _ThumbStick_basis = new WeakMap(), _ThumbStick_updateBasis = new WeakMap();
    ThumbStick.styles = r$2 `
	:host {
		display: block;
		width: 20em;
		height: 20em;
	}
	.base {
		position: relative;
		width: 100%;
		height: 100%;
		background: var(--thumb-stick-background, #000);
		border-radius: 100%;
	}
	.stick, .understick {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: var(--thumb-stick-size, 66%);
		height: var(--thumb-stick-size, 66%);
		border-radius: 999em;
		background: var(--thumb-stick-color, #fff);
		margin: auto;
		pointer-events: none;
	}
	.understick {
		opacity: 0.5;
	}
	`;

    function arrayize(item) {
        return [item].flat();
    }
    const notUndefined = (x) => x !== undefined;
    function combineStyles(parentStyles, newStyles) {
        const styles = [
            ...(arrayize(parentStyles) ?? []),
            ...arrayize(newStyles),
        ];
        return styles
            .flat()
            .filter(notUndefined);
    }
    function mixinStyles(...newStyles) {
        return function (Base) {
            var _a;
            return _a = class extends Base {
                },
                _a.styles = combineStyles(Base.styles, newStyles),
                _a;
        };
    }

    function objectMap(input, mapper) {
        const output = {};
        for (const [key, value] of Object.entries(input))
            output[key] = mapper(value, key);
        return output;
    }

    const themeComponents = (theme, components) => {
        return objectMap(components, Component => mixinStyles(theme)(Component));
    };

    /**
     * Convert a camel-case name into a dashed name
     * - for example
     *       dashify("BigManStyle")
     *       //> "big-man-style"
     */
    function dashify(camel) {
        return camel.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
    }

    function registerComponents(components) {
        for (const [name, component] of Object.entries(components))
            customElements.define(dashify(name), component);
    }

    const theme = r$2 `
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}
`;
    registerComponents(themeComponents(theme, { ThumbStick }));

    function add(...vectors) {
        let x = 0;
        let y = 0;
        let z = 0;
        for (const [vx, vy, vz] of vectors) {
            x += vx;
            y += vy;
            z += vz;
        }
        return [x, y, z];
    }

    function getGameQualityMode() {
        return localStorage.getItem("benevolent-high-quality") === "true"
            ? "q0"
            : "q1";
    }
    function startLoading({ quality }) {
        const loadingSpan = document.querySelector(".loading span");
        if (quality === "q0")
            loadingSpan.textContent += " high quality";
        return {
            finishLoading() {
                const loading = document.querySelector(".loading");
                loading.style.display = "none";
            }
        };
    }
    function wirePointerLockAttribute(element, attributeName) {
        document.addEventListener("pointerlockchange", () => {
            const isPointerLocked = !!document.pointerLockElement;
            element.setAttribute(attributeName, isPointerLocked
                ? "true"
                : "false");
        });
    }
    function setupFullscreenToggling(attribute, fullscreenButton) {
        if (document.fullscreenEnabled) {
            document.addEventListener("fullscreenchange", () => {
                const isFullscreen = !!document.fullscreenElement;
                fullscreenButton.setAttribute(attribute, isFullscreen ? "true" : "false");
            });
            fullscreenButton.onclick = () => {
                const isFullscreen = !!document.fullscreenElement;
                if (isFullscreen)
                    document.exitFullscreen();
                else
                    document.body.requestFullscreen();
            };
        }
        else {
            fullscreenButton.remove();
        }
    }
    async function setupHumanoidDemo({ middle, game }) {
        let { getCameraPosition } = await game.spawn.camera();
        await Promise.all([
            game.spawn.environment({ getCameraPosition: () => getCameraPosition() }),
            game.spawn.character(),
        ]);
        const player = await game.spawn.player(add(middle, [10, 5, 0]));
        await game.spawn.crate([10, 5, 10]);
        await game.spawn.dunebuggy([0, 0, 0]);
        getCameraPosition = player.getCameraPosition;
    }
    function enableDebugMeshPicking({ game }) {
        game.keyListener.on("e", state => {
            if (state.isDown) {
                const { pickedMesh } = game.scene.pick(game.canvas.width / 2, game.canvas.height / 2);
                window.pick = pickedMesh;
                console.log(pickedMesh.name, pickedMesh);
            }
        });
    }

    console.log("👼 benevolent.games", { BABYLON, Ammo });
    void async function main() {
        const quality = getGameQualityMode();
        const { finishLoading } = startLoading({ quality });
        wirePointerLockAttribute(document.body, "data-pointer-lock");
        setupFullscreenToggling("data-fullscreen", document.querySelector(".buttonbar .fullscreen"));
        const middle = [0, 0, 0];
        const game = await makeGame({
            quality,
            middle,
            thumbsticks: {
                left: document.querySelector("thumb-stick.left"),
                right: document.querySelector("thumb-stick.right"),
            },
        });
        document.querySelector(".game body").prepend(game.canvas);
        window.addEventListener("resize", game.resize);
        game.resize();
        window.scene = game.scene;
        window.engine = game.engine;
        await setupHumanoidDemo({ middle, game });
        enableDebugMeshPicking({ game });
        document.querySelector(".stats").appendChild(makeFramerateDisplay({
            getFramerate: () => game.framerate,
        }));
        finishLoading();
    }();

})();
//# sourceMappingURL=main.bundle.js.map
