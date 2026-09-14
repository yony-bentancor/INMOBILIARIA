document.addEventListener('DOMContentLoaded',()=>{
  const art=document.querySelector('[data-qr-art]');
  const object=document.querySelector('[data-qr-object]');
  if(!art||!object) return;

  const title=document.querySelector('[data-stage-title]');
  const subtitle=document.querySelector('[data-stage-subtitle]');
  const buttons=[...document.querySelectorAll('[data-stage-button]')];

  // Matriz visual QR: finder patterns + datos deterministas.
  // Es un objeto gráfico interactivo, no se usa para navegación/lectura real.
  const size=21;
  const matrix=Array.from({length:size},()=>Array(size).fill(false));

  const finder=(ox,oy)=>{
    for(let y=0;y<7;y++){
      for(let x=0;x<7;x++){
        const edge=x===0||y===0||x===6||y===6;
        const core=x>=2&&x<=4&&y>=2&&y<=4;
        if(edge||core) matrix[oy+y][ox+x]=true;
      }
    }
  };

  finder(0,0);
  finder(size-7,0);
  finder(0,size-7);

  for(let i=8;i<size-8;i++){
    matrix[6][i]=i%2===0;
    matrix[i][6]=i%2===0;
  }

  // Datos pseudoaleatorios reproducibles para completar el patrón.
  let seed=1931;
  const rand=()=>{
    seed=(seed*9301+49297)%233280;
    return seed/233280;
  };

  for(let y=0;y<size;y++){
    for(let x=0;x<size;x++){
      const inFinder=
        (x<8&&y<8)||
        (x>=size-8&&y<8)||
        (x<8&&y>=size-8)||
        x===6||y===6;
      if(!inFinder && rand()>.56) matrix[y][x]=true;
    }
  }

  const cells=[];
  const step=12.2;
  const half=(size-1)/2;

  matrix.forEach((row,y)=>{
    row.forEach((on,x)=>{
      if(!on) return;
      const el=document.createElement('span');
      el.className='qr-pixel';
      el.dataset.x=x;
      el.dataset.y=y;
      el.dataset.n=cells.length;
      object.appendChild(el);
      cells.push({el,x,y,n:cells.length});
    });
  });

  const stages={
    qr:{title:'ESCANEÁ',subtitle:'IDEAS EN MOVIMIENTO'},
    explode:{title:'CONECTA',subtitle:'PIEZAS QUE SE ENCUENTRAN'},
    wave:{title:'CREA',subtitle:'LA IDEA CAMBIA DE FORMA'},
    orb:{title:'TRANSFORMA',subtitle:'UN SISTEMA, MUCHAS POSIBILIDADES'},
    stack:{title:'IMPULSA',subtitle:'TECNOLOGÍA QUE SE CONVIERTE EN NEGOCIO'}
  };
  const order=Object.keys(stages);
  let current=0;
  let timer=null;

  const t=(x,y,z=0,s=1,r=0)=>`translate3d(${x}px,${y}px,${z}px) scale(${s}) rotate(${r}deg)`;

  function paint(stage){
    object.dataset.stage=stage;
    const meta=stages[stage];
    if(title) title.textContent=meta.title;
    if(subtitle) subtitle.textContent=meta.subtitle;

    buttons.forEach(btn=>btn.classList.toggle('active',btn.dataset.stageButton===stage));

    cells.forEach(({el,x,y,n})=>{
      const bx=(x-half)*step;
      const by=(y-half)*step;
      let tx=bx,ty=by,tz=0,scale=1,rot=0,opacity=1;

      if(stage==='explode'){
        const angle=(n*137.508)*Math.PI/180;
        const distance=26+((n*17)%55);
        tx=bx+Math.cos(angle)*distance;
        ty=by+Math.sin(angle)*distance;
        tz=((n%9)-4)*9;
        scale=.72+((n%7)/18);
        rot=(n%2?1:-1)*(8+(n%5)*4);
        opacity=.78+(n%4)*.055;
      }

      if(stage==='wave'){
        tx=bx*.93;
        ty=by*.78+Math.sin((x*.72)+(y*.17))*28;
        tz=Math.cos((x*.45)+(y*.3))*34;
        scale=.78+(Math.sin(x*.4+y*.18)+1)*.12;
        rot=Math.sin(y*.55)*15;
        opacity=.9;
      }

      if(stage==='orb'){
        const nx=(x-half)/half;
        const ny=(y-half)/half;
        const rr=Math.min(1,Math.sqrt(nx*nx+ny*ny));
        const theta=Math.atan2(ny,nx);
        const radial=rr*112;
        const sphere=Math.sqrt(Math.max(0,1-Math.min(1,rr*rr)));
        tx=Math.cos(theta)*radial;
        ty=Math.sin(theta)*radial*.96;
        tz=sphere*82-28;
        scale=.55+sphere*.65;
        rot=theta*12;
        opacity=.64+sphere*.36;
      }

      if(stage==='stack'){
        const layer=(x+y)%5;
        tx=(x-half)*8.6 + (layer-2)*13;
        ty=(y-half)*8.6 - (layer-2)*9;
        tz=(layer-2)*32;
        scale=.72+(layer*.045);
        rot=-7+(layer*3.5);
        opacity=.74+layer*.055;
      }

      el.style.transform=t(tx,ty,tz,scale,rot);
      el.style.opacity=opacity;
      el.style.zIndex=String(Math.round(tz+100));
      el.style.transitionDelay=`${(n%17)*7}ms`;
    });

    if(stage==='orb') object.style.transform='rotateY(-12deg) rotateX(5deg)';
    else if(stage==='stack') object.style.transform='rotateY(-17deg) rotateX(8deg)';
    else if(stage==='wave') object.style.transform='rotateY(8deg)';
    else object.style.transform='none';
  }

  function next(){
    current=(current+1)%order.length;
    paint(order[current]);
  }

  function start(){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    clearInterval(timer);
    timer=setInterval(next,1050);
  }

  function stop(){
    clearInterval(timer);
    timer=null;
    current=0;
    paint('qr');
  }

  art.addEventListener('pointerenter',start);
  art.addEventListener('pointerleave',stop);

  art.addEventListener('pointermove',e=>{
    const rect=art.getBoundingClientRect();
    const nx=(e.clientX-rect.left)/rect.width-.5;
    const ny=(e.clientY-rect.top)/rect.height-.5;
    const scanner=art.querySelector('.qrsite-scanner');
    if(scanner){
      scanner.style.transform=`rotateY(${nx*5}deg) rotateX(${-ny*4}deg) scale(1.02)`;
    }
  });

  art.addEventListener('pointerleave',()=>{
    const scanner=art.querySelector('.qrsite-scanner');
    if(scanner) scanner.style.transform='';
  });

  buttons.forEach(btn=>{
    btn.addEventListener('click',()=>{
      clearInterval(timer);
      current=Math.max(0,order.indexOf(btn.dataset.stageButton));
      paint(order[current]);
    });
  });

  // En pantallas táctiles, tocar el QR cambia de forma.
  object.addEventListener('click',()=>{
    if(matchMedia('(hover: none)').matches) next();
  });

  paint('qr');
});
