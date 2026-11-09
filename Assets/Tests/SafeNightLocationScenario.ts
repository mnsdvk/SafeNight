import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {storyEnter} from './SafeNightDemoTools';
@component
export class SafeNightLocationScenario extends Scenario {
 async run():Promise<void>{
  const i=new DefaultLeafInteractor(),main=await storyEnter(i),t=main.doll.sceneObject.getTransform(),p=t.getWorldPosition();
  t.setWorldPosition(main.armchair.getTransform().getWorldTransform().multiplyPoint(new vec3(0,20,0)));await sleep(1400);
  expect(main.getResults().find(r=>r.id==='FEED-LOCATION').active).toBe(true);
  t.setWorldPosition(p);await sleep(900);expect(main.getResults().find(r=>r.id==='FEED-LOCATION').active).toBe(false);
 }
}
