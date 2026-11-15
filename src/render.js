/* AI assistance: original Codex scene composition, animation, and camera for the user's revised art direction. */
import {clamp} from './config.js?v=2';
import {disc,oval,habitat,pip} from './art.js?v=2';
import {makeSky,drawSun,drawTerrain,drawMoon} from './world.js?v=2';
import {storm,shield,timing} from './effects.js?v=2';

export class SceneRenderer{
  constructor(canvas){
    this.canvas=canvas;this.context=canvas.getContext('2d');this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
    this.pointer={x:0,y:0};this.pan={x:0,y:0};this.lastShield=false;this.shieldAt=0;this.resize();
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas.parentElement);
  }
  resize(){
    const r=this.canvas.parentElement.getBoundingClientRect();this.width=r.width;this.height=r.height;this.ratio=Math.min(devicePixelRatio||1,2);
    this.canvas.width=Math.round(r.width*this.ratio);this.canvas.height=Math.round(r.height*this.ratio);
    this.sky=makeSky(r.width,r.height,this.ratio);this.pose=null;
  }
  layout(state){
    const w=this.width,h=this.height,mobile=w<=760&&h>540,landscape=h<=540&&w>=650;
    const card=['intro','debrief','tutorial','report','story'].includes(state.phase)||state.paused;
    const story=state.phase==='story'||state.phase==='tutorial';
    const scale=mobile?Math.min(w/510,h/780):Math.min(w/1050,h/650,1.5);
    return {
      x:mobile?w*.52:card||landscape?w*.29:w*.52,
      y:mobile?(card?h*(story?.49:h<700?.34:.39):h*.65):h*(state.phase==='start'?.71:.73),
      horizon:mobile?(card?h*(story?.4:h<700?.27:.32):h*.55):h*.59,
      scale:Math.max(.62,scale),mobile,landscape,card,story,
    };
  }
  draw(game,clock=0,presentation={}){
    const c=this.context,w=this.width,h=this.height,s=game.state,motion=!this.reducedMotion.matches,t=motion?clock/1000:0;
    const target=this.layout(s);if(!this.pose||!motion)this.pose={...target};
    const mix=1-Math.exp(-Math.min(.1,(clock-(this.lastClock||clock-16))/1000)*8);this.lastClock=clock;
    for(const key of ['x','y','horizon','scale'])this.pose[key]+=(target[key]-this.pose[key])*mix;
    this.pan.x+=(this.pointer.x-this.pan.x)*.03;this.pan.y+=(this.pointer.y-this.pan.y)*.03;
    const p=this.pose,sunX=w*(target.mobile?.17:.145),sunY=h*(target.mobile?.17:.23),sunR=clamp(w*.042,25,57);
    c.setTransform(this.ratio,0,0,this.ratio,0,0);c.clearRect(0,0,w,h);c.fillStyle='#091528';c.fillRect(0,0,w,h);
    c.drawImage(this.sky,-4+(motion?this.pan.x*3:0),-4+(motion?this.pan.y*2:0),w+8,h+8);
    if(motion)for(let i=0;i<14;i++){c.globalAlpha=.25+Math.sin(t*.6+i*2)*.18;disc(c,((i*.173+.31)%1)*w,((i*.247+.14)%.56)*h,.7,'#dbefdf');}c.globalAlpha=1;
    drawMoon(c,w,h,t);drawSun(c,sunX,sunY,sunR,t);
    if(s.phase==='story'&&s.storyPanel===1){this.lesson(c,w,h,t,sunX,sunY,presentation);return;}
    c.save();if(motion&&s.phase==='storm'&&!s.shield){c.translate(Math.sin(t*37)*1.1,Math.cos(t*31)*.7);}
    drawTerrain(c,w,h,p.horizon,t);
    if(s.phase==='warning')timing(c,p.x,p.y,p.scale,game.warningRemaining);
    if(['warning','storm'].includes(s.phase))storm(c,game,sunX,sunY,p.x,p.y,p.scale,t);
    habitat(c,p.x,p.y,p.scale,t,s.power);
    if(s.shield&&!this.lastShield)this.shieldAt=clock;this.lastShield=s.shield;
    if(s.shield||(s.phase==='story'&&s.storyPanel===2))shield(c,p.x,p.y,p.scale,t,s.phase==='storm',motion?Math.min(1,(clock-this.shieldAt)/220+.1):1);
    const bigPip=target.story,pipX=bigPip?(target.mobile?w*.32:w*.2):p.x+135*p.scale,pipY=bigPip?p.y+24*p.scale:p.y+17*p.scale;
    pip(c,pipX,pipY,bigPip?Math.min(target.mobile?1.35:1.8,p.scale*1.75):p.scale*.64,t,{talking:presentation.talking,happy:s.phase!=='storm'||s.shield});
    if(s.phase==='report'&&s.outcome==='won')for(let i=0;i<10;i++){
      const phase=(t*.18+i*.137)%1,x=p.x+Math.sin(i*2.3)*120*p.scale,y=p.y-80*p.scale-phase*135*p.scale;
      c.globalAlpha=Math.sin(phase*Math.PI)*.6;disc(c,x,y,1.5,i%2?'#f8cf90':'#a6eac9');
    }
    c.globalAlpha=1;c.restore();
    const vignette=c.createRadialGradient(w*.5,h*.4,h*.2,w*.5,h*.4,Math.max(w,h)*.72);vignette.addColorStop(0,'#030e1900');vignette.addColorStop(1,'#030e194a');c.fillStyle=vignette;c.fillRect(0,0,w,h);
  }
  lesson(c,w,h,t,sx,sy,presentation){
    const mobile=w<=760,earthX=w*(mobile?.67:.39),earthY=h*(mobile?.31:.4),r=mobile?27:48;
    const glow=c.createRadialGradient(earthX,earthY,r,earthX,earthY,r*2);glow.addColorStop(0,'#81ddda18');glow.addColorStop(1,'#81ddda00');disc(c,earthX,earthY,r*2,glow);
    const g=c.createRadialGradient(earthX-r*.4,earthY-r*.4,0,earthX,earthY,r);g.addColorStop(0,'#60b1cb');g.addColorStop(.7,'#347ca7');g.addColorStop(1,'#203c6c');disc(c,earthX,earthY,r,g);
    c.save();c.beginPath();c.arc(earthX,earthY,r,0,Math.PI*2);c.clip();c.fillStyle='#91bb9f';c.beginPath();c.moveTo(earthX-r*.7,earthY-r*.3);c.lineTo(earthX-r*.3,earthY-r*.8);c.lineTo(earthX+r*.45,earthY-r*.45);c.lineTo(earthX+r*.2,earthY+r*.1);c.lineTo(earthX-r*.2,earthY+r*.45);c.closePath();c.fill();c.restore();
    c.strokeStyle='#8de1d267';c.lineWidth=1.3;c.setLineDash([4,6]);c.beginPath();c.arc(earthX,earthY,r*1.55,0,Math.PI*2);c.stroke();c.setLineDash([]);
    const mx=w*(mobile?.83:.57),my=h*(mobile?.44:.58);const mg=c.createRadialGradient(mx-7,my-8,0,mx,my,r*.65);mg.addColorStop(0,'#d58a62');mg.addColorStop(1,'#844d46');disc(c,mx,my,r*.65,mg);
    c.fillStyle='#b9cdd0';c.font='700 11px Nunito, sans-serif';c.textAlign='center';c.fillText('Earth',earthX,earthY+r*1.9);c.fillText('Mars',mx,my+r+12);
    const a=Math.atan2(my-sy,mx-sx);c.strokeStyle='#ffd09370';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.arc(sx,sy,w*(.2+i*.03),a-.18,a+.18);c.stroke();}
    pip(c,w*(mobile?.27:.2),h*(mobile?.49:.72),mobile?1:1.6,t,{talking:presentation.talking});
  }
}
