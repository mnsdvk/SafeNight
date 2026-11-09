import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {findSceneObjectByName,sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {SafeNightMain} from '../Scripts/SafeNightMain';
@component
export class SafeNightRestartScenario extends Scenario {
 async run():Promise<void>{const main=findSceneObjectByName('Safe Night Controller').getComponent(SafeNightMain.getTypeName()) as SafeNightMain;const i=new DefaultLeafInteractor();main.reset();await sleep(300);const initial=main.pillow.getTransform().getLocalPosition();
  for(const id of ['begin','bottle','cycle-surface','select-surface','place','asleep','handoff','place-doll','clear-hazards']){await i.trigger(findInteractablesByName('Action '+id,undefined,true)[0]);await sleep(250);}
  main.reset();await sleep(200);expect(main.getState()).toBe('Welcome');const mattress=findSceneObjectByName('Fitted mattress').getComponent('Component.RenderMeshVisual') as RenderMeshVisual;expect(mattress.worldAabbMax().x-mattress.worldAabbMin().x).toBeCloseTo(71,1);const restored=main.pillow.getTransform().getLocalPosition();expect(restored.x).toBeCloseTo(initial.x,1);expect(restored.y).toBeCloseTo(initial.y,1);expect(restored.z).toBeCloseTo(initial.z,1);
 }
}
