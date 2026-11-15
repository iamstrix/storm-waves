/* AI assistance: original Codex shield, wave, timing, and impact effects. */
import {disc,oval} from './art.js?v=3';
import {clamp} from './config.js?v=3';

export function waveGeometry(game,sunX,sunY,baseX,baseY,scale,width){
  const warning=game.state.phase==='warning';
  const progress=clamp(game.state.phaseTime/(warning?game.warningDuration:game.stormDuration),0,1);
  const depth=warning?progress*progress:1+progress*1.45;
  const impactWidth=Math.min(width*.7,(220+game.event.halfAngleDeg*2.5)*scale);
  return {warning,progress,x:warning?sunX+(baseX-sunX)*progress:baseX,
    y:warning?sunY+(baseY-138*scale-sunY)*progress:baseY-138*scale+progress*285*scale,
    halfWidth:12+impactWidth*depth,rise:(18+impactWidth*.18)*Math.min(1.6,depth),
    fade:warning?Math.min(1,.25+progress):1-clamp((progress-.72)/.28,0,1)};
}

export function storm(c,game,sunX,sunY,baseX,baseY,scale,time){
  const g=waveGeometry(game,sunX,sunY,baseX,baseY,scale,c.canvas.width/(c.getTransform().a||1));
  const {x,y,halfWidth:width,rise,progress,warning,fade}=g;
  c.save();c.globalAlpha=fade;c.lineCap='round';
  // The incoming front sits above the habitat; during impact it sweeps IN FRONT.
  // The shield rejects the wave at its outer surface instead of letting it cross the crew.
  if(game.state.shield){
    c.beginPath();c.rect(-5000,-5000,10000,10000);
    c.moveTo(baseX-147*scale,baseY+5*scale);
    c.ellipse(baseX,baseY+5*scale,147*scale,137*scale,0,Math.PI,Math.PI*2);
    c.closePath();c.clip('evenodd');
  }
  const front=(offset=0)=>{c.beginPath();c.moveTo(x-width,y-rise+offset);c.bezierCurveTo(x-width*.64,y+rise*.35+offset,x+width*.64,y+rise*.35+offset,x+width,y-rise+offset);};
  // A luminous, deep curtain and several trailing fronts create perspective.
  const heat=c.createLinearGradient(0,y-rise-75*scale,0,y+12*scale);
  heat.addColorStop(0,'#ff763000');heat.addColorStop(.65,'#ff8a3820');heat.addColorStop(1,'#ffc66b55');
  front();c.lineTo(x+width,y-rise-60*scale);c.bezierCurveTo(x+width*.6,y-65*scale,x-width*.6,y-65*scale,x-width,y-rise-60*scale);c.closePath();c.fillStyle=heat;c.fill();
  for(let i=4;i>=0;i--){
    front(-i*(7+progress*5)*scale);c.strokeStyle=['#fff1bb','#ffd285b8','#ffaf655c','#ff863530','#ff763015'][i];
    c.lineWidth=(i?4+i*3:3.2+progress*2.3)*Math.max(.65,scale);
    c.shadowColor='#ff9f43';c.shadowBlur=i===0?18:0;c.stroke();
  }
  c.shadowBlur=0;
  for(let i=0;i<38;i++){
    const u=(Math.sin(i*2.399+time*.12)+1)/2,px=x+(u*2-1)*width;
    const py=y-rise+4*rise*u*(1-u),trail=(5+i%5*3)*(warning?.5+progress:1.5);
    c.globalAlpha=fade*(.3+(i%4)*.16);c.strokeStyle=i%3?'#ffd68b':'#fff2bd';c.lineWidth=(1+i%3*.4)*Math.max(.6,scale);
    c.beginPath();c.moveTo(px-(u-.5)*trail,py-trail*scale);c.lineTo(px,py);c.stroke();
  }
  c.restore();
}

export function timing(c,x,y,scale,remaining){
  if(remaining>3||remaining<=0)return;
  c.save();c.translate(x,y+16*scale);c.scale(scale,.26*scale);c.strokeStyle='#9fe6db26';c.lineWidth=3;c.beginPath();c.arc(0,0,154,0,Math.PI*2);c.stroke();
  c.strokeStyle=remaining>1.2?'#b6d7a64d':'#b4f1c288';c.lineWidth=5;c.beginPath();c.arc(0,0,154,-Math.PI/2,-Math.PI/2+(1-remaining/3)*Math.PI*2);c.stroke();c.restore();
}

export function shield(c,x,y,scale,time,impact=0,growth=1){
  c.save();c.translate(x,y);c.scale(scale,scale);c.globalAlpha=growth;
  const radius=147*(.93+.07*growth),height=137*(.93+.07*growth);
  const glow=c.createRadialGradient(0,0,20,0,0,radius);glow.addColorStop(0,'#72eed808');glow.addColorStop(.65,'#80f8e216');glow.addColorStop(.94,'#8df3df33');glow.addColorStop(1,'#a9fff36b');
  c.beginPath();c.ellipse(0,5,radius,height,0,Math.PI,Math.PI*2);c.closePath();c.fillStyle=glow;c.fill();
  c.save();c.clip();c.strokeStyle='#a0f5e317';c.lineWidth=.8;
  for(let row=-6;row<2;row++)for(let col=-6;col<7;col++){
    const hx=col*27+(row%2)*13.5,hy=row*23+((time*3)%23);c.beginPath();for(let i=0;i<6;i++){const a=i/6*Math.PI*2;i?c.lineTo(hx+Math.cos(a)*15,hy+Math.sin(a)*15):c.moveTo(hx+Math.cos(a)*15,hy+Math.sin(a)*15);}c.closePath();c.stroke();
  }
  if(impact){const g=c.createRadialGradient(-50,-93,0,-50,-93,115);g.addColorStop(0,'#bcffe42b');g.addColorStop(1,'#bcffe400');disc(c,-50,-93,115,g);}
  c.restore();
  c.shadowColor='#77efd9';c.shadowBlur=13;c.strokeStyle='#94f5dd';c.lineWidth=2.7;c.beginPath();c.ellipse(0,5,radius,height,0,Math.PI,Math.PI*2);c.stroke();c.shadowBlur=0;
  c.strokeStyle='#c6fff533';c.lineWidth=1.5;c.beginPath();c.ellipse(0,5,radius-5,height-5,0,Math.PI,Math.PI*2);c.stroke();
  oval(c,0,8,radius,9,'#74ddc817');
  if(impact)for(let i=0;i<12;i++){
    const life=(time*1.7+i*.137)%1,a=Math.PI*1.1+(i%7)*.11,r=radius+life*27;
    c.globalAlpha=(1-life)*.7;disc(c,Math.cos(a)*r,5+Math.sin(a)*height-life*15,.7+(i%3)*.4,i%2?'#b8ffe7':'#ffdd94');
  }
  c.restore();
}
