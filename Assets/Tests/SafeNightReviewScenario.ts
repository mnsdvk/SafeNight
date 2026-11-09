import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findSceneObjectByName,sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {storyEnter,storyTap} from './SafeNightDemoTools';
@component
export class SafeNightReviewScenario extends Scenario {
 async run():Promise<void>{
  const i=new DefaultLeafInteractor(),main=await storyEnter(i);
  for(const id of ['asleep','handoff','place-doll','clear-hazards','confirm-surface'])await storyTap(i,id);
  await sleep(1200);await storyTap(i,'finish');expect(main.getState()).toBe('Done');
  let text='';for(let n=0;n<10;n++){text+=(findSceneObjectByName('Card Body').getComponent('Component.Text') as Text).text+'\n';text+=(findSceneObjectByName('Card Title2').getComponent('Component.Text') as Text).text+'\n';await storyTap(i,'next-review');}
  expect(text.includes('Head and neck support')).toBe(true);expect(text.includes('Confirmed by you')).toBe(true);expect(text.includes('Unknown simulation input')).toBe(true);expect(text.includes('Hardware and real infants')).toBe(true);
 }
}
