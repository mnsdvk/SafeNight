import {RuleEngine,PromptArbiter,SessionState,Result,Frame,Point,orientedBoxOverlap,distance,summarizeEvidence,voiceCommand,insideBox} from './SafeNightCore';
import {SafeNightCardUI,CardData,CardAction} from './SafeNightCardUI';
import {SafeNightNurseryMesh} from './SafeNightNurseryMesh';
import {SafeNightDraggable} from './SafeNightDraggable';
import {SafeNightCaregiverReference} from './SafeNightCaregiverReference';

@component
export class SafeNightMain extends BaseScriptComponent {
 @input @hint('Passive UIKit view. Exactly one card is rendered.') card:SafeNightCardUI;
 @input @hint('Procedural doll with real centimeter landmarks.') doll:SafeNightNurseryMesh;
 @input @hint('Clothed caregiver placement illustration, never a clinical diagram.') caregiver:SafeNightCaregiverReference;
 @input @hint('Authored nursery group; placement is separate from UI.') nursery:SceneObject;
 @input @hint('Bottle root; actual pose drives bottle checks.') bottle:SceneObject;
 @input @hint('Simulated forearm collider supporting the doll.') support:SceneObject;
 @input @hint('Simulated bottle-holding hand collider.') bottleHand:SceneObject;
 @input @hint('Infant sleep surface root, independent of UI.') crib:SceneObject;
 @input @hint('Armchair volume used for simulated feeding-location checks.') armchair:SceneObject;
 @input @hint('Soft pillow hazard.') pillow:SceneObject;
 @input @hint('Loose blanket hazard.') blanket:SceneObject;
 @input @hint('Soft bumper hazard.') bumper:SceneObject;
 @input @hint('Plush toy hazard.') toy:SceneObject;
 @input @hint('Luminous body-anchored cue outline.') cueMarker:SceneObject;
 @input @hint('World-tracked camera used for view-edge direction.') camera:Camera;
 @input @hint('Synthesized, quiet chime at the sleep space.') chime:AudioComponent;
 @input @hint('Runtime diagnostic: current state, readable in Inspector.') stateLabel:string='Welcome';
 @input @hint('Runtime diagnostic: active registry rule.') activeCue:string='';
 @input @hint('Optional speech transcription. Off by default; explicit buttons remain available.') enableVoice:boolean=false;
 private config:any;private copy:any;private ruleLabels:{[id:string]:string}={};private reviewPage=0;private engine:RuleEngine;private arbiter:PromptArbiter;private session=new SessionState();private initialPoses:{object:SceneObject,position:vec3,rotation:quat}[]=[];
 private mode='bottle';private surfaceIndex=0;private surfaceTypes=['crib','bassinet','play yard','other firm flat infant surface'];private surfaceType='crib';private prepareStep=0;private poseAvailable=true;private elapsed=0;private pausedUntil=0;private inputQueue:string[]=[];private lastCard='';private lastLogged='';private results:Result[]=[];private evidence:{[id:string]:Result}={};private firmnessConfirmed=false;private redirect=false;private hold='cradle';private chimePlayed=false;private voiceStatus='';private asr:any=null;private markerAlpha=0;
 onAwake():void{
  this.config=JSON.parse((requireAsset('../Data/simulation.json') as JsonAsset).getString());this.copy=JSON.parse((requireAsset('../Data/copy.json') as JsonAsset).getString());
  const registry=JSON.parse((requireAsset('../Data/rules.json') as JsonAsset).getString());this.ruleLabels=Object.fromEntries(registry.map(r=>[r.id,r.label]));this.voiceStatus=this.copy.voiceOff;this.engine=new RuleEngine(registry,this.config);this.arbiter=new PromptArbiter(this.config.cooldownMs);
  this.createEvent('OnStartEvent').bind(()=>{this.initialPoses=[this.crib,...this.hazards()].map(object=>({object,position:object.getTransform().getLocalPosition(),rotation:object.getTransform().getLocalRotation()}));this.card.onAction.add(id=>this.inputQueue.push(id));if(!this.camera.sceneObject.getComponent('Component.AudioListenerComponent'))this.camera.sceneObject.createComponent('Component.AudioListenerComponent');this.chime.playbackMode=Audio.PlaybackMode.LowLatency;this.chime.volume=0.35;this.chime.spatialAudio.enabled=true;this.reset();if(this.enableVoice)this.startVoice();print('[SafeNight] Ready: simulation-only; no baby recognition, no monitoring, no hardware.');});
  this.createEvent('UpdateEvent').bind(()=>this.update());this.createEvent('OnDestroyEvent').bind(()=>{if(this.asr)this.asr.stopTranscribing();});
 }
 public getState():string{return this.session.state;}
 public getCue():string{return this.activeCue;}
 public getResults():Result[]{return this.results;}
 public getCardCount():number{return this.card.cardCount();}
 public getMode():string{return this.mode;}
 public getPoseAvailable():boolean{return this.poseAvailable;}
 public getDollLength():number{return this.config.dollLengthCm;}
 public getCribDimensions():Point{return this.config.cribInteriorCm;}
 public reset():void{this.session.restart();this.reviewPage=0;this.mode='bottle';this.hold='cradle';this.prepareStep=0;this.poseAvailable=true;this.elapsed=0;this.pausedUntil=0;this.redirect=false;this.firmnessConfirmed=false;this.chimePlayed=false;this.evidence={};this.results=[];this.engine.reset();this.arbiter.reset();this.activeCue='';this.lastCard='';this.lastLogged='';this.surfaceType='crib';this.surfaceIndex=0;this.markerAlpha=0;this.inputQueue=[];for(const pose of this.initialPoses){pose.object.getTransform().setLocalPosition(pose.position);pose.object.getTransform().setLocalRotation(pose.rotation);}this.resizeSleepSpace();this.nursery.enabled=false;this.cueMarker.enabled=false;this.resetDoll();this.render();}
 public action(id:string):void{
  const s=this.session.state;
  if(id==='next-review'&&s==='Done'){this.reviewPage++;this.lastCard='';this.render();return;}
  if(id==='restart'){this.reset();return;}
  if(id==='begin'&&s==='Welcome'){this.session.go('Prepare');this.prepareStep=0;}
  else if((id==='bottle'||id==='breast')&&s==='Prepare'){this.mode=id;this.prepareStep=1;this.resetDoll();}
  else if(id==='cycle-surface'&&s==='Prepare'){this.surfaceIndex=(this.surfaceIndex+1)%this.surfaceTypes.length;this.surfaceType=this.surfaceTypes[this.surfaceIndex];this.redirect=false;this.resizeSleepSpace();}
  else if((id==='adult-bed'||id==='sofa')&&s==='Prepare'){this.surfaceType=id;this.redirect=true;}
  else if(id==='select-surface'&&s==='Prepare'){if(this.surfaceTypes.includes(this.surfaceType)){this.prepareStep=2;this.redirect=false;this.nursery.enabled=true;}}
  else if(id==='place'&&s==='Prepare'){this.session.go('Feed');this.elapsed=0;}
  else if(id==='voice'&&s==='Prepare'){this.enableVoice=!this.enableVoice;if(this.enableVoice)this.startVoice();else{if(this.asr)this.asr.stopTranscribing();this.voiceStatus=this.copy.voiceOff;}}
  else if(id==='sleepy'&&s==='Feed')this.session.go('SleepyResponse');
  else if(id==='asleep'&&s==='Feed')this.session.go('BabyAsleep');
  else if(id==='handoff'&&(s==='BabyAsleep'||s==='SleepyResponse'))this.session.go('Handoff');
  else if(id==='place-doll'&&s==='Handoff'){this.placeDollInCrib();this.session.go('SleepSpaceCheck');this.engine.reset();this.arbiter.reset();}
  else if(id==='confirm-surface'&&s==='SleepSpaceCheck')this.firmnessConfirmed=true;
  else if(id==='finish'&&s==='SleepSpaceCheck'&&this.firmnessConfirmed&&this.results.length>0&&this.results.every(r=>r.evidence!=='UNKNOWN'&&r.violated===false&&!r.active))this.session.go('Done');
  else if(id==='hold'&&s==='Feed'){const holds=['cradle','cross-cradle','football'];this.hold=holds[(holds.indexOf(this.hold)+1)%holds.length];this.resetDoll();}
  else if(id==='pause'&&s==='Feed'){this.elapsed=0;this.pausedUntil=getTime()+this.config.pauseDurationSeconds;}
  else if(id==='input'&&(s==='Feed'||s==='SleepSpaceCheck')){this.poseAvailable=!this.poseAvailable;}
  else if(id==='pose'&&s==='Feed'){const tr=this.doll.sceneObject.getTransform();tr.setWorldRotation(quat.fromEulerAngles(0,0,-Math.PI/2));this.moveSupportToHead();}
  else if(id==='correct'&&s==='Feed')this.resetDoll();
  else if(id==='prop'&&s==='Feed'){const h=this.doll.head.getTransform().getWorldPosition();this.bottle.getTransform().setWorldPosition(h.add(new vec3(11,0,8)));this.bottle.getTransform().setWorldRotation(quat.fromEulerAngles(0,0,Math.PI/2));this.pillow.getTransform().setWorldPosition(h.add(new vec3(12,-6,8)));this.bottleHand.getTransform().setWorldPosition(h.add(new vec3(45,-20,8)));}
  else if(id==='clear-hazards'&&s==='SleepSpaceCheck'){this.hazards().forEach((o,i)=>o.getTransform().setWorldPosition(this.crib.getTransform().getWorldPosition().add(new vec3(80+i*30,-20,0))));}
  else if(id==='try-side'&&s==='SleepSpaceCheck'){this.placeDollInCrib();this.doll.sceneObject.getTransform().setWorldPosition(this.crib.getTransform().getWorldTransform().multiplyPoint(new vec3(0,16,0)));this.doll.sceneObject.getTransform().setWorldRotation(this.crib.getTransform().getWorldRotation().multiply(quat.fromEulerAngles(-Math.PI/2,0,0)).multiply(quat.fromEulerAngles(0,Math.PI/2,0)));}
  else if(id==='on-back'&&s==='SleepSpaceCheck')this.placeDollInCrib();
  else if(id==='hazard'&&s==='SleepSpaceCheck')this.pillow.getTransform().setWorldPosition(this.crib.getTransform().getWorldPosition().add(new vec3(0,8,0)));
  this.lastCard='';this.render();
 }
 private update():void{
  if(!this.card||!this.engine)return;while(this.inputQueue.length)this.action(this.inputQueue.shift() as string);
  if(this.session.state==='Feed'&&getTime()>this.pausedUntil)this.elapsed+=getDeltaTime();
  const mode=this.session.state==='SleepSpaceCheck'?'sleep':this.mode;
  if(this.session.state==='Feed'||this.session.state==='SleepSpaceCheck'){
   const frame=this.frame();this.results=this.engine.evaluate(frame,mode,getTime()*1000);for(const r of this.results)this.evidence[r.id]=r;
   const cue=this.arbiter.select(this.results,getTime()*1000);this.activeCue=cue?cue.id:'';
   if(this.activeCue!==this.lastLogged){print('[SafeNight cue] '+JSON.stringify({state:this.session.state,rule:this.activeCue||'none',evidence:cue?cue.evidence:'MODELED',simulation:true}));this.lastLogged=this.activeCue;}
   this.updateMarker(cue);this.render();
  }else{this.cueMarker.enabled=false;this.activeCue='';this.render();}
  this.stateLabel=this.session.state;
 }
 private hazards():SceneObject[]{return [this.pillow,this.blanket,this.bumper,this.toy];}
 private nearestPoint(o:SceneObject,p:vec3,half:vec3):vec3{const t=o.getTransform(),local=t.getInvertedWorldTransform().multiplyPoint(p);return t.getWorldTransform().multiplyPoint(new vec3(Math.max(-half.x,Math.min(half.x,local.x)),Math.max(-half.y,Math.min(half.y,local.y)),Math.max(-half.z,Math.min(half.z,local.z))));}
 private frame():Frame{
  const head=this.doll.head.getTransform().getWorldPosition(),shoulder=this.doll.shoulder.getTransform().getWorldPosition(),hip=this.doll.hip.getTransform().getWorldPosition(),bp=this.bottle.getTransform().getWorldPosition(),tip=this.bottle.getTransform().getWorldTransform().multiplyPoint(new vec3(0,9,0));
  const dir=this.bottle.getTransform().getWorldRotation().multiplyVec3(vec3.up());const bottleDrag=this.bottle.getComponent(SafeNightDraggable.getTypeName()) as SafeNightDraggable;
  const handContact=distance(bp,this.nearestPoint(this.bottleHand,bp,new vec3(6,4,9)))<=this.config.handContactCm;
  const resting=this.hazards().some(o=>distance(bp,this.nearestPoint(o,bp,new vec3(13,4,10)))<=this.config.bottleRestContactCm);
  const inverse=this.crib.getTransform().getInvertedWorldTransform();const size=this.config.sleepSurfacesCm[this.surfaceType]||this.config.cribInteriorCm;
  const hazards=this.hazards().filter(o=>{const world=o.getTransform().getWorldTransform();const offset=o===this.toy?new vec3(0,3.75,0):vec3.zero();const center=inverse.multiplyPoint(world.multiplyPoint(offset));const raw=[new vec3(1,0,0),new vec3(0,1,0),new vec3(0,0,1)].map(a=>inverse.multiplyPoint(world.multiplyPoint(offset.add(a))).sub(center));const lengths=raw.map(a=>Math.hypot(a.x,a.y,a.z));const axes=raw.map((a,i)=>({x:a.x/lengths[i],y:a.y/lengths[i],z:a.z/lengths[i]}));const h=this.hazardExtents(o);return orientedBoxOverlap(center,{x:h.x*lengths[0],y:h.y*lengths[1],z:h.z*lengths[2]},axes,{x:0,y:20,z:0},size);}).map(o=>o.name);
  const normal=this.crib.getTransform().getWorldRotation().multiplyVec3(vec3.up());const face=this.doll.sceneObject.getTransform().getWorldRotation().multiplyVec3(vec3.forward());let sleepDollInside=true;const check=(o:SceneObject)=>{const v=o.getComponent('Component.RenderMeshVisual') as RenderMeshVisual;if(v){const lo=v.localAabbMin(),hi=v.localAabbMax(),world=o.getTransform().getWorldTransform();for(const x of [lo.x,hi.x])for(const y of [lo.y,hi.y])for(const z of [lo.z,hi.z])if(!insideBox(inverse.multiplyPoint(world.multiplyPoint(new vec3(x,y,z))),new vec3(0,20,0),size))sleepDollInside=false;}for(let j=0;j<o.getChildrenCount();j++)check(o.getChild(j));};if(this.session.state==='SleepSpaceCheck')check(this.doll.sceneObject);
  return {head,shoulder,hip,backFacingDeg:Math.acos(Math.max(-1,Math.min(1,face.y)))*180/Math.PI,sleepDollInside,poseAvailable:this.poseAvailable,supportPoints:[this.nearestPoint(this.support,head,new vec3(5,3,8))],bottleHeld:handContact||!!bottleDrag?.held,bottleNearMouth:distance(tip,head.add(new vec3(0,-2,5)))<this.config.mouthContactCm,bottleResting:resting,bottleTilt:Math.asin(Math.min(1,Math.abs(dir.y)))*180/Math.PI,feedSeconds:this.elapsed,location:insideBox(this.armchair.getTransform().getInvertedWorldTransform().multiplyPoint(this.doll.sceneObject.getTransform().getWorldPosition()),this.config.chairVolumeCenter,this.config.chairVolumeSize)?'armchair':'bed',surfaceType:this.surfaceType,surfaceIncline:Math.acos(Math.max(-1,Math.min(1,normal.y)))*180/Math.PI,hazards};
 }
 private hazardExtents(o:SceneObject):Point{if(o===this.blanket)return {x:12,y:1,z:16};if(o===this.bumper)return {x:25,y:4,z:3.5};if(o===this.toy)return {x:5,y:9.75,z:4};return {x:13,y:4,z:10};}
 private resizeSleepSpace():void{const size=this.config.sleepSurfacesCm[this.surfaceType]||this.config.cribInteriorCm;(this.crib.getComponent(SafeNightNurseryMesh.getTypeName()) as SafeNightNurseryMesh).setDimensions(size.x,size.z);}
 private resetDoll():void{
  const tr=this.doll.sceneObject.getTransform();if(this.mode==='breast'){const pose=this.config.breastPracticePoses[this.hold],rotation=this.camera.getTransform().getWorldRotation();tr.setWorldPosition(this.camera.screenSpaceToWorldSpace(new vec2(0.73,0.50),230).add(rotation.multiplyVec3(new vec3(pose.offset[0],pose.offset[1],pose.offset[2]))));tr.setWorldRotation(rotation.multiply(quat.fromEulerAngles(0,0,pose.angle*Math.PI/180)));}else{tr.setLocalPosition(new vec3(-3,-14,5));tr.setLocalRotation(quat.fromEulerAngles(0,0,-65*Math.PI/180));}this.bottle.enabled=this.mode==='bottle';this.bottleHand.enabled=this.mode==='bottle';
  this.moveSupportToHead();const h=this.doll.head?this.doll.head.getTransform().getWorldPosition():new vec3(13,-16,-105);
  this.bottle.getTransform().setWorldPosition(h.add(new vec3(13,-2,8)));this.bottle.getTransform().setWorldRotation(quat.fromEulerAngles(0,0,80*Math.PI/180));this.bottleHand.getTransform().setWorldPosition(this.bottle.getTransform().getWorldPosition().add(new vec3(1,-2,-2)));
 }
 private moveSupportToHead():void{if(this.doll.head)this.support.getTransform().setWorldPosition(this.doll.head.getTransform().getWorldPosition().add(new vec3(0,-3,-2)));}
 private placeDollInCrib():void{const p=this.crib.getTransform().getWorldPosition();this.doll.sceneObject.getTransform().setWorldPosition(this.crib.getTransform().getWorldTransform().multiplyPoint(new vec3(0,10,0)));this.doll.sceneObject.getTransform().setWorldRotation(this.crib.getTransform().getWorldRotation().multiply(quat.fromEulerAngles(-Math.PI/2,0,0)));this.bottle.getTransform().setWorldPosition(p.add(new vec3(65,-10,0)));}
 private updateMarker(cue:Result|null):void{
  const targetAlpha=cue||!this.poseAvailable?1:0;this.markerAlpha+=Math.sign(targetAlpha-this.markerAlpha)*Math.min(Math.abs(targetAlpha-this.markerAlpha),getDeltaTime()/this.config.fadeSeconds);this.cueMarker.enabled=this.markerAlpha>0;if(!this.cueMarker.enabled)return;const mesh=this.cueMarker.getComponent(SafeNightNurseryMesh.getTypeName()) as SafeNightNurseryMesh;mesh.setCueStyle(!this.poseAvailable,this.markerAlpha);
  const target=cue?.anchor==='bottle'?this.bottle:cue?.anchor==='crib'?this.crib:this.doll.head;this.cueMarker.getTransform().setWorldPosition(target.getTransform().getWorldPosition().add(new vec3(0,0,9)));
 }
 private actions(items:[string,string][]):CardAction[]{return items.map(([id,label])=>({id,label}));}
 private render():void{
  const s=this.session.state;this.caregiver.sceneObject.enabled=s==='Feed'&&this.mode==='breast';if(this.caregiver.sceneObject.enabled){this.caregiver.setHold(this.hold);this.caregiver.sceneObject.getTransform().setWorldPosition(this.camera.screenSpaceToWorldSpace(new vec2(0.25,0.51),115));this.caregiver.sceneObject.getTransform().setWorldRotation(this.camera.getTransform().getWorldRotation());}let data:CardData={eyebrow:this.copy.ui.safe_night_simulation,title:this.copy.ui.safe_night,body:'',detail:'',tone:'neutral',actions:[]};
  this.card.setAnchor(this.camera.screenSpaceToWorldSpace(new vec2(0.5,0.24),90));this.card.setFacing(this.camera.getTransform().getWorldRotation());this.card.setControlsAnchor(this.camera.screenSpaceToWorldSpace(new vec2(0.5,0.55),90));
  const destination=this.crib.getTransform().getWorldPosition();const wayfinding=['SleepyResponse','BabyAsleep','Handoff','SleepSpaceCheck'].includes(s)&&!this.camera.isSphereVisible(destination,8);const projected=this.camera.worldSpaceToScreenSpace(destination);const left=projected.x<0.5;this.card.setWayfinder(wayfinding?(left?this.copy.ui.sleep_space:this.copy.ui.sleep_space_3):'',this.camera.screenSpaceToWorldSpace(new vec2(left?0.14:0.86,0.48),90));
  if(s==='Welcome'){data.eyebrow=this.copy.ui.a_quiet_practice_01;data.title=this.copy.welcomeTitle;data.body=this.copy.disclaimer;data.detail=this.copy.ui.no_monitoring_no_clinical_assessment_all_guidance_is_pending_clin;data.actions=this.actions([['begin',this.copy.ui.enter_the_nursery]]);}
  else if(s==='Prepare'){
   data.eyebrow=this.copy.ui.prepare+(this.prepareStep+1)+this.copy.ui.of_3;
   if(this.prepareStep===0){data.title=this.copy.ui.make_room_for_quiet;data.body=this.copy.ui.choose_a_feeding_practice_you_will_use_a_virtual_newborn_doll;data.detail=this.copy.ui.both_modes_use_the_same_evidence_aware_engine;data.actions=this.actions([['bottle',this.copy.ui.bottle_practice],['breast',this.copy.ui.breast_practice]]);}
   else if(this.prepareStep===1){data.title=this.redirect?this.copy.ui.a_separate_space: this.copy.ui.choose_a_sleep_space;data.body=this.redirect?this.copy.redirect:this.copy.ui.selected+this.copy.surfaces[this.surfaceType]+this.copy.ui.this_is_a_simulated_surface_choice;data.detail=this.copy.ui.firmness_is_a_user_confirmation_later_an_adult_bed_or_sofa_is_red;data.tone=this.redirect?'attention':'neutral';data.actions=this.actions([['cycle-surface',this.copy.ui.next_surface],['select-surface',this.copy.ui.use_this_surface],['adult-bed',this.copy.ui.adult_bed],['sofa',this.copy.ui.sofa]]);}
   else{data.title=this.copy.ui.a_nursery_at_real_size;data.body=this.copy.ui.the_doll_and_supporting_arm_are_in_front_of_you_the_infant_sleep_;data.detail=this.copy.ui.pinch_to_move_the_doll_bottle_or_soft_objects+this.voiceStatus;data.actions=this.actions([['place',this.copy.ui.start_practice],['voice',this.enableVoice?this.copy.ui.turn_voice_off:this.copy.ui.try_voice]]);}
  }
  else if(s==='Feed'){
   data.compact=true;const head=this.doll.head.getTransform().getWorldPosition();const cueScreen=this.camera.worldSpaceToScreenSpace(head.add(new vec3(-12,22,0)));this.card.setAnchor(this.camera.screenSpaceToWorldSpace(new vec2(Math.max(0.43,Math.min(0.57,cueScreen.x)),this.mode==='breast'?0.12:Math.max(0.17,Math.min(0.25,cueScreen.y))),90));this.card.setControlsAnchor(this.camera.screenSpaceToWorldSpace(new vec2(0.5,0.74),90));
   const cue=this.results.find(r=>r.id===this.activeCue),unknown=this.results.some(r=>r.evidence==='UNKNOWN');
   data.eyebrow=this.copy.modes[this.mode]+this.copy.ui.practice+(unknown?this.copy.ui.unknown:this.copy.ui.modeled);data.title=unknown?this.copy.ui.position_unavailable:cue?this.copy.ui.a_small_adjustment:this.copy.ui.a_quieter_moment;data.tone=unknown?'unknown':cue?'attention':'clear';
   data.body=unknown?this.copy.unknown:cue?cue.cue:this.mode==='breast'?this.copy.breastHolds[this.hold]:this.copy.ui.move_the_doll_gently_cues_wait_for_a_sustained_change_nothing_her;
   data.detail=this.voiceStatus+'\n'+(getTime()<this.pausedUntil?this.copy.ui.pause_in_progress:unknown?this.copy.ui.missing_input_is_never_a_pass:this.mode==='breast'?this.copy.referenceDetail:this.copy.ui.head_and_neck_use_simulated_support_geometry);
   data.actions=this.actions([['sleepy',this.copy.ui.im_sleepy],['asleep',this.copy.ui.babys_asleep],['pause',this.copy.ui.offer_a_pause],[this.mode==='breast'?'hold':'input',this.mode==='breast'?this.copy.ui.change_hold:this.poseAvailable?this.copy.ui.simulate_input_loss:this.copy.ui.restore_input]]);
  }
  else if(s==='SleepyResponse'||s==='BabyAsleep'){data.eyebrow=this.copy.ui.handoff_when_you_are_ready;data.title=s==='SleepyResponse'?this.copy.ui.feeling_sleepy:this.copy.ui.baby_asleep;data.body=s==='SleepyResponse'?this.copy.sleepy:this.copy.asleep;data.detail=this.directionToCrib();data.tone='attention';data.actions=this.actions([['handoff',this.copy.ui.find_the_sleep_space]]);if(!this.chimePlayed){this.chime.play(1);this.chimePlayed=true;}}
  else if(s==='Handoff'){data.eyebrow=this.copy.ui.handoff_virtual_doll;data.title=this.copy.ui.toward_a_separate_space;data.body=this.copy.ui.place_the_virtual_doll_in_the_chosen_infant_sleep_space;data.detail=this.directionToCrib()+this.copy.ui.this_button_moves_the_simulated_doll;data.actions=this.actions([['place-doll',this.copy.ui.place_the_doll]]);}
  else if(s==='SleepSpaceCheck'){
   this.card.setAnchor(this.camera.screenSpaceToWorldSpace(new vec2(0.5,0.10),90));this.card.setControlsAnchor(this.camera.screenSpaceToWorldSpace(new vec2(0.5,0.74),90));
   const cue=this.results.find(r=>r.id===this.activeCue);const unknown=this.results.some(r=>r.evidence==='UNKNOWN');data.eyebrow=this.copy.ui.sleep_space_52+(unknown?this.copy.ui.unknown:this.copy.ui.modeled);data.title=cue?.id==='SLEEP-BACK'?this.copy.ui.sleep_back_title:cue?.id==='SLEEP-IN-SPACE'?this.copy.ui.sleep_inside_title:cue?this.copy.ui.make_the_space_clear:this.copy.ui.check_the_sleep_space;data.body=unknown?this.copy.ui.the_surface_cannot_be_fully_checked:cue?cue.cue:this.copy.ui.no_modeled_hazards_are_present_this_does_not_establish_real_world;data.tone=unknown?'unknown':cue?'attention':'clear';data.detail=this.firmnessConfirmed?this.copy.ui.firm_and_flat_user_confirmed_simulation_observations_are_listed_s:this.copy.ui.confirm_that_the_chosen_infant_surface_is_firm_and_flat_this_cann;
   data.actions=this.actions([['clear-hazards',this.copy.ui.remove_soft_objects],['hazard',this.copy.ui.add_demo_pillow],[this.firmnessConfirmed?'finish':'confirm-surface',this.firmnessConfirmed?this.copy.ui.review_session:this.copy.ui.i_confirm_the_surface],[!this.poseAvailable?'input':this.results.some(r=>['SLEEP-BACK','SLEEP-IN-SPACE'].includes(r.id)&&r.violated===true)?'on-back':'try-side',!this.poseAvailable?this.copy.ui.restore_input:this.results.some(r=>['SLEEP-BACK','SLEEP-IN-SPACE'].includes(r.id)&&r.violated===true)?this.copy.ui.place_on_back:this.copy.ui.try_side_pose]]);
  }
  else if(s==='Done'){
   const summary=summarizeEvidence(Object.keys(this.evidence).map(k=>this.evidence[k]));const pages:{title:string,body:string}[]=[];for(let n=0;n<summary.modeled.length;n+=3)pages.push({title:this.copy.review.modeled,body:summary.modeled.slice(n,n+3).map(id=>this.ruleLabels[id]).join('\n')});pages.push({title:this.copy.review.confirmed,body:this.firmnessConfirmed?this.copy.review.surface:this.copy.review.none});pages.push({title:this.copy.review.unknown,body:summary.unknown.length?summary.unknown.map(id=>this.ruleLabels[id]).join('\n'):this.copy.review.noMissing});pages.push({title:this.copy.review.notChecked,body:this.copy.review.unverified});const page=pages[this.reviewPage%pages.length];data.eyebrow=this.copy.ui.session_review_no_score;data.title=page.title;data.body=page.body;data.detail=this.copy.review.detail+' '+(this.reviewPage%pages.length+1)+this.copy.ui.text+pages.length;data.actions=this.actions([['next-review',this.copy.review.next],['restart',this.copy.ui.practice_again]]);
  }
  const key=JSON.stringify(data);if(key!==this.lastCard){this.lastCard=key;this.card.show(data);}
 }
 private directionToCrib():string{const p=this.camera.worldSpaceToScreenSpace(this.crib.getTransform().getWorldPosition());return p.x>1?this.copy.ui.sleep_space_to_your_right:p.x<0?this.copy.ui.sleep_space_to_your_left:p.y>1?this.copy.ui.sleep_space_below_your_view:p.y<0?this.copy.ui.sleep_space_above_your_view:this.copy.ui.sleep_space_look_to_your_right;}
 private startVoice():void{
  try{this.asr=require('LensStudio:AsrModule');const options=AsrModule.AsrTranscriptionOptions.create();options.mode=AsrModule.AsrMode.HighAccuracy;options.silenceUntilTerminationMs=1000;options.onTranscriptionUpdateEvent.add(e=>{const command=voiceCommand(e.text,e.isFinal);if(command)this.inputQueue.push(command);});options.onTranscriptionErrorEvent.add(code=>{this.voiceStatus=this.copy.voiceUnavailable;this.lastCard='';print('[SafeNight] ASR fallback status: '+code);});this.asr.startTranscribing(options);this.voiceStatus=this.copy.voiceOn;}catch(e){this.voiceStatus=this.copy.voiceUnavailable;print('[SafeNight] ASR fallback: '+String(e));}
 }
}
