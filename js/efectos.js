(function(){var d=document,$=function(s){return d.querySelector(s)},$$=function(s){return[].slice.call(d.querySelectorAll(s))},RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
d.documentElement.classList.add('js');
/* reveal + contadores */
var rv=$$('.rv'),cn=$$('.cnt');function all(){rv.forEach(function(x){x.classList.add('in')})}
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;e.target.classList.add('in');io.unobserve(e.target);
 if(e.target.querySelector&&e.target.querySelector('.cnt')){var c=e.target.querySelector('.cnt'),n=+c.dataset.n,t0=performance.now();if(!RM)(function f(t){var p=Math.min((t-t0)/1400,1);c.textContent=Math.round(n*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)})(t0)}})},{threshold:.12});rv.forEach(function(x){io.observe(x)});setTimeout(all,4000)}else all();
/* tilt 3D */
$$('.tilt').forEach(function(el){el.addEventListener('pointermove',function(e){if(RM)return;var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform='perspective(800px) rotateX('+(-y*14)+'deg) rotateY('+(x*16)+'deg)';el.style.setProperty('--gx',(x+.5)*100+'%');el.style.setProperty('--gy',(y+.5)*100+'%')});el.addEventListener('pointerleave',function(){el.style.transform=''})});
/* scroll: progreso, parallax, línea */
var tk=0,pg=$('#pg'),st=$('#steps');function onS(){var m=d.documentElement.scrollHeight-innerHeight;pg.style.transform='scaleX('+(m>0?scrollY/m:0)+')';
 if(!RM)$$('[data-p]').forEach(function(e){var r=e.parentNode.getBoundingClientRect();e.style.transform='translate3d(0,'+((r.top+r.height/2-innerHeight/2)*-.14)+'px,0)'});
 var r=st.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight*.78-r.top)/(r.height+40)));st.style.setProperty('--p',p)}
addEventListener('scroll',function(){if(!tk){tk=1;requestAnimationFrame(function(){tk=0;onS()})}},{passive:true});onS();
/* foco que sigue al cursor */
var hero=$('#inicio');hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();hero.style.setProperty('--mx',(e.clientX-r.left)+'px');hero.style.setProperty('--my',(e.clientY-r.top)+'px')});
/* galería 3D */
var ring=$('#ring'),its=$$('.it'),n=its.length,ang=0,vel=.18,R=300,drag=0,lx=0,stg=$('#stage'),on=1;
function lay(){var w=its[0].offsetWidth;R=Math.round(w/2/Math.tan(Math.PI/n))+24;its.forEach(function(it,i){it.style.transform='rotateY('+i*360/n+'deg) translateZ('+R+'px)'})}lay();addEventListener('resize',lay);
stg.addEventListener('pointerdown',function(e){drag=1;lx=e.clientX});addEventListener('pointerup',function(){drag=0});
addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-lx;lx=e.clientX;ang+=dx*.35;vel=dx*.12});
if('IntersectionObserver' in window)new IntersectionObserver(function(e){on=e[0].isIntersecting}).observe(stg);
(function sp(){if(on&&!RM&&!d.hidden){if(!drag){ang+=vel;vel+=(.18-vel)*.03}}ring.style.transform='translateZ(-'+R+'px) rotateY('+ang+'deg)';requestAnimationFrame(sp)})();
/* engranaje 3D (canvas) */
var cv=$('#g3d'),cx=cv.getContext('2d'),logo=new Image();logo.src='/icons/icon-192.png';
var W,H,D=Math.min(devicePixelRatio||1,2),px=0,py=0,gv=1,i,ST=[],LOW=0;
function gp(N,r0,a,b,c){var o=[];for(var i=0;i<N;i++){var a0=i/N*6.2832,sw=6.2832/N;[[0,r0],[a,1],[b,1],[c,r0]].forEach(function(k){var t=a0+k[0]*sw;o.push([Math.cos(t)*k[1],Math.sin(t)*k[1]])})}return o}
var P=gp(14,.78,.16,.5,.66),P2=gp(8,.72,.14,.52,.68);for(i=0;i<80;i++)ST.push([(Math.random()-.5)*5,(Math.random()-.5)*5,(Math.random()-.5)*5]);
var CE=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]],CV=[];for(i=0;i<8;i++)CV.push([i&1?1:-1,i&2?1:-1,i&4?1:-1]);
function size(){var r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*D;cv.height=H*D;cx.setTransform(D,0,0,D,0,0)}size();addEventListener('resize',size);
d.addEventListener('pointermove',function(e){px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5;var z=$('.gz');z.style.setProperty('--px',px);z.style.setProperty('--py',py)});
function pr(x,y,z,g,ax,ay){var c=Math.cos(g),s=Math.sin(g),X=x*c-y*s,Y=x*s+y*c,c1=Math.cos(ax),s1=Math.sin(ax),Y2=Y*c1-z*s1,Z2=Y*s1+z*c1,c2=Math.cos(ay),s2=Math.sin(ay),X3=X*c2+Z2*s2,Z3=-X*s2+Z2*c2,f=3.4/(3.4-Z3),u=Math.min(W,H)*.205;return[W/2+X3*f*u,H/2-Y2*f*u,Z3]}
function line(pts,al,col,lw){cx.beginPath();pts.forEach(function(p,j){j?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1])});cx.strokeStyle=col.replace('A',al);cx.lineWidth=lw||1.5;cx.stroke()}
function circ(r,z,ax,ay,seg,ox,oy){var o=[];for(var j=0;j<=seg;j++){var t=j/seg*6.2832;o.push(pr((ox||0)+Math.cos(t)*r,(oy||0)+Math.sin(t)*r,z,0,ax,ay))}return o}
function G(Pn,ox,oy,s,sp,z,ax,ay){var c=Math.cos(sp),sn=Math.sin(sp);return Pn.map(function(p){return pr(ox+(p[0]*c-p[1]*sn)*s,oy+(p[0]*sn+p[1]*c)*s,z,0,ax,ay)})}
function gear(Pn,ox,oy,s,sp,Z,ax,ay,B,C){var bk=G(Pn,ox,oy,s,sp,-Z,ax,ay),fr=G(Pn,ox,oy,s,sp,Z,ax,ay),k;bk.push(bk[0]);line(bk,.45,B,1.2);
 for(k=0;k<Pn.length;k+=2)line([bk[k],fr[k]],.3,B,1);
 cx.beginPath();fr.forEach(function(p,j){j?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1])});cx.closePath();cx.fillStyle='rgba(47,123,255,.13)';cx.fill();fr.push(fr[0]);line(fr,.95,C,2)}
