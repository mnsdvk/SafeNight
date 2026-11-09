import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {findSceneObjectByName,sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {SafeNightMain} from '../Scripts/SafeNightMain';
export function storyController():SafeNightMain{return findSceneObjectByName('Safe Night Controller').getComponent(SafeNightMain.getTypeName()) as SafeNightMain;}
export async function storyTap(i:DefaultLeafInteractor,id:string,waitMs=350):Promise<void>{const target=findInteractablesByName('Action '+id,undefined,true)[0];if(!target)throw Error('Missing enabled action '+id);await i.trigger(target);await sleep(waitMs);}
export async function storyEnter(i:DefaultLeafInteractor,mode='bottle'):Promise<SafeNightMain>{const main=storyController();main.reset();await sleep(400);for(const id of ['begin',mode,'select-surface','place'])await storyTap(i,id);return main;}
export async function storyDragTo(owner:BaseScriptComponent,i:DefaultLeafInteractor,destination:vec3):Promise<void>{
 const target=findInteractablesByName('Virtual Newborn Doll',undefined,true)[0];
 // Each drag is a real pinch/manipulation. Stop only after measuring the released pose.
 for(let attempt=0;attempt<6;attempt++){
  const delta=new vec3(0,0,0);const event=owner.createEvent('UpdateEvent');
  event.bind(()=>{const error=destination.sub(target.getTransform().getWorldPosition());delta.x=Math.max(-1,Math.min(1,error.x*0.12));delta.y=Math.max(-1,Math.min(1,error.y*0.12));delta.z=Math.max(-1,Math.min(1,error.z*0.12));});
  try{await i.drag(target,delta,1000);}finally{owner.removeEvent(event);}
  await sleep(200);const p=target.getTransform().getWorldPosition();
  print('[SafeNight drag] '+JSON.stringify({attempt,actual:{x:p.x,y:p.y,z:p.z},destination:{x:destination.x,y:destination.y,z:destination.z}}));
  if(p.distance(destination)<2)return;
 }
 throw Error('Doll manipulation did not reach its measured destination');
}
