class PrefilterMaker {
    constructor(sourceTexture, near, far, cubeResolution, roughness, options) {
        //
        this.roughness = (roughness !== undefined) ? roughness : 0.0;
        this.cubes = [];
        this.sourceTexture = sourceTexture;
        this.resolution = (cubeResolution !== undefined) ? cubeResolution : 256; // NODE: 256 is currently hard coded in the glsl code for performance reasons

        var monotonicEncoding = (this.sourceTexture.encoding === THREE.LinearEncoding) ||
            (this.sourceTexture.encoding === THREE.GammaEncoding) || (this.sourceTexture.encoding === THREE.sRGBEncoding);

        this.sourceTexture.minFilter = (monotonicEncoding) ? THREE.LinearFilter : THREE.NearestFilter;
        this.sourceTexture.magFilter = (monotonicEncoding) ? THREE.LinearFilter : THREE.NearestFilter;
        this.sourceTexture.generateMipmaps = true;
        //
        this.scene = new THREE.Scene();
        var fov = 90, aspect = 1;
        this.cameras = [];
        //
        var that=this;
        that.uniform = {
            'envMap': { value: null },
            'roughness': { value: that.roughness }
        };
        this.shader = this.makeIrradianceMap(sourceTexture);
        var BoxMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(2, 2, 2), this.shader);
        BoxMesh.material.side = THREE.BackSide;
        this.scene.add(BoxMesh);
       

        var cameraPX = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraPX.up.set(0, - 1, 0);
        cameraPX.lookAt(new THREE.Vector3(-1, 0, 0));
        this.scene.add(cameraPX);
        this.cameras.push(cameraPX)
        var cameraNX = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraNX.up.set(0, - 1, 0);
        cameraNX.lookAt(new THREE.Vector3( 1, 0, 0));
        this.scene.add(cameraNX);
        this.cameras.push(cameraNX)

        var cameraPY = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraPY.up.set(0, 0, 1);
        cameraPY.lookAt(new THREE.Vector3(0, 1, 0));
        this.scene.add(cameraPY);
        this.cameras.push(cameraPY)

        var cameraNY = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraNY.up.set(0, 0, - 1);
        cameraNY.lookAt(new THREE.Vector3(0, - 1, 0));
        this.scene.add(cameraNY);
        this.cameras.push(cameraNY)

        var cameraPZ = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraPZ.up.set(0, - 1, 0);
        cameraPZ.lookAt(new THREE.Vector3(0, 0, 1));
        this.scene.add(cameraPZ);
        this.cameras.push(cameraPZ)

        var cameraNZ = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraNZ.up.set(0, - 1, 0);
        cameraNZ.lookAt(new THREE.Vector3(0, 0, - 1));
        this.scene.add(cameraNZ);
        this.cameras.push(cameraNZ)
 
