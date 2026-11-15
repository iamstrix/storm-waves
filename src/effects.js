/* AI assistance: original Codex shield, wave, timing, and impact effects. */
import {disc,oval} from './art.js?v=2';
import {clamp} from './config.js?v=2';

export function storm(c,game,sunX,sunY,baseX,baseY,scale,time){
  const s=game.state,distance=Math.hypot(baseX-sunX,baseY-sunY),angle=Math.atan2(baseY-sunY,baseX-sunX);
  const warning=s.phase==='warning',progress=warning?clamp(s.phaseTime/game.warningDuration,0,1):clamp(s.phaseTime/game.stormDuration,0,1);
  const radius=distance*(warning?.08+.92*progress:1+progress*.23),spread=.19+game.event.halfAngleDeg*.005;
  c.save();c.lineCap='round';
  for(let i=5;i>=0;i--){
    c.strokeStyle=['#ffdc94','#ffc174b0','#ffac624d','#ff9d5426','#ff9d5415','#ff9d5409'][i];
    c.lineWidth=(i?3+i*2:3)*Math.max(.65,scale);c.beginPath();c.arc(sunX,sunY,Math.max(3,radius-i*7*scale),angle-spread,angle+spread);c.stroke();
  }
  for(let i=0;i<30;i++){
    const a=angle+Math.sin(i*2.399+time*.1)*spread,r=radius-(i%7)*6*scale;
    const px=sunX+Math.cos(a)*r,py=sunY+Math.sin(a)*r;c.globalAlpha=.3+(i%4)*.16;
    c.strokeStyle='#ffe3a1';c.lineWidth=(.8+(i%3)*.4)*scale;c.beginPath();c.moveTo(px-Math.cos(a)*6*scale,py-Math.sin(a)*6*scale);c.lineTo(px,py);c.stroke();
  }
  c.globalAlpha=1;c.restore();
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
