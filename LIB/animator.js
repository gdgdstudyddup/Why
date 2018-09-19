class Model {
    constructor() {
        this.vertices=[];
        this.indices=[];
        this.tex=[];
        this.texcoords=[];
        this.xml=null;
       
    }//construct
   init(url,scene)
   {
    this.i=0;
    var req = new XMLHttpRequest();
    req.open("GET", url, true);        
    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            if (req.status == 200 || req.status == 0) {
                this.xml=req.responseXML;
                //console.log(this.xml)
                if(this.xml)
                {
                    let library_geometries=this.xml.getElementsByTagName('library_geometries')[0];
                    if(library_geometries)
                    {
                        let geometry=library_geometries.getElementsByTagName("geometry")[0];
                        if(geometry)
                        {
                            let mesh=geometry.getElementsByTagName("mesh")[0];
                            if(mesh)
                            {
                                var vertices;
                                let sources=mesh.getElementsByTagName("source");//console.log(sources[0].id);
                                if(sources)
                                {
                                    let position=sources[0].getElementsByTagName("float_array")[0].textContent;
                                    position=position.split(' ');
                                    for(let i=0;i<position.length;i++)
                                    {
                                        position[i]=parseFloat(position[i]);
                                       
                                    }
                                    //console.log(position)
                                    vertices=position;
                                    let texc=sources[2].getElementsByTagName("float_array")[0].textContent;
                                    texc=texc.split(' ');
                                    for(let i=0;i<texc.length;i++)
                                    {
                                        texc[i]=parseFloat(texc[i]);
                                    }
                                    this.tex=texc;
                                   
                                }
                                let polylist=mesh.getElementsByTagName("polylist")[0];
                                //console.log(this.tex);
                                let vcount=polylist.getElementsByTagName("vcount")[0].textContent.split(' ');
                                //let vcount0=parseInt(vcount[0]);
                               // console.log(vcount0)
                                let allpoints=polylist.getElementsByTagName("p")[0].textContent.split(' ');
                                if(allpoints)
                                {
                                    for(let i=0;i<allpoints.length;i++)
                                    {
                                        allpoints[i]=parseInt(allpoints[i])
                                    }
                                }
                                let vertemp=[];
                                let indices=[];
                                let textemp=[];
                                let now=0;
                                for(let i=0;i<allpoints.length;i+=3)
                                {
                                    indices.push(now++);
                                    vertemp.push(vertices[3*allpoints[i]]);
                                    vertemp.push(vertices[3*allpoints[i]+1]);
                                    vertemp.push(vertices[3*allpoints[i]+2]);
                                    //normals.push(normal[allpoints[i+1]])   allpoints[i+1]==index
                                    //tex...
                                    textemp.push(this.tex[2*allpoints[i+2]] )
                                    textemp.push(this.tex[2*allpoints[i+2]+1] )

                                }
                                console.log(now,allpoints.length,indices.length);
                                this.vertices=vertemp;
                                this.indices=indices;
                                this.texcoords=textemp;
                                this.i=1;
                                console.log("this",this.texcoords)
                                scene.drawS(this.vertices,this.indices,this.texcoords);
                               
                            }

                        }
                    }
                   
                    
                   
                }
                

            }
        }
    }
    
    req.send(null);
   }
    gg()
    {
        console.log(this.vertices,this.indices)
    }
    draw(scene)
    {
      
        
    }



//end
}