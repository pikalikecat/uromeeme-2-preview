import * as T from './three.module.js';
// A single watertight isosurface avoids transparent overlapping limb seams.
export function sculptBody(profile,sample){
const arms=[[-1.60,1.68,.105,.12,.15],[-1.43,1.68,.105,.13,.12],[-1,1.66,.15,.18,.05],[-.45,1.61,.205,.22,-.01],[.05,1.58,.16,.19,-.04],[.55,1.55,.22,.25,-.02],[1.2,1.52,.265,.3,.015],[1.83,1.44,.29,.34,.03],[2.28,1.29,.245,.29,0],[2.4,1.23,.02,.03,0]];
const legs=[[-3.24,.6,.32,.33,.015],[-2.9,.6,.39,.4,.015],[-2.5,.62,.45,.47,.02],[-2,.63,.49,.51,.015],[-1.58,.6,.47,.48,0],[-1.35,.55,.2,.25,0]];
const gauss=(x,c,w)=>Math.exp(-(((x-c)/w)**2));
const union=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;};
const oval=(x,z,rx,rz)=>(Math.hypot(x/rx,z/rz)-1)*Math.min(rx,rz);
function component(rows,x,y,z,side){const yy=T.MathUtils.clamp(y,rows[0][0],rows.at(-1)[0]);return Math.max(oval(x-side*sample(rows,yy,1),z-sample(rows,yy,4),sample(rows,yy,2),sample(rows,yy,3)),rows[0][0]-y,y-rows.at(-1)[0]);}
// Hand silhouette shares the body isosurface; the original forearm and torso remain intact.
function capsule(x,y,z,a,b,r){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],t=T.MathUtils.clamp(((x-a[0])*dx+(y-a[1])*dy+(z-a[2])*dz)/(dx*dx+dy*dy+dz*dz),0,1);return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy,z-a[2]-t*dz)-r;}
// A narrow, subtly tapered palm blends into the wrist without a flat cap.
function hand(x,y,z,side){x*=side;const py=(y+1.67)/.22,width=.115+.018*T.MathUtils.clamp(-py*.5+.25,0,1);const palm=(Math.hypot((x-1.67)/width,py,(z-.16)/.090)-1)*.090;let h=palm;
 // Graduated fingers taper toward the tip; the thumb has its own two segments.
 const fingers=[[-.12,.30,.037],[-.04,.35,.038],[.04,.32,.037],[.12,.25,.035]];
 for(const [offset,length,r] of fingers){const a=[1.67+offset,-1.81,.16],middle=[1.67+offset*1.04,-1.81-length*.53,.175],tip=[1.67+offset*1.08,-1.81-length,.20];h=union(h,capsule(x,y,z,a,middle,r),.006);h=union(h,capsule(x,y,z,middle,tip,r*.94),.006);}
 const thumbBase=capsule(x,y,z,[1.55,-1.58,.17],[1.49,-1.73,.20],.039),thumbTip=capsule(x,y,z,[1.49,-1.73,.20],[1.46,-1.87,.23],.030);return union(union(h,thumbBase,.025),thumbTip,.012);
}
function field(x,y,z){const yy=T.MathUtils.clamp(y,-2.12,3.18),w=sample(profile,yy,1),d=sample(profile,yy,2);let zz=z;
if(z>0)zz-=.115*gauss(Math.abs(x),.63,.4)*gauss(y,1.65,.4)-.045*gauss(x,0,.15)*gauss(y,1.4,1.25)+.04*gauss(Math.abs(x),.3,.21)*(gauss(y,.67,.2)+gauss(y,.18,.19)+gauss(y,-.28,.19))-.028*gauss(y,-.6,.07)*gauss(x,0,.12);
let f=Math.max(oval(x,zz,w,d),-2.12-y,y-3.18);for(const side of [-1,1]){f=union(f,component(arms,x,y,z,side),.19);if(y>-2.30&&y< -1.35&&side*x>1.27&&side*x<1.98&&z>-.10&&z<.45)f=union(f,hand(x,y,z,side),.045);f=union(f,component(legs,x,y,z,side),.25);}return f;}
const step=.03,nx=136,ny=222,nz=56,origin=[-2.04,-3.36,-.84],values=new Float32Array((nx+1)*(ny+1)*(nz+1)),index=(x,y,z)=>(y*(nz+1)+z)*(nx+1)+x;
for(let y=0;y<=ny;y++)for(let z=0;z<=nz;z++)for(let x=0;x<=nx;x++)values[index(x,y,z)]=field(origin[0]+x*step,origin[1]+y*step,origin[2]+z*step);
const offsets=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]],tets=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]],points=[],normals=[];
function normal(p){const e=.007;return new T.Vector3(field(p[0]+e,p[1],p[2])-field(p[0]-e,p[1],p[2]),field(p[0],p[1]+e,p[2])-field(p[0],p[1]-e,p[2]),field(p[0],p[1],p[2]+e)-field(p[0],p[1],p[2]-e)).normalize();}
function tri(a,b,c){const n=normal(a),ab=new T.Vector3(...b).sub(new T.Vector3(...a)),ac=new T.Vector3(...c).sub(new T.Vector3(...a));if(ab.cross(ac).dot(n)<0)[b,c]=[c,b];for(const p of [a,b,c]){points.push(...p);normals.push(...normal(p).toArray());}}
for(let y=0;y<ny;y++)for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){
const vs=offsets.map(o=>values[index(x+o[0],y+o[1],z+o[2])]);if(vs.every(v=>v>=0)||vs.every(v=>v<0))continue;const ps=offsets.map(o=>[origin[0]+(x+o[0])*step,origin[1]+(y+o[1])*step,origin[2]+(z+o[2])*step]);
const edge=(a,b)=>{const t=vs[a]/(vs[a]-vs[b]);return ps[a].map((v,i)=>v+(ps[b][i]-v)*t);};
for(const t of tets){const inside=t.filter(i=>vs[i]<0),outside=t.filter(i=>vs[i]>=0);if(inside.length===1)tri(...outside.map(i=>edge(inside[0],i)));else if(inside.length===3)tri(...inside.map(i=>edge(outside[0],i)));else if(inside.length===2){const a=edge(inside[0],outside[0]),b=edge(inside[0],outside[1]),c=edge(inside[1],outside[0]),d=edge(inside[1],outside[1]);tri(a,b,c);tri(b,d,c);}}
}
const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));return g;
}
