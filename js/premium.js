(function(){var d=document,$=function(s){return d.querySelector(s)},$$=function(s){return[].slice.call(d.querySelectorAll(s))},RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
d.documentElement.classList.add('js');
/* ===== Premium ===== */
var FP=matchMedia('(hover:hover) and (pointer:fine)').matches;
/* tipografía cinética con resorte */
var SP=(function(){var k=[],n=26;for(var i=0;i<=n;i++){var t=i/n,v=1-Math.exp(-5.5*t)*Math.cos(13*t);k.push({transform:'translateY('+((1-v)*85)+'%) rotate('+((1-v)*16)+'deg)',opacity:Math.min(1,t*7),offset:t})}return k})();
function splitEl(el){var ls=[];el.setAttribute('aria-label',el.textContent.replace(/\s+/g,' ').trim());(function w(n){[].slice.call(n.childNodes).forEach(function(c){if(c.nodeType===3){var fr=d.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(function(tk){if(!tk)return;if(/^\s+$/.test(tk)){fr.appendChild(d.createTextNode(' '));return}var wd=d.createElement('span');wd.style.cssText='display:inline-block;white-space:nowrap';wd.setAttribute('aria-hidden','true');tk.split('').forEach(function(chr){var s=d.createElement('span');s.className='ch';s.textContent=chr;wd.appendChild(s);ls.push(s)});fr.appendChild(wd)});c.parentNode.replaceChild(fr,c)}else if(c.nodeType===1)w(c)})})(el);return ls}
function spring(ls,base,step,dur){ls.forEach(function(s,i){s.animate(SP,{duration:dur||1100,delay:base+Math.min(i,60)*step,easing:'linear',fill:'backwards'})})}
if(!RM){var h1=$('h1'),L1=splitEl(h1),gl_=L1.filter(function(s){return s.closest('em')});gl_.forEach(function(s,i){s.classList.add('g');s.style.setProperty('--bs',gl_.length*100+'%');s.style.setProperty('--bp',(gl_.length>1?i/(gl_.length-1)*100:0)+'%')});spring(L1,150,32,1200);
 if('IntersectionObserver' in window){var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io2.unobserve(e.target);spring(splitEl(e.target),0,24,1000)})},{threshold:.5});$$('h2').forEach(function(x){io2.observe(x)})}}
/* botones magnéticos + cursor personalizado (solo con mouse) */
if(FP&&!RM){var mg=$$('.btn,.cb,.pb'),cu=d.createElement('div'),cr_=d.createElement('div'),mx=-100,my=-100,rx=-100,ry=-100,shown=0,tk2=0,ev=null;cu.className='cur';cr_.className='cr';d.body.appendChild(cu);d.body.appendChild(cr_);d.body.classList.add('fp');
 var LB=[['.pb,.vt','Play'],['.sc','Abrir'],['.it','Arrastra'],['summary','Ver'],['a,button',''],['input,textarea,select','#']];
 d.addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;ev=e;if(!tk2){tk2=1;requestAnimationFrame(function(){tk2=0;var t=ev.target,lab=null;for(var k=0;k<LB.length;k++){if(t.closest&&t.closest(LB[k][0])){lab=LB[k][1];break}}
  if(!shown){shown=1;cu.style.opacity=cr_.style.opacity=1}
  if(lab==='#'){cu.style.opacity=cr_.style.opacity=0}else{cu.style.opacity=cr_.style.opacity=1;cr_.classList.toggle('h',lab!==null);cr_.textContent=lab||''}
  mg.forEach(function(b){var r=b.getBoundingClientRect(),dx=mx-(r.left+r.width/2),dy=my-(r.top+r.height/2),rad=Math.max(r.width,r.height)*.8;if(Math.hypot(dx,dy)<rad){b.style.translate=dx*.3+'px '+dy*.3+'px';b.dataset.m=1}else if(b.dataset.m){b.style.translate='';b.dataset.m=''}})})}});
 d.documentElement.addEventListener('mouseleave',function(){cu.style.opacity=cr_.style.opacity=0});
 (function cl(){rx+=(mx-rx)*.2;ry+=(my-ry)*.2;cu.style.transform='translate('+mx+'px,'+my+'px)';cr_.style.transform='translate('+rx+'px,'+ry+'px)';requestAnimationFrame(cl)})()}
