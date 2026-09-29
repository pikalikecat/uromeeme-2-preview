import * as T from './three.module.js';
// Orientation scaffold only. Simplified pelvic landmarks, not CT-derived bone.
export function addPelvicLandmarks(parent){
 const bone=new T.MeshStandardMaterial({color:0xe5e1c6,roughness:.72,transparent:true,opacity:.29,depthWrite:false,side:T.DoubleSide});
 const edge=new T.MeshStandardMaterial({color:0xcccbb1,roughness:.8,transparent:true,opacity:.32,depthWrite:false});
 const group=new T.Group();group.name='pelvic-landmarks';parent.add(group);
 function pipe(p,r,mat=bone,closed=false){const c=new T.CatmullRomCurve3(p.map(a=>new T.Vector3(...a)),closed);const m=new T.Mesh(new T.TubeGeometry(c,64,r,12,false),mat);m.renderOrder=1;group.add(m);return m;}
 // Broad iliac wings fan laterally above the acetabular region.
 for(const s of [-1,1]){
  const top=new T.CatmullRomCurve3([[.3,-.71,-.4],[.52,-.48,-.38],[.84,-.43,-.2],[1,-.6,.02],[.93,-.92,.2]].map(p=>new T.Vector3(s*p[0],p[1],p[2])));
  const bottom=new T.CatmullRomCurve3([[.28,-1.03,-.35],[.42,-1.19,-.26],[.61,-1.32,-.12],[.77,-1.37,.08],[.83,-1.33,.2]].map(p=>new T.Vector3(s*p[0],p[1],p[2])));
  const pos=[],ids=[];for(let j=0;j<=24;j++)for(let i=0;i<=40;i++){const u=i/40,v=j/24,a=top.getPoint(u),b=bottom.getPoint(u),p=a.lerp(b,v);p.z-=Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*.075;pos.push(...p.toArray());}
  for(let j=0;j<24;j++)for(let i=0;i<40;i++){const a=j*41+i;ids.push(a,a+1,a+41,a+1,a+42,a+41);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(ids);g.computeVertexNormals();const wing=new T.Mesh(g,bone);wing.renderOrder=1;group.add(wing);
  pipe(top.getPoints(30).map(p=>p.toArray()),.031,edge);
  // Pubic/ischial rami leave an open obturator foramen, not a solid pelvic bowl.
  pipe([[s*.76,-1.33,.1],[s*.56,-1.47,.32],[s*.13,-1.57,.44],[s*.15,-1.77,.42],[s*.39,-1.98,.2],[s*.66,-1.89,.025],[s*.77,-1.61,.0]],.065,bone,true);
  pipe([[s*.26,-1.0,-.38],[s*.59,-1.27,-.27],[s*.76,-1.48,.03]],.085);
 }
 // Pubic symphysis is anterior to bladder/prostate; sacrum is posterior.
 const sym=new T.Mesh(new T.CapsuleGeometry(.06,.17,8,14),bone);sym.position.set(0,-1.65,.45);sym.renderOrder=1;group.add(sym);
 const sacrum=new T.Mesh(new T.SphereGeometry(1,28,20),bone);sacrum.position.set(0,-1.02,-.4);sacrum.scale.set(.3,.43,.1);sacrum.renderOrder=1;group.add(sacrum);
 pipe([[0,-1.18,-.41],[0,-1.43,-.32],[0,-1.55,-.23]],.055);
 // A quiet lumbar column gives a posterior reference when the model is rotated.
 for(let i=0;i<5;i++){const y=.83-i*.32;const m=new T.Mesh(new T.CylinderGeometry(.13,.14,.21,24),bone);m.position.set(0,y,-.42);m.renderOrder=1;group.add(m);}
 return group;
}
