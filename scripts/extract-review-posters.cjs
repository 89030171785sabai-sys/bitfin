// Extract selected frames directly from original recordings. No face generation or upscaling.
// Usage: node scripts/extract-review-posters.cjs <ffmpeg.exe> <originals-directory>
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const [ffmpeg,source]=process.argv.slice(2);
if(!ffmpeg||!source)throw Error('Pass ffmpeg executable and originals directory');
const selected={kursk:11.5,prazhskaya:3.5,'sokol-sergey':2.5,kashirskaya:4.5,ekaterinburg:2.5,shabolovskaya:10.5,molodezhnaya:6.5,akademicheskaya:7.5,semenovskaya:9.5,chelyabinsk:2.5,'sokol-monika':5.5,piter:5.5};
const out=path.resolve(__dirname,'../dist/assets/media');
for(const [name,time] of Object.entries(selected)){
 const input=path.join(source,'review-'+name+(name==='ekaterinburg'?'.mov':'.mp4'));
 const result=cp.spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-ss',String(time),'-i',input,'-frames:v','1','-q:v','2','-y',path.join(out,'review-'+name+'-original.jpg')],{encoding:'utf8'});
 if(result.status!==0)throw Error(result.stderr);
 console.log(name+': original frame at '+time+' seconds');
}
