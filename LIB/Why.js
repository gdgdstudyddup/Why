class WHY 
{

    constructor()
    {
        var why=document.createElement("CANVAS");
       
        why.width=window.innerWidth;
        why.height=window.innerHeight;
        document.body.appendChild(why);
        var gl=why.getContext("webgl");
        if(!gl)
        {
           alert("browser do not support webGL");
           return;
        }
        gl.clearColor(0.8,0.8,0.8,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
     
    }
    

}