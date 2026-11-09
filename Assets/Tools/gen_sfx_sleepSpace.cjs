const fs=require('node:fs'),path=require('node:path');
if(!process.env.CLAD_SFX_TOOLS)throw Error('Set CLAD_SFX_TOOLS to the installed CLAD build-sfx/tools directory. The generated WAV is already included.');
const audio=require(path.resolve(process.env.CLAD_SFX_TOOLS));
const PROJECT_ASSETS_SFX=path.resolve(__dirname,'../GeneratedSFX');fs.mkdirSync(PROJECT_ASSETS_SFX,{recursive:true});
const raw=audio.sfx_presets.uiNotify({seed:824});
const result=audio.mix_bus.applyFx(raw,{gain:0.18,lpf:2200});
audio.WavBuilder.write(result,path.join(PROJECT_ASSETS_SFX,'sleepSpace.wav'));
console.log(path.join(PROJECT_ASSETS_SFX,'sleepSpace.wav'));
