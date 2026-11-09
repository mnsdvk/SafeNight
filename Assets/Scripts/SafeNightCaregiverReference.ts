// Original generated artwork: clothed placement references, not clinical diagrams.
@component
export class SafeNightCaregiverReference extends BaseScriptComponent {
 @input material:Material;
 private visual:RenderMeshVisual;private index=-1;
 onAwake():void{
  this.visual=this.sceneObject.createComponent('Component.RenderMeshVisual') as RenderMeshVisual;
  const material=this.material.clone();material.mainPass.baseTex=requireAsset('../Images/caregiver-holds-atlas.png') as Texture;material.mainPass.baseColor=new vec4(1,1,1,1);this.visual.mainMaterial=material;this.setHold('cradle');
 }
 public setHold(hold:string):void{
  const index=['cradle','cross-cradle','football'].indexOf(hold);if(index===this.index)return;this.index=Math.max(0,index);
  const left=this.index/3+0.002,right=(this.index+1)/3-0.002;
  const b=new MeshBuilder([{name:'position',components:3},{name:'normal',components:3},{name:'texture0',components:2}]);b.topology=MeshTopology.Triangles;b.indexType=MeshIndexType.UInt16;
  b.appendVerticesInterleaved([-14,-14,0,0,0,1,left,0,14,-14,0,0,0,1,right,0,14,14,0,0,0,1,right,1,-14,14,0,0,0,1,left,1]);b.appendIndices([0,1,2,0,2,3]);b.updateMesh();this.visual.mesh=b.getMesh();
 }
 public getTexture():Texture{return this.visual.mainMaterial.mainPass.baseTex as Texture;}
}