function draw(t){cx.clearRect(0,0,W,H);cx.globalCompositeOperation='lighter';cx.shadowColor='#2F7BFF';cx.shadowBlur=LOW?0:14;
 var sc=scrollY||0,g=t*.0005+sc*.002,ax=.42+py*.7+Math.sin(t*.0006)*.1,ay=Math.sin(t*.0004)*.55+px*1.1,Z=.2,B='rgba(91,162,255,A)',C='rgba(56,225,255,A)',k,m;
 ST.forEach(function(s){var p=pr(s[0],s[1],s[2],t*.00007,ax*.6,ay*1.3),al=Math.max(.08,Math.min(.8,(p[2]+2.6)/5));cx.fillStyle='rgba(150,200,255,'+al+')';cx.fillRect(p[0],p[1],1.6,1.6)});
 var u=(t%3400)/3400;line(circ(.3+u*2,Z,ax,ay,64),(1-u)*.5,C,1.4);
 gear(P,0,0,1,g,Z,ax,ay,B,C);gear(P2,1.34,-.78,.56,-g*14/8+.4,Z,ax,ay,C,B);
 line(circ(.62,Z,ax,ay,40),.7,B,1.4);line(circ(.3,Z,ax,ay,28),.9,C,1.6);
 for(k=0;k<6;k++){var s=k*1.0472+g;line([pr(Math.cos(s)*.3,Math.sin(s)*.3,Z,0,ax,ay),pr(Math.cos(s)*.62,Math.sin(s)*.62,Z,0,ax,ay)],.6,B,1.2)}
 for(k=0;k<2;k++){var cp=[Math.cos(t*.0007+k*3.14)*2.1,Math.sin(t*.0005+k*2)*.9,Math.sin(t*.0007+k*3.14)*1.5],cr=t*.001*(k?-1:1),cc=Math.cos(cr),cs=Math.sin(cr),VV=CV.map(function(v){var x=v[0]*.22,y=v[1]*.22,z=v[2]*.22;return pr(cp[0]+x*cc-z*cs,cp[1]+y*cc-x*cs*.4,cp[2]+x*cs+z*cc,0,ax,ay)});CE.forEach(function(e){line([VV[e[0]],VV[e[1]]],.7,k?B:C,1.2)})}
 [[1.5,.5,.2],[1.85,-.7,.9]].forEach(function(o,k){var ra=ay+o[2]+t*.0002*(k?-1:1);line(circ(o[0],0,ax+o[1],ra,90),.25,k?C:B,1);
  for(m=0;m<3;m++){var ph=(t*.0006*(k?-1:1)+m*2.09+k)%6.2832,pp=pr(Math.cos(ph)*o[0],Math.sin(ph)*o[0],0,0,ax+o[1],ra);cx.beginPath();cx.arc(pp[0],pp[1],3.2,0,6.2832);cx.fillStyle=C.replace('A',1);cx.fill()}});
 cx.globalCompositeOperation='source-over';cx.shadowBlur=0;
 if(logo.complete&&logo.naturalWidth){var c0=pr(0,0,Z+.02,0,ax,ay),sz=Math.min(W,H)*.19*(3.4/(3.4-c0[2])),sx=Math.max(.35,Math.cos(ay*.7));cx.save();cx.translate(c0[0],c0[1]);cx.scale(sx,1);cx.beginPath();cx.arc(0,0,sz*.5,0,6.2832);cx.clip();cx.drawImage(logo,-sz*.5,-sz*.5,sz,sz);cx.restore()}
}
if('IntersectionObserver' in window)new IntersectionObserver(function(e){gv=e[0].isIntersecting}).observe(cv);
if(RM){logo.onload=function(){draw(900)};draw(900)}else{var lt=0,sl=0;(function lp(t){if(gv&&!d.hidden){var dt=t-lt;lt=t;if(dt>34)sl++;else if(sl>0)sl--;if(sl>45&&!LOW){LOW=1;D=1;size()}draw(t)}requestAnimationFrame(lp)})(0)}
})();
