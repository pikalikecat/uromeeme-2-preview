import {addPelvicLandmarks} from './pelvis.js';
import {sculptBody} from './sculpt.js';
import * as THREE from './three.module.js';

// Isolated art-direction prototype. Procedural geometry is NOT a clinical model.
const stage = document.querySelector('#stage');
const fallback = document.querySelector('#fallback');
let renderer;
try { renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'}); }
catch { fallback.textContent='此瀏覽器未啟用 WebGL，請使用支援 WebGL 的瀏覽器查看。'; }
if (renderer) initialise();

function initialise(){
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setClearColor(0x000000,0);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;
stage.append(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(31,1,.1,60);
camera.position.set(0,.25,13.3);camera.lookAt(0,.12,0);
const model=new THREE.Group();scene.add(model);
const anatomy=new THREE.Group();model.add(anatomy);
scene.add(new THREE.HemisphereLight(0xfff7e9,0x6a887b,2.05));
const key=new THREE.DirectionalLight(0xffe9d4,3.0);key.position.set(-4,6,6);scene.add(key);
const fill=new THREE.DirectionalLight(0xe9f7f0,1.25);fill.position.set(4,2,4);scene.add(fill);
const rim=new THREE.DirectionalLight(0xffffff,2.4);rim.position.set(1,4,-4);scene.add(rim);

// A small procedural studio environment supplies soft reflections, with no network assets.
const ec=document.createElement('canvas');ec.width=512;ec.height=256;
const ctx=ec.getContext('2d');ctx.fillStyle='#9fae9e';ctx.fillRect(0,0,512,256);
for(const [x,y,rx,ry,c] of [[130,70,105,55,'#fff5e2'],[370,85,60,75,'#eef9f4'],[260,15,210,35,'#ffffff']]){
 const g=ctx.createRadialGradient(x,y,0,x,y,rx);g.addColorStop(0,c);g.addColorStop(1,'rgba(255,255,255,0)');ctx.save();ctx.translate(0,y-y*ry/rx);ctx.scale(1,ry/rx);ctx.fillStyle=g;ctx.fillRect(0,0,512,512);ctx.restore();
}
const env=new THREE.CanvasTexture(ec);env.mapping=THREE.EquirectangularReflectionMapping;env.colorSpace=THREE.SRGBColorSpace;
const pmrem=new THREE.PMREMGenerator(renderer);const envMap=pmrem.fromEquirectangular(env);scene.environment=envMap.texture;env.dispose();pmrem.dispose();

// Glass skin: Fresnel rim and subtle diffuse shaping keep the interior legible.
const glass=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.FrontSide,
 uniforms:{skin:{value:new THREE.Color('#d2ddcb')},rimColour:{value:new THREE.Color('#f4f1df')}},
 vertexShader:`varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=-p.xyz;vP=position;gl_Position=projectionMatrix*p;}`,
 fragmentShader:`uniform vec3 skin;uniform vec3 rimColour;varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){vec3 n=normalize(vN);vec3 v=normalize(vV);float f=pow(1.-abs(dot(n,v)),2.45);float l=max(dot(n,normalize(vec3(-.7,.85,1.))),0.);float spec=pow(max(dot(reflect(-normalize(vec3(-.5,.8,1.)),n),v),0.),40.);vec3 col=mix(skin*(.42+.58*l),rimColour,f*.9)+spec*.14;float a=.13+f*.40+spec*.075;float bottom=smoothstep(-3.12,-2.55,vP.y);gl_FragColor=vec4(col,a*bottom);}`
});
const body=new THREE.Group();model.add(body);body.renderOrder=3;
function surface(nu,nv,fn){const pos=[],uv=[],indices=[];for(let i=0;i<=nv;i++){for(let j=0;j<=nu;j++){pos.push(...fn(j/nu,i/nv));uv.push(j/nu,i/nv);}}for(let i=0;i<nv;i++)for(let j=0;j<nu;j++){let a=i*(nu+1)+j,b=a+nu+1;indices.push(a,b,a+1,b,b+1,a+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;}
function flip(g){const a=g.index.array;for(let i=0;i<a.length;i+=3){const t=a[i+1];a[i+1]=a[i+2];a[i+2]=t;}g.index.needsUpdate=true;g.computeVertexNormals();return g;}
function add(parent,g,mat){const m=new THREE.Mesh(g,mat);parent.add(m);if(parent===body)m.renderOrder=3;return m;}
function gauss(x,c,w){return Math.exp(-(((x-c)/w)**2));}
function sample(rows,y,col){let i=0;while(i<rows.length-2&&y>rows[i+1][0])i++;const a=rows[i],b=rows[i+1],t=THREE.MathUtils.clamp((y-a[0])/(b[0]-a[0]),0,1);const p0=rows[Math.max(0,i-1)][col],p1=a[col],p2=b[col],p3=rows[Math.min(rows.length-1,i+2)][col];return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t);}
const torsoProfile=[[-2.12,.58,.36],[-1.76,1.01,.48],[-1.18,1.12,.57],[-.45,.95,.48],[.3,.92,.47],[1,1.08,.56],[1.65,1.29,.62],[2.12,1.39,.55],[2.4,1.43,.39],[2.62,1.09,.33],[2.83,.44,.3],[3.18,.37,.3]];
const torso=surface(112,160,(u,v)=>{const y=-2.12+v*5.3,a=u*Math.PI*2,w=sample(torsoProfile,y,1),d=sample(torsoProfile,y,2);let x=Math.cos(a)*w,z=Math.sin(a)*d;const front=Math.max(0,Math.sin(a));
 // Broad pectorals, a gentle midline, abdominal planes and iliac crests—not spherical parts.
 z+=front**4*(.115*gauss(Math.abs(x),.63,.4)*gauss(y,1.65,.4)-.055*gauss(x,0,.15)*gauss(y,1.4,1.25)+.034*gauss(Math.abs(x),.3,.21)*(gauss(y,.67,.2)+gauss(y,.18,.19)+gauss(y,-.28,.19))-.034*gauss(y,-.6,.07)*gauss(x,0,.12)+.045*gauss(Math.abs(x),.81,.2)*gauss(y,-1.13,.25));
 z-=Math.max(0,-Math.sin(a))**4*.026*gauss(x,0,.15);return [x,y,z];});
add(body,sculptBody(torsoProfile,sample),glass);
addPelvicLandmarks(model);

// Organic material with microscopic procedural variation rather than flat plastic.
const noiseCanvas=document.createElement('canvas');noiseCanvas.width=noiseCanvas.height=128;const nc=noiseCanvas.getContext('2d'),pixels=nc.createImageData(128,128);let seed=2941;for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const n=128+(seed%30);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=n;pixels.data[i+3]=255;}nc.putImageData(pixels,0,0);const bump=new THREE.CanvasTexture(noiseCanvas);bump.wrapS=bump.wrapT=THREE.RepeatWrapping;bump.repeat.set(3,3);
const kidneyMat=new THREE.MeshPhysicalMaterial({color:0x8e3f2f,roughness:.46,metalness:0,clearcoat:.10,clearcoatRoughness:.38,bumpMap:bump,bumpScale:.008,envMapIntensity:.55});
const tubeMat=new THREE.MeshPhysicalMaterial({color:0xe2c897,roughness:.4,clearcoat:.12,envMapIntensity:.5});
const bladderMat=new THREE.MeshPhysicalMaterial({color:0xc08b65,roughness:.42,clearcoat:.15,envMapIntensity:.45,bumpMap:bump,bumpScale:.006});
const glandMat=new THREE.MeshPhysicalMaterial({color:0x976553,roughness:.5,envMapIntensity:.35});
const veinMat=new THREE.MeshStandardMaterial({color:0x718e9d,roughness:.48});const arteryMat=new THREE.MeshStandardMaterial({color:0xa96853,roughness:.5});
function tube(points,r,mat= tubeMat){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return add(anatomy,new THREE.TubeGeometry(curve,72,r,12,false),mat);}
// Model coordinates: +Y cranial, +Z anterior; patient right is viewer left.
// Centres are design coordinates constrained by anatomic relationships, not millimetres.
for(const s of [-1,1]){
 const cy=s===-1?.36:.52,cx=s*.62,cz=-.245;
 const k=surface(88,64,(u,v)=>{const t=v*Math.PI,a=u*Math.PI*2,nx=Math.sin(t)*Math.cos(a),ny=Math.cos(t),nz=Math.sin(t)*Math.sin(a);let x=.325*nx,y=.51*ny,z=.205*nz;
 x-=.16*gauss(y,.015,.21)*Math.max(0,nx)**2;
 x-=.035*(y/.51)**2;z*=1-.14*gauss(y,0,.17)*Math.max(0,nx);
 // Upper poles angle mildly medial and posterior. Tilt locally, not about the world origin.
 return [cx-s*x-s*y*.1,cy+y,cz+z-y*.07];});
 if(s===-1)flip(k);const mesh=add(anatomy,k,kidneyMat);mesh.name=s===-1?'right-kidney':'left-kidney';
 // Renal pelvis exits medially; ureter stays posterior then follows the pelvic sidewall.
 tube([[s*.47,cy,-.245],[s*.41,cy-.08,-.24],[s*.395,cy-.17,-.235]],.042);
 tube([[s*.395,cy-.17,-.235],[s*.39,-.1,-.22],[s*.43,-.48,-.19],[s*.52,-.84,-.145],[s*.45,-1.2,-.12],[s*.225,-1.4,-.035]],.024);
}
// The bladder lies in the lesser pelvis behind the anterior pubic symphysis.
const bladder=surface(80,56,(u,v)=>{const t=v*Math.PI,a=u*Math.PI*2,y=Math.cos(t),r=Math.sin(t),factor=.83+.17*y;return [Math.cos(a)*r*.43*factor,-1.25+y*.31,.11+Math.sin(a)*r*.3*factor];});const bMesh=add(anatomy,flip(bladder),bladderMat);bMesh.name='bladder';
// Bladder neck continues into prostate; the urethra traverses it rather than hanging separately.
const prostate=surface(64,44,(u,v)=>{let t=v*Math.PI,a=u*Math.PI*2;return [Math.sin(t)*Math.cos(a)*.19,-1.66+Math.cos(t)*.14,.1+Math.sin(t)*Math.sin(a)*.16];});const pMesh=add(anatomy,flip(prostate),glandMat);pMesh.name='prostate';
tube([[0,-1.48,.11],[0,-1.64,.1],[0,-1.83,.12],[0,-1.94,.23],[0,-2.05,.35],[0,-2.34,.39]],.029);

// Labels remain attached to projected anatomy and fade away for side/rear views.
const lineLayer=document.createElementNS('http://www.w3.org/2000/svg','svg');lineLayer.classList.add('leaders');document.querySelector('.anatomy-labels').prepend(lineLayer);
const labelMap=[['kidney',[.9,.53,-.16],48,-5],['ureter',[.42,-.39,-.2],73,-2],['bladder',[.31,-1.21,.24],65,-15],['prostate',[-.16,-1.65,.19],-80,10],['urethra',[0,-2.21,.38],64,0]];
let yaw=-.1,pitch=0,scheduled=false;
function draw(){scheduled=false;model.rotation.set(pitch,yaw,0);model.updateMatrixWorld(true);renderer.render(scene,camera);
 const w=stage.clientWidth,h=stage.clientHeight;lineLayer.setAttribute('viewBox',`0 0 ${w} ${h}`);lineLayer.replaceChildren();document.querySelector('.anatomy-labels').style.opacity=Math.cos(yaw)>.55?'1':'0';
 for(const [name,point,dx,dy] of labelMap){const pos=new THREE.Vector3(...point).applyMatrix4(model.matrixWorld).project(camera),e=document.querySelector('.'+name),offset=w<420?dx*.63:dx;e.style.left=Math.max(14,Math.min(w-67,(pos.x*.5+.5)*w+offset))+'px';e.style.top=((-pos.y*.5+.5)*h+dy)+'px';const x=(pos.x*.5+.5)*w,y=(-pos.y*.5+.5)*h;const ex=parseFloat(e.style.left)+(dx<0?e.offsetWidth+8:-8),ey=parseFloat(e.style.top)+e.offsetHeight/2;const l=document.createElementNS(lineLayer.namespaceURI,'line');for(const [k,v] of Object.entries({x1:x,y1:y,x2:ex,y2:ey}))l.setAttribute(k,v);lineLayer.append(l);const dot=document.createElementNS(lineLayer.namespaceURI,'circle');dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('r','2');lineLayer.append(dot);}
 stage.dataset.yaw=yaw.toFixed(3);stage.dataset.ready='true';fallback.hidden=true;
}
function requestDraw(){if(!scheduled){scheduled=true;requestAnimationFrame(draw);}}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=w<430?15.8:13.3;camera.updateProjectionMatrix();requestDraw();}new ResizeObserver(resize).observe(stage);
let drag=null;stage.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;drag={x:e.clientX,y:e.clientY,yaw,pitch};stage.setPointerCapture(e.pointerId);});
stage.addEventListener('pointermove',e=>{if(!drag)return;yaw=drag.yaw+(e.clientX-drag.x)*.007;if(e.pointerType==='mouse')pitch=THREE.MathUtils.clamp(drag.pitch+(e.clientY-drag.y)*.002,-.18,.18);requestDraw();});
for(const event of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(event,()=>drag=null);
stage.addEventListener('dblclick',()=>{yaw=-.1;pitch=0;requestDraw();});
stage.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){yaw=-.1;pitch=0;}else yaw+=e.key==='ArrowLeft'?-.15:.15;requestDraw();});
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback.hidden=false;fallback.textContent='圖形顯示已暫停，請重新整理頁面。';});resize();
}


