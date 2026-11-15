/* AI assistance: original Codex procedural space, solar corona, Martian terrain, and dust. */
import {disc,oval} from './art.js?v=2';
const random = n => {const value=Math.sin(n*127.1+311.7)*43758.5453;return value-Math.floor(value);};

export function makeSky(w,h,ratio){
  const canvas=document.createElement('canvas');canvas.width=w*ratio;canvas.height=h*ratio;
  const c=canvas.getContext('2d');c.scale(ratio,ratio);
  const bg=c.createLinearGradient(0,0,w*.3,h);bg.addColorStop(0,'#07162b');bg.addColorStop(.55,'#12283e');bg.addColorStop(1,'#33414b');c.fillStyle=bg;c.fillRect(0,0,w,h);
  for(let i=0;i<8;i++){
    const x=w*(.25+random(i)*.8),y=h*(.05+random(i+9)*.48),r=w*(.12+random(i+6)*.2);
    const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,i%2?'#4e487d0f':'#277a8110');g.addColorStop(1,'#17294600');disc(c,x,y,r,g);
  }
  for(let i=0;i<150;i++){
    c.globalAlpha=.2+random(i+700)*.5;disc(c,random(i+400)*w,random(i+500)*h*.72,.35+random(i+600)*1.1,i%7?'#c2d7d5':'#f6d8b2');
  }
  c.globalAlpha=1;return canvas;
}

export function drawSun(c,x,y,r,time){
  c.save();c.translate(x,y);
  const halo=c.createRadialGradient(0,0,r*.5,0,0,r*3.5);halo.addColorStop(0,'#ffdc9438');halo.addColorStop(.35,'#ffb05a20');halo.addColorStop(.72,'#fc986509');halo.addColorStop(1,'#ffad4b00');disc(c,0,0,r*3.5,halo);
  c.save();c.rotate(time*.035);c.globalCompositeOperation='screen';
  for(let i=0;i<30;i++){
    const a=i/30*Math.PI*2,reach=r*(1.2+random(i+30)*.43+Math.sin(time*.75+i)*.08);
    c.strokeStyle=i%3?'#ffb76b26':'#ffc47a4d';c.lineWidth=i%3?1.5:2.5;c.lineCap='round';c.beginPath();
    c.moveTo(Math.cos(a)*r*.9,Math.sin(a)*r*.9);c.quadraticCurveTo(Math.cos(a+.045)*reach,Math.sin(a+.045)*reach,Math.cos(a+.085)*r,Math.sin(a+.085)*r);c.stroke();
  }
  for(let i=0;i<3;i++){
    const a=i*2.1+Math.sin(time*.17+i)*.12;c.save();c.rotate(a);c.strokeStyle='#ffb97055';c.lineWidth=1.3;c.beginPath();c.moveTo(r*.82,-r*.54);c.bezierCurveTo(r*(1.5+i*.1),-r*.8,r*1.38,r*.15,r*.95,r*.2);c.stroke();c.restore();
  }
  c.restore();
  const surface=c.createRadialGradient(-r*.35,-r*.35,r*.1,0,0,r);surface.addColorStop(0,'#fff8cc');surface.addColorStop(.55,'#ffe29a');surface.addColorStop(.88,'#ffc16c');surface.addColorStop(1,'#eb985b');disc(c,0,0,r,surface);
  c.save();c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.clip();c.rotate(time*.018);
  for(let i=0;i<27;i++){const a=random(i+40)*Math.PI*2,d=Math.sqrt(random(i+80))*r;oval(c,Math.cos(a)*d,Math.sin(a)*d,2+random(i+90)*r*.1,1+random(i+100)*r*.07,i%3?'#fff6c30e':'#de904d19');}
  c.restore();c.strokeStyle='#ffe6a780';c.lineWidth=1;c.beginPath();c.arc(0,0,r-.5,Math.PI*.7,Math.PI*1.7);c.stroke();c.restore();
}

