// Procedural, centimeter-authored assets. No external models or textures.
type V3 = [number,number,number];
type Color = [number,number,number,number];
class Batch {
 vertices:number[]=[];indices:number[]=[];
 vertex(p:V3,n:V3):number{const id=this.vertices.length/10;this.vertices.push(...p,...n,1,1,1,1);return id;}
 box(c:V3,s:V3):void{
  const faces:{n:V3,u:V3,v:V3}[]=[{n:[1,0,0],u:[0,1,0],v:[0,0,1]},{n:[-1,0,0],u:[0,0,1],v:[0,1,0]},{n:[0,1,0],u:[0,0,1],v:[1,0,0]},{n:[0,-1,0],u:[1,0,0],v:[0,0,1]},{n:[0,0,1],u:[1,0,0],v:[0,1,0]},{n:[0,0,-1],u:[0,1,0],v:[1,0,0]}];
  for(const f of faces){const ids:number[]=[];for(const q of [[-1,-1],[1,-1],[1,1],[-1,1]]){const p=c.map((x,k)=>x+(f.n[k]*s[k]+q[0]*f.u[k]*s[k]+q[1]*f.v[k]*s[k])/2) as V3;ids.push(this.vertex(p,f.n));}this.indices.push(ids[0],ids[1],ids[2],ids[0],ids[2],ids[3]);}
 }
 ellipsoid(c:V3,r:V3,segments=20,rings=12):void{
  const start=this.vertices.length/10;
  for(let j=0;j<=rings;j++){const t=Math.PI*j/rings;for(let i=0;i<=segments;i++){const a=2*Math.PI*i/segments;const n:[number,number,number]=[Math.sin(t)*Math.cos(a),Math.cos(t),Math.sin(t)*Math.sin(a)];const raw=n.map((x,k)=>x/r[k]) as V3;const len=Math.hypot(...raw);this.vertex(c.map((x,k)=>x+n[k]*r[k]) as V3,raw.map(x=>x/len) as V3);}}
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=start+j*(segments+1)+i,b=a+segments+1;this.indices.push(a,b+1,b,a,a+1,b+1);}
 }
 lathe(profile:[number,number][],segments=24):void{
  const start=this.vertices.length/10;
  for(let j=0;j<profile.length;j++){const prev=profile[Math.max(0,j-1)],next=profile[Math.min(profile.length-1,j+1)];const dy=next[1]-prev[1],dr=next[0]-prev[0],l=Math.hypot(dy,dr)||1;
   for(let i=0;i<=segments;i++){const a=2*Math.PI*i/segments;this.vertex([Math.cos(a)*profile[j][0],profile[j][1],Math.sin(a)*profile[j][0]],[Math.cos(a)*dy/l,-dr/l,Math.sin(a)*dy/l]);}}
  for(let j=0;j<profile.length-1;j++)for(let i=0;i<segments;i++){const a=start+j*(segments+1)+i,b=a+segments+1;this.indices.push(a,b,a+1,a+1,b,b+1);}
 }
 render(parent:SceneObject,name:string,material:Material,color:Color):SceneObject{
  const o=global.scene.createSceneObject(name);o.setParent(parent);
  const b=new MeshBuilder([{name:'position',components:3},{name:'normal',components:3,normalized:true},{name:'color',components:4}]);b.topology=MeshTopology.Triangles;b.indexType=MeshIndexType.UInt16;b.appendVerticesInterleaved(this.vertices);b.appendIndices(this.indices);b.updateMesh();
  const v=o.createComponent('Component.RenderMeshVisual') as RenderMeshVisual;v.mesh=b.getMesh();const m=material.clone();m.mainPass.baseColor=new vec4(...color);v.mainMaterial=m;return o;
 }
}
@component
export class SafeNightNurseryMesh extends BaseScriptComponent {
 @input @hint('Procedural asset: baby, bottle, crib, bed, chair, lamp, support, pillow, blanket, bumper, toy, ring, room.') kind:string='baby';
 @input @hint('Preset-created SimplePBR or Unlit material; cloned per color batch.') material:Material;
 @input @hint('Infant surface internal width in centimeters.') interiorWidth:number=71;
 @input @hint('Infant surface internal length in centimeters.') interiorLength:number=133;
 public head:SceneObject;public shoulder:SceneObject;public hip:SceneObject;
 private batches:{[name:string]:{mesh:Batch,color:Color}}={};private rendered:{[name:string]:SceneObject}={};
 public setCueStyle(unknown:boolean,alpha:number):void{for(const name of ['Cue outline','Unknown outline']){const o=this.rendered[name];if(!o)continue;o.enabled=(name==='Unknown outline')===unknown;const v=o.getComponent('Component.RenderMeshVisual') as RenderMeshVisual;const c=v.mainMaterial.mainPass.baseColor;v.mainMaterial.mainPass.baseColor=new vec4(c.x,c.y,c.z,alpha);}}
 public setDimensions(width:number,length:number):void{if(this.kind!=='crib'||(this.interiorWidth===width&&this.interiorLength===length))return;this.interiorWidth=width;this.interiorLength=length;for(let i=this.sceneObject.getChildrenCount()-1;i>=0;i--)this.sceneObject.getChild(i).destroy();this.batches={};this.rendered={};this.build();}
 onAwake(){this.build();}
 private b(name:string,color:Color):Batch {if(!this.batches[name])this.batches[name]={mesh:new Batch(),color};return this.batches[name].mesh;}
 private marker(name:string,p:V3):SceneObject{const o=global.scene.createSceneObject(name);o.setParent(this.sceneObject);o.getTransform().setLocalPosition(new vec3(...p));return o;}
 private build():void{
  const ivory:Color=[0.85,0.78,0.65,1],teal:Color=[0.36,0.68,0.65,1],wood:Color=[0.49,0.35,0.25,1],skin:Color=[0.72,0.48,0.34,1],violet:Color=[0.49,0.43,0.61,1];
  switch(this.kind){
   case 'baby':{
    const suit=this.b('Sleepsuit',teal);suit.ellipsoid([0,-4,0],[8.4,13,5.4]);suit.ellipsoid([-5,-18,0],[3.8,5,4]);suit.ellipsoid([5,-18,0],[3.8,5,4]);suit.ellipsoid([-9,1,0],[3,8,3]);suit.ellipsoid([9,1,0],[3,8,3]);
    const face=this.b('Doll head and hands',skin);face.ellipsoid([0,18,0],[6.4,7,5.8]);face.ellipsoid([0,9,0],[3.2,4,3.5]);face.ellipsoid([-9,-6,0.8],[2.6,2.8,2]);face.ellipsoid([9,-6,0.8],[2.6,2.8,2]);face.ellipsoid([0,17,5.5],[1,1,1]);
    const features=this.b('Quiet face',[0.15,0.12,0.11,1]);features.ellipsoid([-2.3,19,5.5],[0.9,0.25,0.25]);features.ellipsoid([2.3,19,5.5],[0.9,0.25,0.25]);features.ellipsoid([0,14.7,5.6],[0.6,0.25,0.22]);
    this.b('Cuffs',ivory).ellipsoid([-5,-22,1],[3.8,2.3,4]);this.b('Cuffs',ivory).ellipsoid([5,-22,1],[3.8,2.3,4]);
    this.head=this.marker('Head landmark',[0,18,0]);this.shoulder=this.marker('Shoulder landmark',[0,7,0]);this.hip=this.marker('Hip landmark',[0,-10,0]);break;
   }
   case 'bottle':this.b('Bottle body',ivory).lathe([[0,-6],[2.4,-6],[2.8,-5],[2.8,3],[2.2,4],[0,4]]);this.b('Bottle collar',teal).lathe([[0,4],[3,4],[3,6],[0,6]]);this.b('Teat',[0.89,0.69,0.48,1]).lathe([[0,6],[2,6],[1,8],[0.7,9],[0,9]]);for(let y=-3;y<3;y+=2)this.b('Measure marks',teal).box([2.75,y,0],[0.15,0.3,1.2]);this.marker('Bottle teat',[0,9,0]);break;
   case 'crib':{
    const w=this.interiorWidth,l=this.interiorLength;const rails=this.b('Walnut crib frame',wood);
    this.b('Fitted mattress',ivory).box([0,0,0],[w,6,l]);
    for(const x of [-w/2-2,w/2+2]){rails.box([x,16,0],[3,3,l+8]);rails.box([x,-5,0],[3,3,l+8]);for(let z=-l/2;z<=l/2;z+=8)rails.box([x,5.5,z],[1.5,21,1.5]);}
    for(const z of [-l/2-2,l/2+2]){rails.box([0,16,z],[w+8,3,3]);for(const x of [-w/2-2,w/2+2])rails.box([x,-15,z],[4,65,4]);}
    this.marker('Sleep volume center',[0,20,0]);break;
   }
   case 'bed':this.b('Bed frame',wood).box([0,-8,0],[152,14,205]);this.b('Duvet',violet).box([0,4,8],[146,12,180]);this.b('Headboard',wood).box([0,28,-100],[156,70,7]);for(const x of [-38,38])this.b('Pillows',ivory).ellipsoid([x,14,-65],[31,6,18]);break;
   case 'chair':this.b('Chair upholstery',violet).ellipsoid([0,4,0],[27,10,29]);this.b('Chair upholstery',violet).box([0,30,-22],[50,48,12]);for(const x of [-27,27])this.b('Armrests',wood).box([x,14,0],[8,30,52]);for(const x of [-20,20])for(const z of [-20,20])this.b('Legs',wood).box([x,-16,z],[5,30,5]);break;
   case 'lamp':this.b('Brass stem',[0.63,0.47,0.27,1]).lathe([[0,0],[14,0],[14,2],[2,4],[1.4,100],[0,100]]);this.b('Warm shade',[0.97,0.8,0.49,1]).lathe([[15,92],[20,92],[12,116],[0,116]]);break;
   case 'support':this.b('Simulated supporting arm',skin).ellipsoid([0,0,0],[5,3,8]);this.b('Simulated supporting arm',skin).ellipsoid([-13,-4,-1],[13,3.6,4]);break;
   case 'pillow':this.b('Pillow',violet).ellipsoid([0,0,0],[13,4,10]);break;
   case 'blanket':this.b('Loose blanket',teal).box([0,0,0],[24,2,32]);for(let i=-10;i<=10;i+=4)this.b('Blanket folds',ivory).box([i,1.1,0],[0.7,0.3,31]);break;
   case 'bumper':this.b('Soft bumper',ivory).box([0,0,0],[50,8,7]);break;
   case 'toy':this.b('Plush toy',violet).ellipsoid([0,0,0],[5,6,4]);this.b('Plush toy',violet).ellipsoid([0,7,0],[4.5,4.5,4]);for(const x of [-3,3])this.b('Plush toy',violet).ellipsoid([x,11,0],[2,2.5,1.5]);break;
   case 'ring':{
    for(const unknown of [false,true]){const b=this.b(unknown?'Unknown outline':'Cue outline',unknown?[0.77,0.66,0.93,1]:[0.91,0.65,0.29,1]);for(let i=0;i<64;i++){if(unknown&&i%8>=4)continue;const a=i*2*Math.PI/64,an=(i+1)*2*Math.PI/64;const ids=[b.vertex([7*Math.cos(a),7*Math.sin(a),0],[0,0,1]),b.vertex([7.3*Math.cos(a),7.3*Math.sin(a),0],[0,0,1]),b.vertex([7.3*Math.cos(an),7.3*Math.sin(an),0],[0,0,1]),b.vertex([7*Math.cos(an),7*Math.sin(an),0],[0,0,1])];b.indices.push(ids[0],ids[1],ids[2],ids[0],ids[2],ids[3]);}}break;
   }
   case 'room':this.b('Practice floor',[0.16,0.19,0.21,1]).box([0,-2,0],[650,4,650]);for(let i=-300;i<=300;i+=30)this.b('Floor grain',[0.23,0.26,0.27,1]).box([i,0.1,0],[0.3,0.2,650]);break;
  }
  for(const name of Object.keys(this.batches)){const batch=this.batches[name];this.rendered[name]=batch.mesh.render(this.sceneObject,name,this.material,batch.color);}if(this.kind==='ring')this.setCueStyle(false,1);
 }
}
