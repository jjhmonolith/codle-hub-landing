/* Original WebGL treatment inspired by the publicly demonstrated dither/reveal
   interaction. No OriginKit source or assets are copied into this prototype. */
(() => {
  'use strict';
  const hero=document.getElementById('hero'), art=document.getElementById('art');
  const canvas=document.getElementById('reveal-canvas'), source=document.getElementById('ribbon-image');
  const motionButton=document.getElementById('motion-toggle'), colorButton=document.getElementById('color-toggle');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let gl;
  try { gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'}); } catch (_) { return; }
  if(!gl)return;
  const vertex=`attribute vec2 a_position;varying vec2 v_uv;void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;
  const fragment=`
    precision highp float;
    varying vec2 v_uv;
    uniform sampler2D u_image;
    uniform vec2 u_size;
    uniform vec2 u_imageSize;
    uniform vec2 u_pointer;
    uniform float u_time;
    uniform float u_active;
    uniform float u_color;
    uniform float u_motion;
    uniform float u_alignment;
    vec3 sampleImage(vec2 p){
      float screenAspect=u_size.x/u_size.y;
      float imageAspect=u_imageSize.x/u_imageSize.y;
      vec2 scale=vec2(min(1.,screenAspect/imageAspect),min(1.,imageAspect/screenAspect));
      return texture2D(u_image,p*scale+(1.-scale)*vec2(u_alignment,.5)).rgb;
    }
    void main(){
      vec2 px=v_uv*u_size;
      float radius=min(195.,u_size.x*.26);
      float distanceToPointer=length(px-u_pointer*u_size);
      float reveal=(1.-smoothstep(radius*.40,radius,distanceToPointer))*u_active;
      reveal=max(reveal,u_color);
      vec2 uv=v_uv;
      float wave=sin(uv.x*7.+uv.y*4.+u_time*.45);
      uv.x+=wave*.0020*u_motion;
      uv.y+=cos(uv.x*5.-u_time*.32)*.0017*u_motion;
      vec3 original=sampleImage(uv);
      float cell=2.7;
      vec2 cellUV=(floor(px/cell)*cell+cell*.5)/u_size;
      vec3 cellColor=sampleImage(cellUV+uv-v_uv);
      float luminance=dot(cellColor,vec3(.2126,.7152,.0722));
      float coverage=clamp((.965-luminance)*1.2,0.,.88);
      float dotRadius=sqrt(coverage)*.64;
      float dotDistance=length(fract(px/cell)-.5);
      float dots=1.-smoothstep(dotRadius-.065,dotRadius+.065,dotDistance);
      vec3 paper=vec3(.973,.977,.973);
      vec3 ink=mix(vec3(.26,.39,.67),vec3(.12,.28,.62),1.-luminance);
      vec3 halftone=mix(paper,ink,dots*.84);
      halftone=mix(halftone,mix(paper,vec3(.45,.58,.79),1.-luminance),.20);
      gl_FragColor=vec4(mix(halftone,original,reveal),1.);
    }`;
  function compile(type,code){const shader=gl.createShader(type);gl.shaderSource(shader,code);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw new Error('Shader unavailable');}return shader;}
  let program;
  try{
    program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Program unavailable');
  }catch(_){return;}
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const uniform={};['size','imageSize','pointer','time','active','color','motion','alignment'].forEach(name=>uniform[name]=gl.getUniformLocation(program,'u_'+name));
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  let ready=false, visible=true, paused=reduced.matches, fullColor=false, contextLost=false;
  let frameId=0, lastTime=0, time=0, active=0, activeTarget=0, color=0;
  let px=.75,py=.55,tx=px,ty=py;
  function draw(){
    if(!ready||contextLost)return;
    const r=art.getBoundingClientRect();gl.uniform2f(uniform.size,r.width,r.height);gl.uniform2f(uniform.imageSize,source.naturalWidth,source.naturalHeight);
    gl.uniform1f(uniform.alignment,innerWidth>600&&innerWidth<=1000?.22:.5);
    gl.uniform2f(uniform.pointer,px,py);gl.uniform1f(uniform.time,time);gl.uniform1f(uniform.active,active);gl.uniform1f(uniform.color,color);gl.uniform1f(uniform.motion,paused?0:1);
    gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function frame(now){
    frameId=0;if(!visible||document.hidden||!ready||contextLost){lastTime=0;return;}
    const dt=Math.min((now-(lastTime||now))/1000,.05);lastTime=now;
    if(!paused)time+=dt;
    const follow=reduced.matches?1:1-Math.exp(-dt*13);
    px+=(tx-px)*follow;py+=(ty-py)*follow;active+=(activeTarget-active)*follow;color+=((fullColor?1:0)-color)*follow;
    draw();
    const settling=Math.abs(activeTarget-active)>.001||Math.abs((fullColor?1:0)-color)>.001||Math.abs(tx-px)+Math.abs(ty-py)>.0001;
    if(!paused||settling)frameId=requestAnimationFrame(frame);else lastTime=0;
  }
  function wake(){if(!frameId&&ready&&visible&&!document.hidden&&!contextLost)frameId=requestAnimationFrame(frame);}
  function resize(){const r=art.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,1.6);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);gl.viewport(0,0,canvas.width,canvas.height);draw();wake();}
  function updateMotion(){paused=reduced.matches||paused;motionButton.disabled=reduced.matches;motionButton.setAttribute('aria-pressed',String(paused));motionButton.innerHTML=reduced.matches?'기기 모션 설정 적용':paused?'모션 켜기 <span aria-hidden="true">▷</span>':'모션 끄기 <span aria-hidden="true">Ⅱ</span>';draw();wake();}
  function point(event){
    if(event.target.closest('a,button')){activeTarget=0;wake();return;}
    const r=art.getBoundingClientRect();tx=(event.clientX-r.left)/r.width;ty=1-(event.clientY-r.top)/r.height;
    activeTarget=tx>=0&&tx<=1&&ty>=0&&ty<=1?1:0;
    if(reduced.matches){px=tx;py=ty;active=activeTarget;}wake();
  }
  hero.addEventListener('pointermove',point,{passive:true});hero.addEventListener('pointerdown',point,{passive:true});
  hero.addEventListener('pointerleave',()=>{activeTarget=0;wake();});
  hero.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse'){activeTarget=0;wake();}});
  hero.addEventListener('pointercancel',()=>{activeTarget=0;wake();});
  motionButton.addEventListener('click',()=>{paused=!paused;updateMotion();});
  colorButton.addEventListener('click',()=>{fullColor=!fullColor;colorButton.setAttribute('aria-pressed',String(fullColor));colorButton.innerHTML=fullColor?'점무늬로 보기 <span aria-hidden="true">◌</span>':'색으로 보기 <span aria-hidden="true">◐</span>';if(reduced.matches)color=fullColor?1:0;wake();});
  reduced.addEventListener('change',()=>{paused=reduced.matches;updateMotion();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;lastTime=0;}else wake();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frameId);frameId=0;lastTime=0;}else wake();}).observe(hero);
  new ResizeObserver(resize).observe(art);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();contextLost=true;cancelAnimationFrame(frameId);frameId=0;art.classList.remove('ready');document.getElementById('art-tools').hidden=true;});
  function loaded(){if(ready||!source.naturalWidth)return;try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,source);ready=true;resize();updateMotion();art.classList.add('ready');document.getElementById('art-tools').hidden=false;wake();}catch(_){art.classList.remove('ready');}}
  if(source.complete)loaded();else source.addEventListener('load',loaded,{once:true});
})();