/* transición líquida: shader de fragmentos propio en WebGL, carga perezosa */
var LQ=null,busy=0;
function lqInit(){if(LQ!==null)return LQ;try{var c=d.createElement('canvas');c.id='lq';var g=c.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false,powerPreference:'low-power'});if(!g)return LQ=false;
 var vs='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}',fs='precision mediump float;uniform vec2 uR,uO;uniform float uP,uT;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}void main(){vec2 p=(gl_FragCoord.xy-uO*uR)/uR.y;float w=fb(p*3.2+uT*.7)*.5+fb(p*8.-uT*1.3)*.1;float e=length(p)+w*.55;float r=uP*2.5;float cov=1.-smoothstep(r-.05,r,e);float g=smoothstep(r-.2,r-.03,e)*cov;float l=fb(p*14.+uT)*.6;vec3 col=mix(vec3(.01,.03,.1),vec3(.2,.6,1.),g*(.6+l));col+=vec3(.2,.9,1.)*pow(g,6.)*.9;gl_FragColor=vec4(col*cov,cov);}';
 function sh(t,s){var o=g.createShader(t);g.shaderSource(o,s);g.compileShader(o);return o}
 var pg2=g.createProgram();g.attachShader(pg2,sh(g.VERTEX_SHADER,vs));g.attachShader(pg2,sh(g.FRAGMENT_SHADER,fs));g.linkProgram(pg2);if(!g.getProgramParameter(pg2,g.LINK_STATUS))return LQ=false;g.useProgram(pg2);
 var b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),g.STATIC_DRAW);var al=g.getAttribLocation(pg2,'a');g.enableVertexAttribArray(al);g.vertexAttribPointer(al,2,g.FLOAT,false,0,0);
 d.body.appendChild(c);return LQ={c:c,g:g,R:g.getUniformLocation(pg2,'uR'),O:g.getUniformLocation(pg2,'uO'),P:g.getUniformLocation(pg2,'uP'),T:g.getUniformLocation(pg2,'uT')}}catch(e){return LQ=false}}
function lqDraw(p,ox,oy,t){var g=LQ.g,c=LQ.c;g.viewport(0,0,c.width,c.height);g.clear(g.COLOR_BUFFER_BIT);g.uniform2f(LQ.R,c.width,c.height);g.uniform2f(LQ.O,ox,oy);g.uniform1f(LQ.P,p);g.uniform1f(LQ.T,t);g.drawArrays(g.TRIANGLES,0,3)}
function jump(t){var y=t.getBoundingClientRect().top+scrollY-72,s=d.documentElement.style;s.scrollBehavior='auto';scrollTo(0,y);s.scrollBehavior=''}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function lqGo(target,x,y){var L=RM||busy?false:lqInit();if(!L){jump(target);return}busy=1;var c=L.c,W=innerWidth,H=innerHeight;c.width=Math.round(W*.5);c.height=Math.round(H*.5);c.style.display='block';var ox=x/W,oy=1-y/H,t0=performance.now();
 (function a(t){var k=Math.min((t-t0)/560,1);lqDraw(ease(k),ox,oy,t*.001);if(k<1)return requestAnimationFrame(a);jump(target);var t1=performance.now();(function b(t){var k2=Math.min((t-t1)/720,1);lqDraw(1-ease(k2),.5,.5,t*.001);if(k2<1)return requestAnimationFrame(b);c.style.display='none';busy=0})(t1)})(t0)}
d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var id=a.getAttribute('href');if(id.length<2)return;var t=d.querySelector(id);if(!t)return;e.preventDefault();lqGo(t,e.clientX||innerWidth/2,e.clientY||innerHeight/2)});
})();