export function drawTerrain(c,w,h,horizon,time){
  const haze=c.createRadialGradient(w*.2,horizon,0,w*.2,horizon,w*.75);haze.addColorStop(0,'#f9a76518');haze.addColorStop(.6,'#b76b5108');haze.addColorStop(1,'#bd795100');c.fillStyle=haze;c.fillRect(0,0,w,h);
  for(let layer=0;layer<3;layer++){
    const heightScale=Math.min(1,horizon/500);c.beginPath();c.moveTo(-30,h);let lastX=-w*.1,lastY=horizon-30;
    c.lineTo(lastX,lastY);for(let i=0;i<=14;i++){
      const x=i/13*w,y=horizon+((layer-2)*20-(18+random(i+layer*45)*50)*(1-layer*.2))*heightScale;
      c.quadraticCurveTo(lastX,lastY,(lastX+x)/2,(lastY+y)/2);lastX=x;lastY=y;
    }c.lineTo(w+20,h);c.closePath();c.fillStyle=['#303544','#5e3f43','#895347'][layer];c.fill();
  }
  const ground=c.createLinearGradient(0,horizon,0,h);ground.addColorStop(0,'#c58259');ground.addColorStop(.35,'#ac684b');ground.addColorStop(1,'#77453c');
  c.beginPath();c.moveTo(0,horizon+14);c.bezierCurveTo(w*.25,horizon-15,w*.55,horizon+18,w,horizon+1);c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fillStyle=ground;c.fill();
  c.save();c.beginPath();c.rect(0,horizon+20,w,h);c.clip();
  for(let i=0;i<12;i++){
    const y=horizon+40+random(i+901)*(h-horizon);c.strokeStyle=i%3?'#e5a66b0b':'#502e361a';c.lineWidth=1+random(i+910)*4;c.beginPath();c.moveTo(-30,y);c.bezierCurveTo(w*.3,y-30,w*.7,y+20,w+20,y-10);c.stroke();
  }
  for(let i=0;i<62;i++){
    const x=random(i+140)*w,depth=random(i+141),y=horizon+28+depth*(h-horizon-30),r=1+depth*5+random(i+160)*4;
    oval(c,x+r*.6,y+r*.6,r*1.5,r*.35,'#56362f27');c.beginPath();c.moveTo(x-r,y);c.lineTo(x-r*.4,y-r*.7);c.lineTo(x+r*.5,y-r*.9);c.lineTo(x+r,y);c.closePath();c.fillStyle=i%3?'#a76b50':'#cc9265';c.fill();c.strokeStyle='#ebac7520';c.lineWidth=.8;c.stroke();
  }
  for(let i=0;i<52;i++){
    const depth=random(i+340),speed=8+depth*22,x=(random(i+300)*w+time*speed)%(w+50)-25;
    const y=horizon+15+depth*(h-horizon-15)+Math.sin(time*.8+i)*4;
    c.globalAlpha=.09+depth*.22;oval(c,x,y,.5+depth*1.8,.4+depth*.7,'#f3c391');
  }
  c.globalAlpha=1;
  for(let i=0;i<5;i++){
    const x=((time*13+i*w*.28)%(w*1.5))-w*.25,y=horizon+40+(i%3)*(h-horizon)*.23;
    c.save();c.translate(x,y);c.scale(2.4,.15);const g=c.createRadialGradient(0,0,0,0,0,90);g.addColorStop(0,'#f7bd7b08');g.addColorStop(1,'#f7bd7b00');disc(c,0,0,90,g);c.restore();
  }
  c.restore();
}

export function drawMoon(c,w,h,time){
  const x=w*.84,y=h*.2,r=w<700?8:13;c.save();c.translate(x,y);c.rotate(-.35);c.beginPath();c.ellipse(0,0,r,r*.8,0,0,Math.PI*2);const g=c.createLinearGradient(-r,-r,r,r);g.addColorStop(0,'#9d9282');g.addColorStop(1,'#3f4b5b');c.fillStyle=g;c.fill();oval(c,-r*.3,0,r*.2,r*.15,'#4a515b66');oval(c,r*.25,-r*.3,r*.13,r*.13,'#c4ae8e33');c.restore();
  const phase=time%23;if(phase>20&&phase<21){const p=phase-20,x=w*(.15+p*.3),y=h*(.16+p*.12);const trail=c.createLinearGradient(x-45,y-15,x,y);trail.addColorStop(0,'#d9e6d400');trail.addColorStop(1,'#d9e6d499');c.strokeStyle=trail;c.lineWidth=1;c.beginPath();c.moveTo(x-45,y-15);c.lineTo(x,y);c.stroke();}
}
