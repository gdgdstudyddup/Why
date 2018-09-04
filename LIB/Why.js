class vec3
{
    constructor(x,y,z)
    {
        this.x=x;
        this.y=y;
        this.z=z;
    }
}
class vec4
{
    constructor(x,y,z,w)
    {
        this.x=x;
        this.y=y;
        this.z=z;
        this.w=w;
        this.r=x;
        this.g=y;
        this.b=z;
        this.a=w;
    }
}
class vec2
{
    constructor(x,y)
    {
        this.x=x;
        this.y=y;
        
    }
}
class Transform
{
    constructor()
    {
        this.position=new vec3(0,0,0);
        this.forward=new vec3(0,0,0);
        this.up=new vec3(0,1,0);
    }
    setPosition(pos)
    {
        this.position.x=pos.x;
        this.position.y=pos.y;
        this.position.z=pos.z;
    }

    setForward(fo)
    {
       this.forward.x=fo.x;
       this.forward.y=fo.y;
       this.forward.z=fo.z;
    }
    setUp(up)
    {
        this.up.x=up.x;
        this.up.y=up.y;
        this.up.z=up.z;
    }
}
class WHYCamera
{ 
 constructor()
 {
     
     this.viewMatrix=new Matrix4();
     this.transform=new Transform();
  

 }
 setLookAt(pos,targetPos,up)
 {
    this.viewMatrix.setLookAt(pos.x,pos.y,pos.z,targetPos.x,targetPos.y,targetPos.z,up.x,up.y,up.z);
    this.transform.setPosition(new vec3(pos.x,pos.y,pos.z));
    this.transform.setForward(new vec3(targetPos.x,targetPos.y,targetPos.z));
    this.transform.setUp(new vec3(up.x,up.y,up.z));
   
 }
}
class WHY 
{

    constructor()
    {
        this.why=document.createElement("CANVAS");
       
        this.why.width=window.innerWidth;
        this.why.height=window.innerHeight;
        document.body.appendChild(this.why);
        this.gl=this.why.getContext("webgl");
        if(!this.gl)
        {
           alert("browser do not support webGL");
           return;
        }
        this.gl.clearColor(0.8,0.8,0.8,1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.camera=new WHYCamera();
        this.projectionMatrix=new Matrix4();
        this.init();
        
        
        console.log(this);
    }
    init()
    {
        this.setCamera();
        this.setPerspective(30,this.why.width,this.why.height,1,100);
    }
    setCamera(Pos=new vec3(0,0,100),targetPos=new vec3(0,0,0),Up=new vec3(0,1,0))
    {
        this.camera.setLookAt(Pos,targetPos,Up);
    }
    setPerspective(fov,width,height,near,far)
    {
        this.projectionMatrix.setPerspective(fov, width / height, near, far);
    }
    Draw(mode,count,elementType,offset)
    {
        this.gl.drawElements(mode, count, elementType, offset);
    }
}