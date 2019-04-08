class Irradiance {
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
            materials.push(that.getShader(texture))
            var quad = new THREE.PlaneBufferGeometry(textureData.width, textureData.height);

            var mesh0 = new THREE.Mesh(quad, materials[0]);
            mesh0.position.set(-textureData.width / 2, textureData.height / 2, 0);
            that.scene.add(mesh0);
            that.camera = new THREE.OrthographicCamera(
                -textureData.width / 2,//left
                textureData.width / 2,//right
                textureData.height / 2,//top
                -textureData.height / 2,//bottom
                1,//near
                10)//far
            that.camera.position.z = 1;
        })
    }
    render(renderer) {
        var that = this;
        console.log(that.camera)
        renderer.setRenderTarget(that.renderTarget);
        renderer.clear();
        renderer.render(that.scene, that.camera);
        renderer.setRenderTarget(null)
    }
    getShader(map) {
        var _uniforms = {
            "tex": { value: map }
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
            varying vec3 vWorldPos;\n\
            uniform vec3 begin;\
            uniform vec3 end;\
            uniform sampler2D tex;\
            uniform float iTime;\
            const float PI=3.1415926;\
            const float invPI =0.3183098861837697;\
            const float invTWO_PI =0.15915494309;\
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
            vec4 RGBEToLinearx( in vec4 value ) {\
                return vec4( value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );\
            }\
            vec4 mapTexelToLinearx( vec4 value ) { return RGBEToLinearx( value ); }\
            vec3 ReinhardToneMappingx( vec3 color ) {\
                float toneMappingExposure=3.;\
                color *= toneMappingExposure;\
                return clamp( color / ( vec3( 1.0 ) + color ),0.,1. );\
            }\
            void main() {\
                vec3 irradiance=vec3(0.);\
                vec3 N=uv2pos(vUv);\
                vec3 U=vec3(0.0,1.0,0.0);\
                vec3 R=cross(U,N);\
                U=cross(N,R);\
                const float sampleDelta=0.025;\
                float nrSamples=0.;\
                for(float phi=0.0;phi<2.*PI;phi+=sampleDelta)\
                {\
                  for(float theta=0.0;theta<0.5*PI;theta+=sampleDelta)\
                  {\
                    vec3 tangentSample=vec3(sin(theta)*cos(phi),sin(theta)*sin(phi),cos(theta));\
                    vec3 sampleVec=tangentSample.x*R+tangentSample.y*U+tangentSample.z*N;\
                    irradiance+=mapTexelToLinearx(texture2D(tex,getuv(sampleVec))).rgb*cos(theta)*sin(theta);\
                    nrSamples+=1.0;\
                  }\
                }\
                irradiance=PI*irradiance*(1./nrSamples);\
                gl_FragColor=(vec4((irradiance),1.0));\
            }"
        });
    }
}