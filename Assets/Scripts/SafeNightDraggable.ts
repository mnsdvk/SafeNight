import {Interactable} from 'SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable';
import {InteractableManipulation} from 'SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation';

@component
export class SafeNightDraggable extends BaseScriptComponent {
 @input @hint('Collider extent in centimeters. Scaling is locked to preserve real dimensions.') colliderSize:vec3=new vec3(20,50,13);
 @input @hint('Allow doll/bottle rotation as well as translation.') allowRotation:boolean=true;
 public held=false;
 private interaction:Interactable;
 onAwake():void{
  const c=this.sceneObject.createComponent('Physics.ColliderComponent') as ColliderComponent;c.fitVisual=false;const shape=Shape.createBoxShape();shape.size=this.colliderSize;c.shape=shape;
  this.interaction=this.sceneObject.createComponent(Interactable.getTypeName()) as Interactable;
  const manipulation=this.sceneObject.createComponent(InteractableManipulation.getTypeName()) as InteractableManipulation;manipulation.setCanScale(false);manipulation.setCanRotate(this.allowRotation);manipulation.enableStretchZ=false;
  this.createEvent('OnStartEvent').bind(()=>{manipulation.onManipulationStart.add(()=>{this.held=true;});manipulation.onManipulationEnd.add(()=>{this.held=false;});});
 }
}