        //
        var params = {
            format: this.sourceTexture.format,
            magFilter: this.sourceTexture.magFilter,
            minFilter: this.sourceTexture.minFilter,
            type: this.sourceTexture.type,
            generateMipmaps: this.sourceTexture.generateMipmaps,
            anisotropy: this.sourceTexture.anisotropy,
            encoding: this.sourceTexture.encoding
        };
        if (params.encoding === THREE.RGBM16Encoding) {

            params.magFilter = THREE.LinearFilter;
            params.minFilter = THREE.LinearFilter;//THREE.LINEAR_MIPMAP_LINEAR

        }
        console.log(params)
        //var options = options || { format: THREE.RGBFormat, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter };
        var pow=1;
        for (let i = 0; i < 5; i++) {
            var renderTarget = new THREE.WebGLRenderTargetCube(cubeResolution, cubeResolution, params);
            renderTarget.width=renderTarget.height=128/pow;
            pow*=2;
            renderTarget.texture.name = "Cube" + i;
            renderTarget.texture.minFilter=THREE.LinearMipMapLinearFilter;
            renderTarget.texture.width=renderTarget.texture.height=128/pow;
            this.cubes.push(renderTarget)
        }
        
    }
    update(renderer) {
        var that = this;
        var gammaInput = renderer.gammaInput;
        var gammaOutput = renderer.gammaOutput;
        var toneMapping = renderer.toneMapping;
        var toneMappingExposure = renderer.toneMappingExposure;
        var currentRenderTarget = renderer.getRenderTarget();
        that.shader.uniforms['envMap'].value = that.sourceTexture;
        that.shader.envMap = that.sourceTexture;
        that.shader.needsUpdate = true;
        that.shader.needsUpdate = true;

        renderer.toneMapping = THREE.LinearToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.gammaInput = false;
        renderer.gammaOutput = false;
        //
        for (let i = 0; i < 1; i++) { 
            that.uniform['roughness'].value=that.roughness
            that.renderToCubeMapTarget(renderer, that.cubes[i]) 
            console.log(that.cubes[i])
        }
        // for(let i=0;i<5;i++)
        // {
        //     that.cubes[0].texture.mipmaps[i]=that.cubes[i].texture;
        // }
        //
        renderer.setRenderTarget(currentRenderTarget);
        renderer.toneMapping = toneMapping;
        renderer.toneMappingExposure = toneMappingExposure;
        renderer.gammaInput = gammaInput;
        renderer.gammaOutput = gammaOutput;
    }
    renderToCubeMapTarget(renderer, renderTarget) {// renderTarget, activeCubeFace, activeMipMapLevel
        var that = this;
        for (var i = 0; i < 6; i++) {

            that.renderToCubeMapTargetFace(renderer, renderTarget, i);

        }
    }
    renderToCubeMapTargetFace(renderer, renderTarget, faceIndex) {
        var that = this;
        renderer.setRenderTarget(renderTarget, faceIndex);
        renderer.clear();
        renderer.render(that.scene, that.cameras[faceIndex]);
    }
    makeIrradianceMap(hdrCubeMap) {
        var that = this;
        
        that.uniform['envMap'].value = hdrCubeMap;
        return new THREE.ShaderMaterial(
            {
                side: THREE.BackSide,
                depthTest: true,
                uniforms: that.uniform,
                vertexShader: "varying vec2 vUv;\n\
				varying vec3 vWorldPos;\n\
				void main() {\n\
					vUv = uv;\n\
					vWorldPos= position;\n\
					gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);\n\
					gl_Position.z = gl_Position.w;\n\
				}",
                fragmentShader: "varying vec2 vUv;\
				varying vec3 vWorldPos;\n\
				uniform vec3 begin;\
				uniform float roughness;\
				uniform samplerCube envMap;\
                const float PI=3.1415926;\
                float VanDerCorpus(int n, int base)\
                {\
                    float invBase = 1.0 / float(base);\
                    float denom   = 1.0;\
                    float result  = 0.0;\
                    for(int i = 0; i < 32; ++i)\
                    {\
                        if(n > 0)\
                        {\
                            denom   = mod(float(n), 2.0);\
                            result += denom * invBase;\
                            invBase = invBase / 2.0;\
                            n       = int(float(n) / 2.0);\
                        }\
                    }\
                    return result;\
                }\
                vec2 HammersleyNoBitOps(int i, int N)\
                {\
                    return vec2(float(i)/float(N), VanDerCorpus(i, 2));\
                }\
                float DistributionGGX(vec3 N, vec3 H, float roughness)\
                {\
                    float a = roughness*roughness;\
                    float a2 = a*a;\
                    float NdotH = max(dot(N, H), 0.0);\
                    float NdotH2 = NdotH*NdotH;\
                    float nom   = a2;\
                    float denom = (NdotH2 * (a2 - 1.0) + 1.0);\
                    denom = PI * denom * denom;\
                    return nom / denom;\
                }\
                vec3 ImportanceSampleGGX(vec2 Xi, vec3 N, float roughness)\
                {\
                    float a = roughness*roughness;\
                    float phi = 2.0 * PI * Xi.x;\
                    float cosTheta = sqrt((1.0 - Xi.y) / (1.0 + (a*a - 1.0) * Xi.y));\
                    float sinTheta = sqrt(1.0 - cosTheta*cosTheta);\
                    vec3 H;\
                    H.x = cos(phi) * sinTheta;\
                    H.y = sin(phi) * sinTheta;\
                    H.z = cosTheta;\
                    vec3 up          = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);\
                    vec3 tangent   = normalize(cross(up, N));\
                    vec3 bitangent = cross(N, tangent);\
                    vec3 sampleVec = tangent * H.x + bitangent * H.y + N * H.z;\
                    return normalize(sampleVec);\
                }\
                void main() {\
                    vec3 N=normalize(vWorldPos);\
                    vec3 R=N;\
                    vec3 V=R;\
                    const int SAMPLE_COUNT = 1024;\
                    vec3 prefilteredColor = vec3(0.0);\
                    float totalWeight = 0.0;\
                    for(int i = 0; i < 1024; ++i)\
                    {\
                        vec2 Xi = HammersleyNoBitOps(i, 1024);\
                        vec3 H = ImportanceSampleGGX(Xi, N, roughness);\
                        vec3 L  = normalize(2.0 * dot(V, H) * H - V);\
                        float NdotL = max(dot(N, L), 0.0);\
                        if(NdotL > 0.0)\
                        {\
                            float D = DistributionGGX(N, H, roughness);\
                            float NdotH = max(dot(N, H), 0.0);\
                            float HdotV = max(dot(H, V), 0.0);\
                            float pdf = D * NdotH / (4.0 * HdotV) + 0.0001; \
                            float resolution = 512.0;\
                            float saTexel  = 4.0 * PI / (6.0 * resolution * resolution);\
                            float saSample = 1.0 / 1024.0 * pdf + 0.0001;\
                            float mipLevel = roughness == 0.0 ? 0.0 : 0.5 * log2(saSample / saTexel);\
                            prefilteredColor += textureCubeLodEXT(envMap, L, mipLevel).rgb * NdotL;\
                            totalWeight+= NdotL;\
                        }\
                    }\
                    prefilteredColor = prefilteredColor / totalWeight;\
                    gl_FragColor=(vec4(prefilteredColor,1.0));\
                }",
            }
        )
    }
}

