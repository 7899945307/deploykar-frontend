import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });
  const sceneRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const pivot = new THREE.Group();
    scene.add(pivot);

    // ─── MILKY WAY GALAXY ────────────────────────────────────────
    const galaxyGeo = new THREE.BufferGeometry();
    const galaxyCount = 6000;
    const galaxyPos = new Float32Array(galaxyCount * 3);
    const galaxyCol = new Float32Array(galaxyCount * 3);
    for (let i = 0; i < galaxyCount; i++) {
      const angle = Math.random() * Math.PI * 6;
      const radius = Math.random() * 40 + 2;
      const spiral = angle * 1.5;
      const arm = i % 2 === 0 ? 1 : -1;
      galaxyPos[i*3] = Math.cos(spiral)*radius+(Math.random()-.5)*4*arm;
      galaxyPos[i*3+1] = (Math.random()-.5)*2.5;
      galaxyPos[i*3+2] = Math.sin(spiral)*radius+(Math.random()-.5)*4*arm;
      const mix = radius/42;
      galaxyCol[i*3]=.3+mix*.4; galaxyCol[i*3+1]=.2+mix*.3; galaxyCol[i*3+2]=.8+mix*.2;
    }
    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPos,3));
    galaxyGeo.setAttribute('color', new THREE.BufferAttribute(galaxyCol,3));
    const galaxy = new THREE.Points(galaxyGeo, new THREE.PointsMaterial({size:.08,vertexColors:true,transparent:true,opacity:.25,blending:THREE.AdditiveBlending}));
    galaxy.rotation.x=Math.PI*.4; galaxy.position.set(0,-5,-20);
    pivot.add(galaxy);

    // ─── STAR FIELD ──────────────────────────────────────────────
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPos = new Float32Array(starCount*3);
    const starCol = new Float32Array(starCount*3);
    const pal:number[][]=[[.42,.39,1],[.66,.54,.98],[.22,.74,.96],[1,1,1],[.9,.85,.7]];
    for(let i=0;i<starCount;i++){
      starPos[i*3]=(Math.random()-.5)*140;starPos[i*3+1]=(Math.random()-.5)*100;starPos[i*3+2]=(Math.random()-.5)*80;
      const c=pal[Math.floor(Math.random()*pal.length)];
      starCol[i*3]=c[0];starCol[i*3+1]=c[1];starCol[i*3+2]=c[2];
    }
    starGeo.setAttribute('position',new THREE.BufferAttribute(starPos,3));
    starGeo.setAttribute('color',new THREE.BufferAttribute(starCol,3));
    const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({size:.15,vertexColors:true,transparent:true,opacity:.6}));
    pivot.add(stars);

    // ─── NEBULA RINGS ────────────────────────────────────────────
    const rings:THREE.Mesh[]=[];
    for(let i=0;i<3;i++){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(8+i*5,.03,8,100),new THREE.MeshBasicMaterial({color:new THREE.Color(.4-i*.05,.35-i*.04,1-i*.1),transparent:true,opacity:.06-i*.015}));
      ring.rotation.x=Math.random()*Math.PI;ring.rotation.y=Math.random()*Math.PI;
      pivot.add(ring);rings.push(ring);
    }

    // ─── PLANETS ─────────────────────────────────────────────────
    const planetColors=[0x884422,0x446688,0x668844,0xaa6633,0x554488];
    for(let i=0;i<4;i++){
      const pg=new THREE.Group();
      pg.add(new THREE.Mesh(new THREE.SphereGeometry(.6+Math.random()*.8,16,16),new THREE.MeshBasicMaterial({color:planetColors[i],transparent:true,opacity:.35})));
      if(i%2===0){const pr=new THREE.Mesh(new THREE.TorusGeometry(1.2+Math.random()*.4,.03,4,40),new THREE.MeshBasicMaterial({color:0xaaaacc,transparent:true,opacity:.2}));pr.rotation.x=Math.PI/2.5;pg.add(pr);}
      pg.position.set((Math.random()-.5)*80,(Math.random()-.5)*50,-20-Math.random()*30);
      pivot.add(pg);
    }

    // ─── ASTRONAUTS ──────────────────────────────────────────────
    const astronauts:{mesh:THREE.Group;speed:THREE.Vector3;rotSpeed:THREE.Vector3}[]=[];
    function createAstronaut(){
      const g=new THREE.Group();
      g.add(new THREE.Mesh(new THREE.CapsuleGeometry(.2,.4,4,8),new THREE.MeshBasicMaterial({color:0xcccccc,transparent:true,opacity:.5})));
      const h=new THREE.Mesh(new THREE.SphereGeometry(.18,8,8),new THREE.MeshBasicMaterial({color:0x88ccff,transparent:true,opacity:.6}));h.position.y=.4;g.add(h);
      const v=new THREE.Mesh(new THREE.SphereGeometry(.12,6,6),new THREE.MeshBasicMaterial({color:0x4488ff,transparent:true,opacity:.8}));v.position.set(0,.42,.08);g.add(v);
      const bp=new THREE.Mesh(new THREE.BoxGeometry(.18,.25,.12),new THREE.MeshBasicMaterial({color:0x999999,transparent:true,opacity:.4}));bp.position.set(0,.05,-.2);g.add(bp);
      g.position.set((Math.random()-.5)*60,(Math.random()-.5)*40,(Math.random()-.5)*40);
      g.scale.setScalar(.8+Math.random()*.4);pivot.add(g);
      astronauts.push({mesh:g,speed:new THREE.Vector3((Math.random()-.5)*.01,(Math.random()-.5)*.008,(Math.random()-.5)*.006),rotSpeed:new THREE.Vector3((Math.random()-.5)*.005,(Math.random()-.5)*.008,(Math.random()-.5)*.003)});
    }
    for(let i=0;i<5;i++)createAstronaut();

    // ─── ROCKETS ─────────────────────────────────────────────────
    interface Rocket{mesh:THREE.Group;velocity:THREE.Vector3;life:number;maxLife:number}
    const rockets:Rocket[]=[];
    let nextRocketTime=Date.now()+8000+Math.random()*10000;
    function createRocket(){
      const g=new THREE.Group();
      const f=new THREE.Mesh(new THREE.CylinderGeometry(.08,.15,1,6),new THREE.MeshBasicMaterial({color:0xdddddd,transparent:true,opacity:.7}));f.rotation.x=Math.PI/2;g.add(f);
      const n=new THREE.Mesh(new THREE.ConeGeometry(.08,.3,6),new THREE.MeshBasicMaterial({color:0xff4444,transparent:true,opacity:.8}));n.rotation.x=Math.PI/2;n.position.z=-.65;g.add(n);
      const e=new THREE.Mesh(new THREE.SphereGeometry(.12,6,6),new THREE.MeshBasicMaterial({color:0xff8800,transparent:true,opacity:.9}));e.position.z=.55;g.add(e);
      const fl=new THREE.Mesh(new THREE.ConeGeometry(.1,.8,5),new THREE.MeshBasicMaterial({color:0xff6600,transparent:true,opacity:.5,blending:THREE.AdditiveBlending}));fl.rotation.x=-Math.PI/2;fl.position.z=.9;g.add(fl);
      const startX=(Math.random()>.5?-1:1)*(40+Math.random()*10);
      g.position.set(startX,(Math.random()-.5)*30,(Math.random()-.5)*20);
      const sp=.12+Math.random()*.08;const vel=new THREE.Vector3(-Math.sign(startX)*sp,(Math.random()-.5)*.02,(Math.random()-.5)*.02);
      g.lookAt(g.position.clone().add(vel));pivot.add(g);
      rockets.push({mesh:g,velocity:vel,life:0,maxLife:500+Math.random()*200});
    }

    // ─── COMETS ──────────────────────────────────────────────────
    interface Comet{mesh:THREE.Group;velocity:THREE.Vector3;life:number;maxLife:number}
    const comets:Comet[]=[];
    let nextCometTime=Date.now()+3000+Math.random()*5000;
    function createComet(){
      const g=new THREE.Group();
      g.add(new THREE.Mesh(new THREE.SphereGeometry(.2,8,8),new THREE.MeshBasicMaterial({color:0xffaa44,transparent:true,opacity:.9})));
      const t=new THREE.Mesh(new THREE.ConeGeometry(.12,2.5,6),new THREE.MeshBasicMaterial({color:0xff6600,transparent:true,opacity:.4}));t.rotation.x=Math.PI/2;t.position.z=1.4;g.add(t);
      const tGeo=new THREE.BufferGeometry();const tP=new Float32Array(30*3);
      for(let i=0;i<30;i++){tP[i*3]=(Math.random()-.5)*.3;tP[i*3+1]=(Math.random()-.5)*.3;tP[i*3+2]=Math.random()*3+.5;}
      tGeo.setAttribute('position',new THREE.BufferAttribute(tP,3));
      g.add(new THREE.Points(tGeo,new THREE.PointsMaterial({color:0xff8833,size:.06,transparent:true,opacity:.5,blending:THREE.AdditiveBlending})));
      const side=Math.floor(Math.random()*4);const sp=.15+Math.random()*.1;
      const startPos=new THREE.Vector3();const vel=new THREE.Vector3();
      switch(side){
        case 0:startPos.set(-50,(Math.random()-.5)*30,(Math.random()-.5)*20);vel.set(sp,(Math.random()-.5)*.05,0);break;
        case 1:startPos.set(50,(Math.random()-.5)*30,(Math.random()-.5)*20);vel.set(-sp,(Math.random()-.5)*.05,0);break;
        case 2:startPos.set((Math.random()-.5)*50,30,(Math.random()-.5)*20);vel.set((Math.random()-.5)*.05,-sp,0);break;
        default:startPos.set((Math.random()-.5)*50,-30,(Math.random()-.5)*20);vel.set((Math.random()-.5)*.05,sp,0);break;
      }
      g.position.copy(startPos);g.lookAt(startPos.clone().add(vel));pivot.add(g);
      comets.push({mesh:g,velocity:vel,life:0,maxLife:400+Math.random()*200});
    }

    // ─── SHOOTING STARS ──────────────────────────────────────────
    interface ShootingStar{mesh:THREE.Line;velocity:THREE.Vector3;life:number;maxLife:number}
    const shootingStars:ShootingStar[]=[];
    let nextShootingStarTime=Date.now()+6000+Math.random()*8000;
    function createShootingStar(){
      const pts=[];for(let i=0;i<20;i++)pts.push(new THREE.Vector3(i*.3,0,0));
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xaaccff,transparent:true,opacity:.6}));
      line.position.set((Math.random()-.5)*80,20+Math.random()*15,(Math.random()-.5)*30);
      const angle=-Math.PI/4+(Math.random()-.5)*.5;line.rotation.z=angle;
      const sp=.4+Math.random()*.3;const vel=new THREE.Vector3(Math.cos(angle)*sp,Math.sin(angle)*sp,0);
      pivot.add(line);shootingStars.push({mesh:line,velocity:vel,life:0,maxLife:120+Math.random()*60});
    }

    // ─── METEOR SHOWERS ──────────────────────────────────────────
    interface MeteorShower{particles:{mesh:THREE.Mesh;velocity:THREE.Vector3;life:number}[];maxLife:number}
    const meteorShowers:MeteorShower[]=[];
    let nextMeteorShowerTime=Date.now()+15000+Math.random()*20000;
    function createMeteorShower(){
      const shower:MeteorShower={particles:[],maxLife:180};
      const ox=(Math.random()-.5)*40,oy=20+Math.random()*10,oz=(Math.random()-.5)*15;
      const count=12+Math.floor(Math.random()*10);
      for(let i=0;i<count;i++){
        const m=new THREE.Mesh(new THREE.SphereGeometry(.04+Math.random()*.04,4,4),new THREE.MeshBasicMaterial({color:0xffcc66,transparent:true,opacity:.7,blending:THREE.AdditiveBlending}));
        m.position.set(ox+(Math.random()-.5)*5,oy+(Math.random()-.5)*3,oz+(Math.random()-.5)*3);
        const sp=.2+Math.random()*.15;const ang=-Math.PI/3+(Math.random()-.5)*.6;
        const vel=new THREE.Vector3(Math.cos(ang)*sp*.5,Math.sin(ang)*sp,(Math.random()-.5)*.05);
        pivot.add(m);shower.particles.push({mesh:m,velocity:vel,life:0});
      }
      meteorShowers.push(shower);
    }

    // ─── DRAG HANDLERS (document-level, skip interactive elements) ─
    function isInteractive(el: EventTarget | null): boolean {
      if (!el || !(el instanceof HTMLElement)) return false;
      const tag = el.tagName.toLowerCase();
      if (['button','a','input','textarea','select','label'].includes(tag)) return true;
      if (el.closest('button, a, input, textarea, select, [role="button"], [data-interactive], .react-flow__node, .react-flow__controls, .react-flow__minimap')) return true;
      if (el.getAttribute('role') === 'button') return true;
      // Check if element or ancestors have cursor pointer (likely clickable)
      return false;
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (isInteractive(e.target)) return;
      isDragging.current = true;
      previousMouse.current = { x: e.clientX, y: e.clientY };
      rotationVelocity.current = { x: 0, y: 0 };
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - previousMouse.current.x;
      const dy = e.clientY - previousMouse.current.y;
      rotationVelocity.current = { x: dy * 0.005, y: dx * 0.005 };
      sceneRotation.current.x += dy * 0.005;
      sceneRotation.current.y += dx * 0.005;
      previousMouse.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => { isDragging.current = false; };

    const handleTouchStart = (e: TouchEvent) => {
      if (isInteractive(e.target)) return;
      isDragging.current = true;
      previousMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      rotationVelocity.current = { x: 0, y: 0 };
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const dx = e.touches[0].clientX - previousMouse.current.x;
      const dy = e.touches[0].clientY - previousMouse.current.y;
      rotationVelocity.current = { x: dy * 0.005, y: dx * 0.005 };
      sceneRotation.current.x += dy * 0.005;
      sceneRotation.current.y += dx * 0.005;
      previousMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const handleTouchEnd = () => { isDragging.current = false; };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    // ─── ANIMATION LOOP ──────────────────────────────────────────
    let raf: number;
    function animate() {
      raf = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;
      const now = Date.now();

      galaxy.rotation.y = t * 0.008;
      stars.rotation.y = t * 0.003; stars.rotation.x = t * 0.002;
      rings.forEach((r,i)=>{r.rotation.z=t*(.06+i*.015);r.rotation.x=t*(.04+i*.01);});

      // Astronauts
      astronauts.forEach(a=>{
        a.mesh.position.add(a.speed);a.mesh.rotation.x+=a.rotSpeed.x;a.mesh.rotation.y+=a.rotSpeed.y;a.mesh.rotation.z+=a.rotSpeed.z;
        if(a.mesh.position.x>35)a.mesh.position.x=-35;if(a.mesh.position.x<-35)a.mesh.position.x=35;
        if(a.mesh.position.y>25)a.mesh.position.y=-25;if(a.mesh.position.y<-25)a.mesh.position.y=25;
      });

      // Rockets
      if(now>nextRocketTime){createRocket();nextRocketTime=now+8000+Math.random()*12000;}
      for(let i=rockets.length-1;i>=0;i--){const r=rockets[i];r.mesh.position.add(r.velocity);r.life++;
        if(r.life>r.maxLife*.7){const fade=1-(r.life-r.maxLife*.7)/(r.maxLife*.3);r.mesh.children.forEach(c=>{if((c as THREE.Mesh).material)((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity=fade*.7;});}
        if(r.life>r.maxLife){pivot.remove(r.mesh);rockets.splice(i,1);}
      }

      // Comets
      if(now>nextCometTime){createComet();nextCometTime=now+5000+Math.random()*7000;}
      for(let i=comets.length-1;i>=0;i--){const c=comets[i];c.mesh.position.add(c.velocity);c.life++;
        if(c.life>c.maxLife*.7){const fade=1-(c.life-c.maxLife*.7)/(c.maxLife*.3);c.mesh.children.forEach(ch=>{if((ch as THREE.Mesh).material)((ch as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity=fade*.9;});}
        if(c.life>c.maxLife){pivot.remove(c.mesh);comets.splice(i,1);}
      }

      // Shooting stars
      if(now>nextShootingStarTime){createShootingStar();nextShootingStarTime=now+6000+Math.random()*8000;}
      for(let i=shootingStars.length-1;i>=0;i--){const s=shootingStars[i];s.mesh.position.add(s.velocity);s.life++;
        if(s.life>s.maxLife*.5){(s.mesh.material as THREE.LineBasicMaterial).opacity=(1-(s.life-s.maxLife*.5)/(s.maxLife*.5))*.6;}
        if(s.life>s.maxLife){pivot.remove(s.mesh);shootingStars.splice(i,1);}
      }

      // Meteor showers
      if(now>nextMeteorShowerTime){createMeteorShower();nextMeteorShowerTime=now+15000+Math.random()*20000;}
      for(let i=meteorShowers.length-1;i>=0;i--){const sh=meteorShowers[i];let allDead=true;
        sh.particles.forEach(p=>{p.mesh.position.add(p.velocity);p.life++;
          if(p.life>sh.maxLife*.5){(p.mesh.material as THREE.MeshBasicMaterial).opacity=Math.max(0,(1-(p.life-sh.maxLife*.5)/(sh.maxLife*.5))*.7);}
          if(p.life<sh.maxLife)allDead=false;});
        if(allDead){sh.particles.forEach(p=>pivot.remove(p.mesh));meteorShowers.splice(i,1);}
      }

      // Drag inertia
      if(!isDragging.current){rotationVelocity.current.x*=.95;rotationVelocity.current.y*=.95;sceneRotation.current.x+=rotationVelocity.current.x;sceneRotation.current.y+=rotationVelocity.current.y;}
      pivot.rotation.x=sceneRotation.current.x;pivot.rotation.y=sceneRotation.current.y;

      renderer.render(scene, camera);
    }
    animate();

    const handleResize=()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);};
    window.addEventListener('resize',handleResize);

    return ()=>{
      cancelAnimationFrame(raf);
      document.removeEventListener('mousedown',handleMouseDown);
      document.removeEventListener('mousemove',handleMouseMove);
      document.removeEventListener('mouseup',handleMouseUp);
      document.removeEventListener('touchstart',handleTouchStart);
      document.removeEventListener('touchmove',handleTouchMove);
      document.removeEventListener('touchend',handleTouchEnd);
      window.removeEventListener('resize',handleResize);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}
