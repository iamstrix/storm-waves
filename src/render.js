/* AI assistance: Codex wrote this original Canvas 2D scene from the supplied visual direction. */
import { CONFIG, clamp } from './config.js';

export class SceneRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    this.stars = Array.from({ length: 65 }, (_, i) => ({ x: (Math.sin(i * 91.7 + 6) + 1) / 2, y: (Math.sin(i * 43.3 + 17) + 1) / 2 * .75, r: .5 + (i % 4) * .3 }));
    this.resize();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas.parentElement);
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width; this.height = rect.height;
    this.ratio = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * this.ratio);
    this.canvas.height = Math.round(this.height * this.ratio);
  }

  circle(x,y,r,color) { const c=this.context;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill(); }
  roundRect(x,y,w,h,r,color) { const c=this.context;c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill(); }

  draw(game, clock = 0) {
    const s=game.state,c=this.context,w=this.width,h=this.height;
    c.setTransform(this.ratio,0,0,this.ratio,0,0);c.clearRect(0,0,w,h);
    const background=c.createLinearGradient(0,0,0,h);background.addColorStop(0,'#0b1026');background.addColorStop(.7,'#21193b');background.addColorStop(1,'#443046');c.fillStyle=background;c.fillRect(0,0,w,h);
    for(const [i,star] of this.stars.entries()){const alpha=this.reducedMotion.matches?.8:.55+Math.sin(clock*.0006+i)*.22;c.globalAlpha=alpha;this.circle(star.x*w,star.y*h,star.r,'#fff');}c.globalAlpha=1;
    const compact=w<721,scale=Math.min(w/660,h/570,1.6),sunX=w*(compact?.15:.12),sunY=h*(compact?.17:.17),sunR=clamp(w*.048,30,62);
    const glow=c.createRadialGradient(sunX,sunY,sunR*.4,sunX,sunY,sunR*2.5);glow.addColorStop(0,'#ffe19dcc');glow.addColorStop(.35,'#ffb23f75');glow.addColorStop(1,'#ffb23f00');this.circle(sunX,sunY,sunR*2.5,glow);this.circle(sunX,sunY,sunR,'#ffe08a');
    if(s.phase==='story'&&s.storyPanel===1){this.drawSpaceLesson(w,h,sunX,sunY);this.drawPip(w*.17,h*.73,Math.max(.48,scale*.7));return;}
    const groundY=h*.74,baseX=w*.52,baseY=h*.745;
    const ground=c.createLinearGradient(0,groundY-25,0,h);ground.addColorStop(0,'#e38d55');ground.addColorStop(1,'#a7462d');c.fillStyle=ground;c.beginPath();c.moveTo(0,groundY+15);c.bezierCurveTo(w*.2,groundY-45,w*.72,groundY-20,w,groundY+8);c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fill();
    c.fillStyle='#91452d77';for(let i=0;i<8;i++){c.beginPath();c.ellipse((.09+i*.12)*w,groundY+45+(i%3)*35,12+8*(i%3),3+2*(i%2),-.08,0,Math.PI*2);c.fill();}
    if(['warning','storm'].includes(s.phase))this.drawStorm(game,sunX,sunY,baseX,baseY,scale);
    this.drawBase(baseX,baseY,Math.max(.65,scale));
    const storyShield=s.phase==='story'&&s.storyPanel===2;
    if(s.shield||storyShield)this.drawShield(baseX,baseY,Math.max(.65,scale),s.phaseTime);
    if(s.phase==='story'||s.phase==='tutorial')this.drawPip(w*(compact?.15:.18),h*.75,Math.max(.5,scale*.75));
    if(s.phase==='report'&&s.outcome==='won'){
      for(let i=0;i<14;i++){const x=w*(.2+((i*7)%19)/30),y=h*(.18+((i*11)%17)/48);this.drawStar(x,y,3+(i%3),'#ffe08a');}
    }
  }

  drawBase(x,y,scale) {
    const c=this.context;c.save();c.translate(x,y);c.scale(scale,scale);
    c.fillStyle='#79372266';c.beginPath();c.ellipse(0,13,137,18,0,0,Math.PI*2);c.fill();
    c.strokeStyle='#1c4092';c.lineWidth=2;
    for(const ox of [-155,-103]){c.beginPath();c.moveTo(ox,1);c.lineTo(ox+45,-14);c.lineTo(ox+58,2);c.lineTo(ox+13,17);c.closePath();c.fillStyle='#467bdc';c.fill();c.stroke();c.strokeStyle='#719fea';for(let j=1;j<4;j++){c.beginPath();c.moveTo(ox+45*j/4,-14*j/4);c.lineTo(ox+13+45*j/4,17-15*j/4);c.stroke();}c.strokeStyle='#1c4092';}
    this.roundRect(66,-34,58,35,8,'#e1e7fc');this.roundRect(80,-23,15,10,3,'#2c3768');
    c.fillStyle='#f4f6ff';c.beginPath();c.arc(0,0,63,Math.PI,0);c.closePath();c.fill();c.fillStyle='#dbe3f9';c.beginPath();c.moveTo(-63,0);c.arc(0,0,63,Math.PI,Math.PI*1.5);c.lineTo(0,0);c.closePath();c.fill();
    this.roundRect(-17,-34,34,34,10,'#2c3768');this.circle(0,-22,6,'#ffd34d');
    c.strokeStyle='#dfe5fb';c.lineWidth=3;c.beginPath();c.moveTo(103,-34);c.lineTo(103,-65);c.stroke();this.circle(103,-69,5,'#ff7a9c');
    c.fillStyle='#fff';c.font='800 9px system-ui';c.textAlign='center';c.fillText('RED BASE',0,20);
    c.restore();
  }

  drawShield(x,y,scale,time) {
    const c=this.context;c.save();c.translate(x,y);c.scale(scale,scale);
    const gradient=c.createRadialGradient(0,0,20,0,0,113);gradient.addColorStop(0,'#5ee6ff06');gradient.addColorStop(.7,'#5ee6ff15');gradient.addColorStop(1,'#5ee6ff88');
    c.beginPath();c.arc(0,4,112,Math.PI,Math.PI*2);c.closePath();c.fillStyle=gradient;c.fill();c.strokeStyle='#5ee6ff';c.lineWidth=5;c.lineCap='round';c.beginPath();c.arc(0,4,112,Math.PI,Math.PI*2);c.stroke();
    if(!this.reducedMotion.matches){c.strokeStyle='#c9faff88';c.lineWidth=2;const a=Math.PI+(time%1)*Math.PI;c.beginPath();c.arc(0,4,112,a,Math.min(Math.PI*2,a+.25));c.stroke();}
    c.restore();
  }

  drawStorm(game,sunX,sunY,baseX,baseY,scale) {
    const c=this.context,s=game.state,distance=Math.hypot(baseX-sunX,baseY-sunY),angle=Math.atan2(baseY-sunY,baseX-sunX);
    const warning=s.phase==='warning';const progress=warning?clamp(s.phaseTime/game.warningDuration,0,1):clamp(s.phaseTime/game.stormDuration,0,1);
    const radius=warning?distance*(.22+.78*progress):distance*(1+progress*.22);
    const spread=.20+game.event.halfAngleDeg/180;
    c.save();c.lineCap='round';
    for(let i=0;i<3;i++){c.beginPath();c.strokeStyle=['#ffb23f','#f3a63a99','#ffb23f55'][i];c.lineWidth=Math.max(3,(9-i*2)*Math.max(.6,scale));c.arc(sunX,sunY,Math.max(10,radius-i*16*Math.max(.6,scale)),angle-spread,angle+spread);c.stroke();}
    for(let i=0;i<12;i++){const a=angle+Math.sin(i*2.3)*spread,r=radius-(i%4)*7;this.circle(sunX+Math.cos(a)*r,sunY+Math.sin(a)*r,1.5+(i%3),'#ffe08a');}
    c.restore();
  }

  drawPip(x,y,scale) {
    const c=this.context;c.save();c.translate(x,y);c.scale(scale,scale);
    c.fillStyle='#0004';c.beginPath();c.ellipse(0,40,46,7,0,0,Math.PI*2);c.fill();
    c.strokeStyle='#dfe5fb';c.lineWidth=4;c.beginPath();c.moveTo(0,-79);c.lineTo(0,-99);c.stroke();this.circle(0,-104,7,'#ffd34d');
    this.roundRect(-40,-80,80,58,21,'#f4f6ff');this.roundRect(-30,-69,60,34,12,'#1d2650');this.circle(-13,-53,6,'#5ee6ff');this.circle(13,-53,6,'#5ee6ff');
    c.strokeStyle='#5ee6ff';c.lineWidth=3;c.beginPath();c.moveTo(-8,-43);c.quadraticCurveTo(0,-36,8,-43);c.stroke();
    this.roundRect(-31,-18,62,43,14,'#dfe5fb');this.circle(0,3,8,'#ff7a9c');
    c.strokeStyle='#dfe5fb';c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(-31,-5);c.quadraticCurveTo(-52,-8,-56,-32);c.stroke();
    this.roundRect(-43,26,34,15,8,'#2c3768');this.roundRect(9,26,34,15,8,'#2c3768');c.restore();
  }

  drawSpaceLesson(w,h,sunX,sunY) {
    const c=this.context,compact=w<721,earthX=w*.72,earthY=h*(compact?.27:.3),earthR=Math.min(42,w*.075);
    c.save();c.setLineDash([6,8]);c.strokeStyle='#5ee6ffbb';c.lineWidth=3;c.beginPath();c.arc(earthX,earthY,earthR*1.8,0,Math.PI*2);c.stroke();c.setLineDash([]);this.circle(earthX,earthY,earthR,'#3b6fe0');
    c.fillStyle='#6fe3c1';c.beginPath();c.moveTo(earthX-earthR*.65,earthY);c.lineTo(earthX-earthR*.3,earthY-earthR*.5);c.lineTo(earthX+earthR*.45,earthY-earthR*.35);c.lineTo(earthX+earthR*.2,earthY+earthR*.35);c.closePath();c.fill();
    const marsX=w*.86,marsY=h*.48;this.circle(marsX,marsY,earthR*.65,'#c7603a');c.fillStyle='#d8e4ff';c.textAlign='center';c.font='800 16px system-ui';c.fillText('Earth',earthX,earthY+earthR*2.15);c.fillText('Mars',marsX,marsY+earthR+15);
    const a=Math.atan2(marsY-sunY,marsX-sunX);c.strokeStyle='#ffb23faa';c.lineWidth=7;c.lineCap='round';for(let i=0;i<3;i++){c.beginPath();c.arc(sunX,sunY,w*(.28+i*.035),a-.14,a+.14);c.stroke();}c.restore();
  }

  drawStar(x,y,r,color){const c=this.context;c.save();c.fillStyle=color;c.beginPath();for(let i=0;i<10;i++){const a=i/10*Math.PI*2-Math.PI/2,rr=i%2?r*.42:r;i?c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):c.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fill();c.restore();}
}
