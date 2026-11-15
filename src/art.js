/* AI assistance: original Codex Canvas artwork, following the user's richer Mars-world direction. */
export function disc(c,x,y,r,fill){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();}
export function oval(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
export function box(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}}
function poly(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}}
function gradient(c,x,y,x2,y2,colors){const g=c.createLinearGradient(x,y,x2,y2);colors.forEach((color,i)=>g.addColorStop(i/(colors.length-1),color));return g;}

export function habitat(c,x,y,scale,time,power=70){
  c.save();c.translate(x,y);c.scale(scale,scale);
  oval(c,20,33,194,27,'#301d2450');
  poly(c,[[-127,4],[64,-2],[137,22],[9,48],[-144,29]],'#754b3c');
  poly(c,[[-127,0],[64,-6],[137,17],[9,39],[-144,24]],'#af7b59','#bd906766');
  c.strokeStyle='#544e4f';c.lineWidth=3;c.beginPath();c.moveTo(-88,18);c.bezierCurveTo(-124,40,-145,33,-182,16);c.stroke();
  // Two tilted solar wings, with individual cells and a moving reflection.
  for(const ox of [-201,-143]){
    c.strokeStyle='#3c424c';c.lineWidth=4;c.beginPath();c.moveTo(ox+35,5);c.lineTo(ox+35,31);c.stroke();
    const panel=[ [ox,-3],[ox+57,-23],[ox+80,7],[ox+23,28] ];
    poly(c,panel,'#1e506d','#79a8b3');
    c.save();c.beginPath();panel.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.closePath();c.clip();
    c.fillStyle=gradient(c,ox,-20,ox+60,30,['#527fa7','#25465f','#193b58']);c.fillRect(ox-5,-30,95,70);
    c.strokeStyle='#8ebfd34d';c.lineWidth=1;
    for(let j=1;j<6;j++){c.beginPath();c.moveTo(ox+j*11,-25);c.lineTo(ox+25+j*11,34);c.stroke();}
    for(let j=0;j<4;j++){c.beginPath();c.moveTo(ox-5,j*11-9);c.lineTo(ox+88,j*11-41);c.stroke();}
    c.globalAlpha=.17;c.fillStyle='#b6ebeb';const glint=((time*8+ox)%130+130)%130;poly(c,[[ox+glint-25,-30],[ox+glint-12,-30],[ox+glint+30,40],[ox+glint+15,40]],'#b6ebeb');c.restore();
  }
  // Communications pod and dish, behind the habitat.
  box(c,88,-40,69,53,12,gradient(c,88,-40,132,12,['#dce7de','#819da4']),'#9db9b7');
  box(c,102,-26,34,17,6,'#183d52');box(c,105,-23,26,3,2,'#74c9cb44');
  c.strokeStyle='#b7d0c9';c.lineWidth=4;c.beginPath();c.moveTo(137,-40);c.lineTo(137,-73);c.stroke();
  c.save();c.translate(137,-78);c.rotate(-.42+Math.sin(time*.19)*.025);c.beginPath();c.ellipse(0,0,19,6,0,0,Math.PI);c.lineTo(0,17);c.closePath();c.fillStyle='#bad0c8';c.fill();c.strokeStyle='#5f8994';c.lineWidth=2;c.stroke();c.beginPath();c.moveTo(0,0);c.lineTo(0,-12);c.stroke();disc(c,0,-14,2,'#9cebd6');c.restore();
  // Sculpted shell, soft-lit from the Sun at the upper left.
  c.beginPath();c.moveTo(-106,9);c.bezierCurveTo(-105,-62,-63,-108,-5,-110);c.bezierCurveTo(56,-113,99,-57,105,9);c.quadraticCurveTo(0,39,-106,9);c.closePath();
  c.fillStyle=gradient(c,-83,-104,79,30,['#fff1d2','#d1d8ca','#819aa0']);c.fill();c.strokeStyle='#f6ead255';c.lineWidth=2;c.stroke();
  c.save();c.beginPath();c.moveTo(-81,-35);c.bezierCurveTo(-69,-79,-38,-98,-4,-98);c.bezierCurveTo(39,-98,67,-67,79,-35);c.quadraticCurveTo(0,-15,-81,-35);c.closePath();
  c.fillStyle=gradient(c,-30,-98,10,-20,['#518799','#244c65','#18394f']);c.fill();c.clip();
  c.strokeStyle='#b9d4ce44';c.lineWidth=3;
  for(const offset of [-45,-12,24,57]){c.beginPath();c.moveTo(offset,-105);c.quadraticCurveTo(offset*.7,-60,offset*1.15,-20);c.stroke();}
  poly(c,[[-91,-75],[-40,-106],[-19,-106],[-60,-20],[-86,-20]],'#d5f1df13');c.restore();
  c.strokeStyle='#6c8b933d';c.lineWidth=1;c.beginPath();c.moveTo(-96,-17);c.quadraticCurveTo(0,8,96,-17);c.stroke();
  box(c,-25,-43,51,68,15,gradient(c,-25,-40,25,26,['#657d83','#344f5c']),'#dfdcc088');
  box(c,-18,-36,37,54,11,'#17374b');disc(c,0,-21,10,'#8dadb0');disc(c,0,-21,7,gradient(c,-7,-29,6,-15,['#ffe5a3','#d99f50']));disc(c,-2,-24,2,'#fff2cb');
  box(c,-14,4,28,3,2,power>=20?'#9de6c0':'#ed9e70');
  for(const ox of [-77,-46,49,77]){disc(c,ox,-3,2,'#91aaa6');disc(c,ox-1,-4,1,'#f0ecda');}
  box(c,37,-7,30,13,4,'#afbab0');box(c,41,-4,5,7,1,'#5e8590');box(c,49,-4,5,7,1,'#5e8590');box(c,57,-4,5,7,1,'#5e8590');
  c.strokeStyle='#d4e6d0';c.lineWidth=2;c.beginPath();c.moveTo(-69,-85);c.lineTo(-74,-125);c.stroke();
  disc(c,-75,-128,3,power>=20?'#97ebd0':'#efbb7d');
  if(power>=20){const g=c.createRadialGradient(-75,-128,0,-75,-128,12);g.addColorStop(0,'#96e5b655');g.addColorStop(1,'#96e5b600');disc(c,-75,-128,12,g);}
  oval(c,-4,28,36,6,'#c9b090');box(c,-27,24,48,6,2,'#8a8f83');box(c,-32,30,59,6,2,'#626f6b');
  // A little rover and surface beacons make the outpost feel inhabited.
  c.save();c.translate(-130,64);oval(c,0,4,34,6,'#2f202944');for(const wx of [-23,20]){disc(c,wx,0,8,'#283d46');disc(c,wx,-1,4,'#677e80');}
  poly(c,[[-28,-7],[-20,-22],[15,-22],[29,-7]],'#b5b9a3','#dfd7b655');box(c,-12,-31,26,12,4,'#739395');box(c,-7,-28,16,6,2,'#173f56');c.strokeStyle='#9eb9ac';c.lineWidth=2;c.beginPath();c.moveTo(17,-24);c.lineTo(22,-40);c.stroke();disc(c,22,-42,2,'#dfac7e');c.restore();
  for(const bx of [-91,91]){box(c,bx,48,3,9,1,'#596f69');disc(c,bx+1.5,47,2,'#9ce9cd');}
  c.restore();
}

