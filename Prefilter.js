class Prefilter {
    constructor(url) {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderTarget = null;
        this.init(url)
    }
    init(url) {
        var that = this;
        var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
        var resx = Math.round(window.innerWidth / 2);
        var resy = Math.round(window.innerHeight / 2);
        that.renderTarget = new THREE.WebGLRenderTarget(resx, resy, pars);
        that.renderTarget.texture.generateMipmaps = false;
        //'textures/miranda_uncropped.hdr'
        new THREE.RGBELoader().load(url, function (texture, textureData) {
            texture.encoding = THREE.RGBEEncoding;
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;
            texture.flipY = true;
            var materials = []
            for (let i = 0; i < 8; i++) {
                materials.push(that.getShader(texture, 0.125 * i))
            }

            var quad = new THREE.PlaneBufferGeometry(textureData.width, textureData.height);

            var mesh0 = new THREE.Mesh(quad, materials[0]);
            mesh0.position.set(0, textureData.height * 7 / 2, 0)
            that.scene.add(mesh0);
            var mesh1 = new THREE.Mesh(quad, materials[1]);
            mesh1.position.set(0, textureData.height * 5 / 2, 0)
            that.scene.add(mesh1);
            var mesh2 = new THREE.Mesh(quad, materials[2]);
            mesh2.position.set(0, textureData.height * (3 / 2), 0)
            that.scene.add(mesh2);
            var mesh3 = new THREE.Mesh(quad, materials[3]);
            mesh3.position.set(0, textureData.height * (1 / 2), 0)
            that.scene.add(mesh3);
            var mesh4 = new THREE.Mesh(quad, materials[4]);
            mesh4.position.set(0, textureData.height * (-1) / 2, 0)
            that.scene.add(mesh4);
            var mesh5 = new THREE.Mesh(quad, materials[5]);
            mesh5.position.set(0, textureData.height * (-3) / 2, 0)
            that.scene.add(mesh5);
            var mesh6 = new THREE.Mesh(quad, materials[6]);
            mesh6.position.set(0, textureData.height * (-5 / 2), 0)
            that.scene.add(mesh6);
            var mesh7 = new THREE.Mesh(quad, materials[7]);
            mesh7.position.set(0, textureData.height * (-7 / 2), 0)
            that.scene.add(mesh7);
            that.camera = new THREE.OrthographicCamera(
                -textureData.width * 1 / 2,
                textureData.width * 1 / 2,
                textureData.height * 8 / 2,
                -textureData.height * 8 / 2,
                1,
                10)
            that.camera.position.z = 1;
        })
    }
    render(renderer) {
        var that = this;
        renderer.setRenderTarget(that.renderTarget);
        renderer.clear();
        renderer.render(that.scene, that.camera);
        renderer.setRenderTarget(null)
    }
    getShader(map, roughness) {
        var _uniforms = {
            "tex": { value: map },
            "roughness": { value: roughness }
        }
        return new THREE.ShaderMaterial({
            transparent: false,
            side: THREE.DoubleSide,
            depthTest: true,
            uniforms: _uniforms,
            extensions: {
                derivatives: false, // set to use derivatives
                fragDepth: false, // set to use fragment depth values
                drawBuffers: false, // set to use draw buffers
                shaderTextureLOD: false // set to use shader texture LOD
            },
            vertexShader:
                "varying vec2 vUv;\n\
                varying vec3 vWorldPos;\n\
        void main() {\n\
            vUv = uv;\n\
            vWorldPos= position;\n\
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n\
        }",
            fragmentShader: "varying vec2 vUv;\
                varying vec3 vWorldPos;\
                uniform float roughness;\
                uniform sampler2D tex;\
                const float PI=3.1415926;\
                const float invPI =0.3183098861837697;\
			    const float invTWO_PI =0.15915494309;\
                vec4 RGBEToLinearx( in vec4 value ) {\
                    return vec4( value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );\
                }\
                vec4 mapTexelToLinearx( vec4 value ) { return RGBEToLinearx( value ); }\
                vec3 ReinhardToneMappingx( vec3 color ) {\
                    float toneMappingExposure=3.;\
                    color *= toneMappingExposure;\
                    return clamp( color / ( vec3( 1.0 ) + color ),0.,1. );\
                }\
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
                vec2 getuv(vec3 p)\
                {\
                    float theta = acos(p.y);\
                    float phi = atan(p.z, p.x);\
                    if (phi < 0.0) {\
                        phi += 2.0 * PI;\
                    }\
                    vec2 s;\
                    s.x = 1.0 - phi * invTWO_PI;\
                    s.y = theta * invPI;\
                    return s;\
                }\
                vec3 uv2pos(vec2 uv){\
                    float phi = (uv.x) * PI * 2.;\
                    float theta = (uv.y) * PI;\
\
                    vec3 pos = vec3(0., 0., 0.);\
                    pos.y = cos(theta);\
                    pos.x = sin(theta) * cos(phi);\
                    pos.z = sin(theta) * sin(phi);\
\
                    pos=normalize(pos);\
\
                    return pos;}\
                void main() {\
                    vec2 uv=vUv;\
                    vec3 N=uv2pos(uv);\
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
                            vec2 st=getuv(L);\
                            prefilteredColor += mapTexelToLinearx(texture2D(tex, st)).rgb * NdotL;\
                            totalWeight+= NdotL;\
                        }\
                    }\
                    prefilteredColor = prefilteredColor / totalWeight;\
                    gl_FragColor=vec4((prefilteredColor),1.0);\
            }"
        });
    }
}