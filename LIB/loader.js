class WHYModel {
    constructor() {
        this.childs = [];
        this.childno = 0;
        this.type = null;
        this.matid = -1;
    }
}
class WHYLoader {
    constructor() {
        this.vertices = null;
        this.indices = null;
        this.normals = null;
        this.uvs = null;

    }
    load(url) {
        var that = this;
        var req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status == 200 || req.status == 0) {
                    that.xml = req.responseXML;
                    //console.log(this.xml)
                    if (that.xml) {
                        let library_geometries = that.xml.getElementsByTagName('library_geometries')[0];
                        if (library_geometries) {
                            let geometry = library_geometries.getElementsByTagName("geometry")[0];
                            if (geometry) {
                                let mesh = geometry.getElementsByTagName("mesh")[0];
                                if (mesh) {

                                    let sources = mesh.getElementsByTagName("source");//console.log(sources[0].id);
                                    let position = sources[0].getElementsByTagName("float_array")[0].textContent;
                                    position = position.split(' ');
                                    for (let i = 0; i < position.length; i++) {
                                        position[i] = parseFloat(position[i]);
                                    }
                                    let normals = sources[1].getElementsByTagName("float_array")[0].textContent;
                                    normals = normals.split(' ');
                                    for (let i = 0; i < normals.length; i++) {
                                        normals[i] = parseFloat(normals[i]);
                                    }
                                    let uvs = sources[2].getElementsByTagName("float_array")[0].textContent;
                                    uvs = uvs.split(' ');
                                    for (let i = 0; i < uvs.length; i++) {
                                        uvs[i] = parseFloat(uvs[i]);
                                    }
                                    let polylist=mesh.getElementsByTagName("polylist")[0];
                                    let allpoints=polylist.getElementsByTagName("p")[0].textContent.split(' ');
                                if(allpoints)
                                {
                                    for(let i=0;i<allpoints.length;i++)
                                    {
                                        allpoints[i]=parseInt(allpoints[i])
                                    }
                                }
                                let vertemp=[];
                                //let indices=[];
                                let nortemp=[];
                                let textemp=[];
                            
                                for(let i=0;i<allpoints.length;i+=3)
                                {
                                   
                                    vertemp.push(position[3*allpoints[i]]);
                                    vertemp.push(position[3*allpoints[i]+1]);
                                    vertemp.push(position[3*allpoints[i]+2]);
                                    //normals.push(normal[allpoints[i+1]])   allpoints[i+1]==index
                                    nortemp.push(normals[3*allpoints[i+1]]);
                                    nortemp.push(normals[3*allpoints[i+1]+1]);
                                    nortemp.push(normals[3*allpoints[i+1]+2]);
                                    //tex...
                                    textemp.push(uvs[2*allpoints[i+2]] )
                                    textemp.push(uvs[2*allpoints[i+2]+1] )

                                }
                                that.vertices=vertemp;
                                that.normals=nortemp;
                                that.uvs=textemp;
                                }//mesh
                            }
                        }
                    }
                }
            }
        }//readystatechange
        req.send(null);
    }//load
}