export function pip(c,x,y,scale,time,{talking=false,happy=true}={}){
  c.save();c.translate(x,y);c.scale(scale,scale);const bob=Math.sin(time*2.5)*2;
  oval(c,0,36,38,7,'#251c2f40');c.translate(0,bob);
  c.strokeStyle='#7da5ac';c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(-27,-8);c.quadraticCurveTo(-49,-17,-45,-32);c.stroke();c.beginPath();c.moveTo(28,-8);c.quadraticCurveTo(43,-1,44,-21);c.stroke();
  box(c,-51,-38,12,19,6,'#c7ded5');box(c,38,-27,12,19,6,'#c7ded5');
  box(c,-26,-22,52,51,18,gradient(c,-21,-23,18,28,['#f0ecce','#abc9c2']),'#718f9b');
  box(c,-14,-12,28,18,7,'#315666');disc(c,0,-3,5,'#9ee9d6');disc(c,-1,-5,2,'#e5ffe1');
  box(c,-32,25,26,13,6,'#355364');box(c,6,25,26,13,6,'#355364');box(c,-28,27,17,3,2,'#a2c7c1');box(c,11,27,17,3,2,'#a2c7c1');
  c.save();c.rotate(Math.sin(time*.9)*.025);c.strokeStyle='#adcec6';c.lineWidth=3;c.beginPath();c.moveTo(0,-81);c.lineTo(4,-100);c.stroke();
  const glow=c.createRadialGradient(4,-103,1,4,-103,14);glow.addColorStop(0,'#a6f4d466');glow.addColorStop(1,'#a6f4d400');disc(c,4,-103,14,glow);disc(c,4,-103,5,'#c1eec3');disc(c,3,-105,2,'#faffdf');
  box(c,-43,-84,86,65,23,gradient(c,-35,-82,32,-16,['#fff3d7','#d3e5d8','#8eafaf']),'#abc7bf');
  box(c,-34,-74,68,43,16,gradient(c,-25,-74,15,-25,['#224e60','#102a43']),'#708d9666');
  c.save();c.beginPath();c.roundRect(-34,-74,68,43,16);c.clip();poly(c,[[-38,-73],[-13,-78],[9,-28],[-9,-28]],'#bbead50a');c.restore();
  const blink=time%5.7>5.51,eyeH=blink?1.5:happy?6:4;
  oval(c,-14,-56,5,eyeH,'#93eedd');oval(c,14,-56,5,eyeH,'#93eedd');
  if(talking){for(let i=0;i<5;i++)box(c,-10+i*4,-41,2,2+Math.abs(Math.sin(time*24+i))*5,1,'#8de1d2');}
  else{c.strokeStyle='#8de1d2';c.lineWidth=2;c.beginPath();c.moveTo(-7,-42);c.quadraticCurveTo(0,happy?-34:-41,7,-42);c.stroke();}
  disc(c,-39,-50,3,'#86afa8');disc(c,39,-50,3,'#86afa8');c.restore();c.restore();
}
