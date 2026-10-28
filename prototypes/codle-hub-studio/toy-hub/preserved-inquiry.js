(() => {
  const dialog = document.querySelector('#inquiry-dialog');
  if (!dialog) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'inquiry-shade'; backdrop.hidden = true; backdrop.setAttribute('aria-hidden','true'); document.body.append(backdrop);
  const form = dialog.querySelector('form'), review = dialog.querySelector('#inquiry-review');
  const media = matchMedia('(min-width:1000px)'), reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const fields = Object.fromEntries(['school','contact','phone','interest','audience','count','timing','message'].map(k => [k,dialog.querySelector('#inquiry-'+k)]));
  let returnFocus, animation;
  function errors() {
    const invalid = {};
    if (!fields.school.value.trim()) invalid.school = '기관·회사명을 입력해주세요.';
    if (!fields.contact.value.trim()) invalid.contact = '담당자명을 입력해주세요.';
    if (!/^[+\d()\s-]+$/.test(fields.phone.value.trim()) || fields.phone.value.replace(/\D/g,'').length < 8) invalid.phone = '연락 가능한 전화번호를 입력해주세요.';
    ['school','contact','phone'].forEach(k => {
      fields[k].setAttribute('aria-invalid',String(!!invalid[k]));
      const error=dialog.querySelector('#inquiry-'+k+'-error');error.hidden=!invalid[k];error.textContent=invalid[k]||'';
    });
    const summary=dialog.querySelector('#inquiry-validation');summary.hidden=!Object.keys(invalid).length;summary.textContent='필수 항목을 확인해주세요.';
    return Object.keys(invalid);
  }
  function close() {
    animation?.cancel();
    if (reduced.matches) {dialog.close();return;}
    animation=dialog.animate([{transform:'translateX(0)',opacity:1},{transform:'translateX(40px)',opacity:0}],{duration:180,easing:'ease-in'});
    animation.finished.then(()=>dialog.close()).catch(()=>{});
  }
  document.querySelectorAll('[data-inquiry]').forEach(button=>button.addEventListener('click',()=>{
    animation?.cancel();returnFocus=button;
    fields.interest.value=button.dataset.inquiry||'general';
    form.hidden=false;review.hidden=true;
    dialog.querySelectorAll('.field-error').forEach(e=>e.hidden=true);
    dialog.querySelector('#inquiry-validation').hidden=true;
    ['school','contact','phone'].forEach(k=>fields[k].removeAttribute('aria-invalid'));
    dialog.classList.toggle('is-docked',media.matches);
    document.body.classList.add(media.matches?'inquiry-drawer-open':'modal-open');
    backdrop.hidden = !media.matches;
    document.querySelector('.hub-header').inert = true;
    document.querySelector('.split-layout').inert = true;
    if(!dialog.open) media.matches?dialog.show():dialog.showModal();
    dialog.querySelector('.inquiry-scroll').scrollTop=0;
    fields.school.focus({preventScroll:true});
    if(!reduced.matches) animation=dialog.animate([{transform:'translateX(100%)',opacity:0},{transform:'translateX(0)',opacity:1}],{duration:440,easing:'cubic-bezier(.23,1,.32,1)'});
  }));
  backdrop.addEventListener('click',close);
  dialog.addEventListener('click',e=>{if(e.target===dialog&&!media.matches){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
  dialog.querySelector('.close-dialog').addEventListener('click',close);
  dialog.querySelector('#inquiry-done').addEventListener('click',close);
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog.classList.contains('is-docked')){e.preventDefault();close();}});
  dialog.addEventListener('close',()=>{animation?.cancel();backdrop.hidden=true;document.querySelector('.hub-header').inert=false;document.querySelector('.split-layout').inert=false;document.body.classList.remove('inquiry-drawer-open','modal-open');returnFocus?.focus({preventScroll:true});});
  media.addEventListener('change',()=>{if(dialog.open)dialog.close();});
  form.addEventListener('submit',e=>{
    e.preventDefault();const invalid=errors();if(invalid.length){fields[invalid[0]].focus();return;}
    const labels={school:'기관·회사명',contact:'담당자명',phone:'연락처',interest:'관심 서비스',audience:'대상',count:'규모',timing:'희망 시기',message:'문의 내용'};
    const details=dialog.querySelector('#inquiry-review-details');details.replaceChildren();
    Object.entries(fields).forEach(([key,field])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=labels[key];dd.textContent=(key==='interest'?field.selectedOptions[0].textContent:field.value)||'미정';details.append(dt,dd);});
    form.hidden=true;review.hidden=false;dialog.querySelector('#inquiry-review-title').focus();
  });
  dialog.querySelector('#inquiry-edit').addEventListener('click',()=>{review.hidden=true;form.hidden=false;fields.school.focus();});
})();
