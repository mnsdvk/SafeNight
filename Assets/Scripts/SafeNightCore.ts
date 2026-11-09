// Pure simulation logic. No Lens, DOM or device APIs. All distances are centimeters.
export type Point = {x:number,y:number,z:number};
export type Evidence = 'MODELED'|'CONFIRMED'|'UNKNOWN';
export function voiceCommand(text:string,isFinal:boolean):'sleepy'|'asleep'|null {if(!isFinal)return null;const phrase=text.toLowerCase().replace(/[’']/g,'').replace(/[^a-z ]/g,'').trim().replace(/\s+/g,' ');if(/^(im sleepy|i am sleepy)$/.test(phrase))return 'sleepy';if(/^(babys asleep|baby is asleep|the baby is asleep)$/.test(phrase))return 'asleep';return null;}
export type Rule = {id:string,mode:string,condition:string,priority:number,anchor:string,cue:string,source:string,status:string,evidenceLevel:Evidence};
export type Result = Rule & {active:boolean,violated:boolean|null,evidence:Evidence};
export type Frame = {head?:Point,shoulder?:Point,hip?:Point,supportPoints?:Point[],bottleHeld?:boolean,bottleNearMouth?:boolean,bottleResting?:boolean,bottleTilt?:number,feedSeconds?:number,location?:string,surfaceType?:string,surfaceIncline?:number,hazards?:string[],poseAvailable?:boolean,backFacingDeg?:number,sleepDollInside?:boolean};
export function finitePoint(p:Point|undefined):boolean {return !!p && [p.x,p.y,p.z].every(Number.isFinite);}
export function distance(a:Point,b:Point):number {return Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);}
export function angleDegrees(a:Point,b:Point):number|null {const d=Math.hypot(a.x,a.y,a.z)*Math.hypot(b.x,b.y,b.z);return !d||!Number.isFinite(d)?null:Math.acos(Math.max(-1,Math.min(1,(a.x*b.x+a.y*b.y+a.z*b.z)/d)))*180/Math.PI;}
export function insideBox(p:Point,c:Point,s:Point):boolean {return finitePoint(p)&&finitePoint(c)&&finitePoint(s)&&Math.abs(p.x-c.x)<=s.x/2&&Math.abs(p.y-c.y)<=s.y/2&&Math.abs(p.z-c.z)<=s.z/2;}
export function boxesOverlap(p:Point,half:Point,c:Point,s:Point):boolean {return finitePoint(p)&&finitePoint(half)&&finitePoint(c)&&finitePoint(s)&&Math.abs(p.x-c.x)<=s.x/2+half.x&&Math.abs(p.y-c.y)<=s.y/2+half.y&&Math.abs(p.z-c.z)<=s.z/2+half.z;}
export function orientedBoxOverlap(p:Point,half:Point,axes:Point[],c:Point,size:Point):boolean {
 if(!finitePoint(p)||!finitePoint(half)||!finitePoint(c)||!finitePoint(size)||axes.length!==3||!axes.every(finitePoint))return false;
 const dot=(a:Point,b:Point)=>a.x*b.x+a.y*b.y+a.z*b.z;
 const cross=(a:Point,b:Point):Point=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
 const basis:Point[]=[{x:1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:0,z:1}];const candidates=[...basis,...axes];for(const a of basis)for(const b of axes)candidates.push(cross(a,b));
 const delta={x:p.x-c.x,y:p.y-c.y,z:p.z-c.z};
 for(const a of candidates){if(dot(a,a)<1e-12)continue;const radiusA=(size.x*Math.abs(a.x)+size.y*Math.abs(a.y)+size.z*Math.abs(a.z))/2;const radiusB=half.x*Math.abs(dot(a,axes[0]))+half.y*Math.abs(dot(a,axes[1]))+half.z*Math.abs(dot(a,axes[2]));if(Math.abs(dot(delta,a))>radiusA+radiusB+1e-7)return false;}return true;
}
export function validateRegistry(rules:Rule[]):string[]{const errors:string[]=[];const seen=new Set<string>();for(const r of rules){if(seen.has(r.id))errors.push('duplicate '+r.id);seen.add(r.id);if(!r.source||!r.source.startsWith('https://'))errors.push('source '+r.id);if(!['sourced-secondary','clinician-reviewed','unverified'].includes(r.status))errors.push('status '+r.id);if(!['shared','bottle','breast','sleep'].includes(r.mode))errors.push('mode '+r.id);if(!['headRise','alignment','support','propped','pacing','location','incline','hazards','separate','back','inSurface'].includes(r.condition))errors.push('condition '+r.id);if(!r.cue||!Number.isFinite(r.priority))errors.push('cue/priority '+r.id);}return errors;}
export class DwellGate {
 active=false; private since:number|null=null; private direction:boolean|null=null;
 private appearMs:number; private clearMs:number;
 constructor(appearMs:number,clearMs:number){this.appearMs=appearMs;this.clearMs=clearMs;}
 reset():void{this.active=false;this.since=null;this.direction=null;}
 update(wrong:boolean|null,now:number):boolean{
  if(wrong===null){this.since=null;this.direction=null;return this.active;}
  if(wrong===this.active){this.since=null;this.direction=null;return this.active;}
  if(this.direction!==wrong){this.direction=wrong;this.since=now;}
  if(now-(this.since as number)>=(wrong?this.appearMs:this.clearMs)){this.active=wrong;this.since=null;this.direction=null;}
  return this.active;
 }
}
export class RuleEngine {
 private rules:Rule[];private config:any;private gates:{[id:string]:DwellGate}={};
 constructor(rules:Rule[],config:any){const errors=validateRegistry(rules);if(errors.length)throw Error(errors.join('; '));this.rules=rules;this.config=config;for(const r of rules)this.gates[r.id]=new DwellGate(config.appearMs,config.clearMs);}
 reset():void{for(const key of Object.keys(this.gates))this.gates[key].reset();}
 private threshold(value:number,enter:number,exit:number,high:boolean):boolean|null {if(!Number.isFinite(value))return null;if(high)return value>enter?true:value<=exit?false:null;return value<enter?true:value>=exit?false:null;}
 private condition(r:Rule,f:Frame):boolean|null {
  const c=this.config;
  if(r.mode!=='sleep'&&(!f.poseAvailable||!finitePoint(f.head)||!finitePoint(f.shoulder)||!finitePoint(f.hip)))return null;
  const h=f.head as Point,s=f.shoulder as Point,p=f.hip as Point;
  switch(r.condition){
   case 'headRise':return this.threshold(h.y-p.y,c.headRiseEnterCm,c.headRiseExitCm,false);
   case 'alignment':{const angle=angleDegrees({x:h.x-s.x,y:h.y-s.y,z:h.z-s.z},{x:s.x-p.x,y:s.y-p.y,z:s.z-p.z});return angle===null?null:this.threshold(angle,c.alignmentEnterDeg,c.alignmentExitDeg,true);}
   case 'support':if(!f.supportPoints||!f.supportPoints.length||!f.supportPoints.every(finitePoint))return null;return this.threshold(Math.min(...f.supportPoints.map(v=>distance(v,h))),c.supportEnterCm,c.supportExitCm,true);
   case 'propped':if(typeof f.bottleHeld!=='boolean'||typeof f.bottleResting!=='boolean'||typeof f.bottleNearMouth!=='boolean')return null;return f.bottleNearMouth&&!f.bottleHeld&&f.bottleResting;
   case 'pacing':if(!Number.isFinite(f.bottleTilt)||!Number.isFinite(f.feedSeconds))return null;return this.threshold(Math.abs(f.bottleTilt as number),c.bottleEnterDeg,c.bottleExitDeg,true)===true||(f.feedSeconds as number)>=c.pauseIntervalSeconds?true:Math.abs(f.bottleTilt as number)<=c.bottleExitDeg?false:null;
   case 'location':return typeof f.location==='string'?['sofa','armchair'].includes(f.location):null;
   case 'back':return f.poseAvailable&&Number.isFinite(f.backFacingDeg)?this.threshold(f.backFacingDeg as number,c.backFacingEnterDeg,c.backFacingExitDeg,true):null;
   case 'inSurface':return f.poseAvailable&&typeof f.sleepDollInside==='boolean'?!f.sleepDollInside:null;
   case 'incline':return Number.isFinite(f.surfaceIncline)?Math.abs(f.surfaceIncline as number)>c.sleepInclineMaxDeg:null;
   case 'hazards':return Array.isArray(f.hazards)?f.hazards.length>0:null;
   case 'separate':return typeof f.surfaceType==='string'?!['crib','bassinet','play yard','other firm flat infant surface'].includes(f.surfaceType):null;
   default:return null;
  }
 }
 evaluate(frame:Frame,mode:string,now:number):Result[]{return this.rules.filter(r=>r.mode===mode||(mode!=='sleep'&&r.mode==='shared')).map(r=>{
  const invalid=r.mode!=='sleep'&&(!frame.poseAvailable||!finitePoint(frame.head)||!finitePoint(frame.shoulder)||!finitePoint(frame.hip));
  const v=this.condition(r,frame);const g=this.gates[r.id];
  // A value inside the hysteresis band is known, whereas absent input is unknown.
  const band=!invalid&&v===null&&['headRise','alignment','support','pacing','back'].includes(r.condition)&&this.hasSamples(r,frame);
  if(v===null&&!band){g.reset();return {...r,active:false,violated:null,evidence:'UNKNOWN' as Evidence};}
  return {...r,active:g.update(v,now),violated:v===null?g.active:v,evidence:'MODELED' as Evidence};
 });}
 private hasSamples(r:Rule,f:Frame):boolean{if(r.condition==='back')return !!f.poseAvailable&&Number.isFinite(f.backFacingDeg);if(r.condition==='support')return !!f.supportPoints&&f.supportPoints.length>0&&f.supportPoints.every(finitePoint);if(r.condition==='pacing')return Number.isFinite(f.bottleTilt)&&Number.isFinite(f.feedSeconds);if(r.condition==='alignment'){const h=f.head as Point,s=f.shoulder as Point,p=f.hip as Point;return distance(h,s)>0&&distance(s,p)>0;}return true;}
}
export class PromptArbiter {
 private current:string|null=null;private cooldownMs:number;private cleared:{[id:string]:number}={};
 constructor(cooldownMs:number){this.cooldownMs=cooldownMs;}
 reset():void{this.current=null;this.cleared={};}
 select<T extends {id:string,priority:number,active:boolean}>(items:T[],now:number):T|null{
  const active=items.filter(x=>x.active).sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));
  if(this.current&&!active.some(x=>x.id===this.current)){this.cleared[this.current]=now;this.current=null;}
  const next=active.find(x=>x.id===this.current||this.cleared[x.id]===undefined||now-this.cleared[x.id]>=this.cooldownMs)||null;
  this.current=next?next.id:null;return next;
 }
}
const TRANSITIONS:{[key:string]:string[]}={Welcome:['Prepare'],Prepare:['Feed'],Feed:['SleepyResponse','BabyAsleep'],SleepyResponse:['Handoff'],BabyAsleep:['Handoff'],Handoff:['SleepSpaceCheck'],SleepSpaceCheck:['Done'],Done:[]};
export class SessionState {state='Welcome';history=['Welcome'];go(next:string):boolean{if(!TRANSITIONS[this.state].includes(next))return false;this.state=next;this.history.push(next);return true;}restart():void{this.state='Welcome';this.history=['Welcome'];}}
export function summarizeEvidence(results:{id:string,evidence:Evidence,violated:boolean|null}[]):{modeled:string[],confirmed:string[],unknown:string[],passed:string[],attention:string[]} {const s={modeled:[] as string[],confirmed:[] as string[],unknown:[] as string[],passed:[] as string[],attention:[] as string[]};for(const r of results){if(r.evidence==='UNKNOWN'||r.violated===null){s.unknown.push(r.id);continue;}if(r.evidence==='CONFIRMED')s.confirmed.push(r.id);else s.modeled.push(r.id);if(r.violated===false)s.passed.push(r.id);else s.attention.push(r.id);}return s;}
