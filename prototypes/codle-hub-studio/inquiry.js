(() => {
  'use strict';
  function quote(passes) {
    const ai = passes.includes('ai'), cmass = passes.includes('cmass');
    const base = ai || cmass ? 20000 : 22000;
    return { base, total: base + (ai ? 20000 : 0) + (cmass ? 10000 : 0) };
  }
  function validate(v) {
    const e = {};
    if (!v.school.trim()) e.school = '학교명을 입력해주세요.';
    if (!v.contact.trim()) e.contact = '성함을 입력해주세요.';
    if (!/^010-?\d{3,4}-?\d{4}$/.test(v.phone)) e.phone = '휴대전화번호 형식을 확인해주세요.';
    if (!/^\d+$/.test(v.count.trim()) || Number(v.count) < 1) e.count = '인원을 1명 이상의 숫자로 입력해주세요.';
    if (!v.timing.trim()) e.timing = '사용 학기 또는 희망 일정을 입력해주세요.';
    if (!v.consent) e.consent = '개인정보 수집·이용 동의를 확인해주세요.';
    return e;
  }
  if (typeof module !== 'undefined') module.exports = { quote, validate };
  if (typeof document === 'undefined') return;
  const $ = s => document.querySelector(s);
  const dialog = $('#inquiry-dialog'), form = $('#school-inquiry-form'), review = $('#inquiry-review');
  const keys = ['school','contact','phone','count','timing','consent'];
  const fields = Object.fromEntries(keys.map(k => [k, $('#inquiry-' + k)]));
  const interest = $('#inquiry-interest');
  const passes = new Set(), drafts = new Map();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopPointer = window.matchMedia('(min-width: 700px) and (hover: hover) and (pointer: fine)');
  let modalAnimation = null, closing = false;
  let entry = '', returnFocus = null, attempted = false;
  const names = { subscription:'코들 구독 (Pro 플랜 + 콘텐츠 이용권)', camp:'코들 AI 집중캠프', hackathon:'짓다 AI 해커톤' };
  const values = () => Object.fromEntries(keys.map(k => [k, k === 'consent' ? fields[k].checked : fields[k].value]));
  function render() {
    const sub = interest.value === 'subscription';
    $('#subscription-options').hidden = !sub;
    $('#count-label').textContent = sub ? '학생 수' : '참여 인원';
    $('#timing-label').textContent = sub ? '사용 학기' : '희망 일정';
    fields.timing.placeholder = sub ? '예: 2027년 1학기' : '예: 11월 중 / 아직 미정';
    document.querySelectorAll('[data-pass]').forEach(b => b.setAttribute('aria-pressed', String(passes.has(b.dataset.pass))));
    const q = quote([...passes]);
    $('#quote-breakdown').textContent = 'Pro ' + q.base.toLocaleString() + '원' + (passes.has('ai') ? ' + Codle AI 20,000원' : '') + (passes.has('cmass') ? ' + 씨마스 10,000원' : '') + ' = 1인·1학기 ' + q.total.toLocaleString() + '원';
  }
  function errors(e) {
    keys.forEach(k => { fields[k].setAttribute('aria-invalid', String(!!e[k])); const node = $('#inquiry-' + k + '-error'); node.hidden = !e[k]; node.textContent = e[k] || ''; });
    $('#inquiry-validation').hidden = !Object.keys(e).length;
    $('#inquiry-validation').textContent = Object.keys(e).length + '개 항목을 확인해주세요.';
  }
  function saveDraft() {
    if (entry) drafts.set(entry, { interest:interest.value, passes:[...passes], count:fields.count.value, timing:fields.timing.value });
  }
  function stopModalAnimation() {
    modalAnimation?.cancel();
    modalAnimation = null;
  }
  function animateModal(frames, duration, onFinish) {
    stopModalAnimation();
    const animation = dialog.animate(frames, { duration, easing:'cubic-bezier(0.23, 1, 0.32, 1)', fill:'both' });
    modalAnimation = animation;
    animation.finished.then(() => {
      if (modalAnimation !== animation) return;
      stopModalAnimation();
      onFinish?.();
    }).catch(() => {}); // Cancelling an entrance or exit is an expected interruption.
  }
  function closeDialog(animate) {
    if (!dialog.open) return;
    if (!animate || reducedMotion.matches || !dialog.animate) {
      stopModalAnimation();
      closing = false;
      dialog.close();
      return;
    }
    if (closing) return;
    closing = true;
    // Read the current frame so a quick close never jumps back to full size.
    const current = getComputedStyle(dialog);
    const from = { opacity:current.opacity, transform:current.transform };
    animateModal([from, { opacity:0, transform:'scale(0.98)' }], 140, () => dialog.close());
  }
  document.querySelectorAll('[data-inquiry]').forEach(b => b.addEventListener('click', e => {
    stopModalAnimation(); closing = false;
    saveDraft(); entry = b.dataset.inquiry || 'general'; returnFocus = b;
    const draft = drafts.get(entry);
    interest.value = draft?.interest || (entry === 'camp' || entry === 'hackathon' ? entry : 'subscription');
    passes.clear();
    (draft?.passes || (entry === 'original' ? ['ai'] : entry === 'cmass' ? ['cmass'] : [])).forEach(p => passes.add(p));
    fields.count.value = draft?.count || ''; fields.timing.value = draft?.timing || '';
    interest.disabled = entry !== 'general';
    $('#inquiry-product-name').textContent = entry === 'general' ? '상담할 항목 하나를 선택해주세요.' : '선택한 상품의 문의 항목을 자동으로 반영했어요.';
    form.hidden = false; review.hidden = true; attempted = false; errors({}); render();
    dialog.showModal(); document.body.classList.add('modal-open');
    const pointer = e.detail > 0;
    const initialFocus = pointer && e.pointerType !== 'touch' && desktopPointer.matches ? fields.school : $('.close-dialog');
    initialFocus.focus({ preventScroll:true }); $('.inquiry-scroll').scrollTop = 0;
    if (pointer && !reducedMotion.matches && dialog.animate) {
      animateModal([{ opacity:0, transform:'scale(0.98)' }, { opacity:1, transform:'scale(1)' }], 220);
    }
  }));
  document.querySelectorAll('[data-pass]').forEach(b => b.addEventListener('click', () => { passes.has(b.dataset.pass) ? passes.delete(b.dataset.pass) : passes.add(b.dataset.pass); render(); }));
  interest.addEventListener('change', () => { fields.count.value = ''; fields.timing.value = ''; render(); });
  keys.forEach(k => fields[k].addEventListener('input', () => { if (attempted) errors(validate(values())); }));
  $('.close-dialog').addEventListener('click', e => closeDialog(e.detail > 0));
  $('#inquiry-done').addEventListener('click', e => closeDialog(e.detail > 0));
  dialog.addEventListener('cancel', e => { e.preventDefault(); closeDialog(false); });
  dialog.addEventListener('close', () => { stopModalAnimation(); closing = false; saveDraft(); document.body.classList.remove('modal-open'); returnFocus?.focus({ preventScroll:true }); });
  form.addEventListener('submit', e => {
    e.preventDefault(); attempted = true;
    const v = values(), invalid = validate(v); errors(invalid);
    if (Object.keys(invalid).length) { fields[Object.keys(invalid)[0]].focus(); return; }
    const rows = [['학교명',v.school],['성함',v.contact],['휴대전화번호',v.phone],['관심 항목',names[interest.value]]];
    if (interest.value === 'subscription') rows.push(['이용권',[...(passes.has('ai') ? ['Codle AI'] : []), ...(passes.has('cmass') ? ['씨마스 인기초'] : [])].join(', ') || '추가 없음 · Pro만 이용'],['1인·1학기 기준가',quote([...passes]).total.toLocaleString() + '원 · 최종 견적은 상담 후 확정']);
    rows.push(['인원',v.count + '명'],[interest.value === 'subscription' ? '사용 학기' : '희망 일정',v.timing]);
    const details = $('#inquiry-review-details'); details.replaceChildren();
    rows.forEach(([k,v]) => { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; details.append(dt,dd); });
    form.hidden = true; review.hidden = false; $('#inquiry-review-title').focus();
  });
  $('#inquiry-edit').addEventListener('click', () => { review.hidden = true; form.hidden = false; fields.school.focus(); });
})();
