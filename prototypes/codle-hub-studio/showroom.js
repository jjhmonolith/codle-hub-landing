(function () {
  'use strict';
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const wrapIndex = (value, count) => ((value % count) + count) % count;
  const relativeOffset = (index, position, count) => wrapIndex(index - position + count / 2, count) - count / 2;
  function coverPose(distance, size) {
    const magnitude = Math.abs(distance);
    const near = Math.min(magnitude, 1);
    const farther = Math.max(0, magnitude - 1);
    return {
      x: Math.sign(distance) * size * (.91 * near + .64 * farther),
      z: -100 * near - 40 * farther,
      angle: -Math.sign(distance) * 32 * near,
      opacity: clamp(1 - farther * .08, .35, 1)
    };
  }
  function snapIndex(start, deltaX, stride, count, velocity = 0) {
    let next = Math.round(start - deltaX / stride);
    if (next === start && (Math.abs(deltaX) > 32 || (Math.abs(deltaX) > 12 && Math.abs(velocity) > .45))) next += deltaX < 0 ? 1 : -1;
    return wrapIndex(next, count);
  }
  // Pure geometry is also exercised by the dependency-free Node tests.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { wrapIndex, relativeOffset, coverPose, snapIndex };
    return;
  }

  const stage = document.querySelector('#cover-stage');
  if (!stage) return;
  const covers = [...stage.querySelectorAll('.album-cover')];
  const tabs = [...document.querySelectorAll('[data-flow-tab]')];
  const panels = [...document.querySelectorAll('.product-panel')];
  const names = panels.map(panel => panel.querySelector('h2').getAttribute('aria-label') || panel.querySelector('h2').textContent);
  const count = covers.length;
  const status = document.querySelector('#flow-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const lastOffsets = new Map();
  const repositions = new Map();
  let active = 0;
  let size = covers[0].offsetWidth;
  let stride = size * .78;
  let drag = null;
  let dragFrame = 0;
  let resizeFrame = 0;
  let suppressClickUntil = 0;
  const nav = tabs[0].parentElement;
  const indicator = document.createElement('span');
  indicator.className = 'tab-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  nav.append(indicator);
  let indicatorFrame = 0;
  function updateIndicator(immediate = false) {
    if (immediate) indicator.style.transition = 'none';
    const tab = tabs[active];
    indicator.style.transform = `translateX(${tab.offsetLeft}px) scaleX(${tab.offsetWidth})`;
    if (immediate) {
      cancelAnimationFrame(indicatorFrame);
      indicatorFrame = requestAnimationFrame(() => {
        indicatorFrame = requestAnimationFrame(() => { indicator.style.transition = ''; });
      });
    }
  }

  // Input modality changes the response, not the user's chosen motion setting.
  document.documentElement.dataset.inputMode = 'pointer';
  document.addEventListener('keydown', () => {
    document.documentElement.dataset.inputMode = 'keyboard';
  }, true);
  document.addEventListener('pointerdown', () => {
    document.documentElement.dataset.inputMode = 'pointer';
  }, true);

  function render(position, immediate = false) {
    if (immediate) stage.classList.add('is-resizing');
    covers.forEach((cover, index) => {
      const distance = relativeOffset(index, position, count);
      const pose = coverPose(distance, size);
      const previous = lastOffsets.get(cover);
      // A cover wrapping behind the shelf must not sweep across the front.
      if (previous !== undefined && Math.abs(previous - distance) > count / 2) {
        cover.classList.add('is-repositioning');
        cancelAnimationFrame(repositions.get(cover));
        repositions.set(cover, requestAnimationFrame(() => {
          repositions.set(cover, requestAnimationFrame(() => {
            cover.classList.remove('is-repositioning');
            repositions.delete(cover);
          }));
        }));
      }
      // Keep drag updates on the cover itself, without inherited CSS variables.
      cover.style.transform = `translateX(-50%) translate3d(${pose.x}px, 0, ${pose.z}px) rotateY(${pose.angle}deg)`;
      cover.style.opacity = pose.opacity;
      cover.style.zIndex = String(100 - Math.round(Math.abs(distance) * 15));
      lastOffsets.set(cover, distance);
    });
    if (immediate) {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = requestAnimationFrame(() => stage.classList.remove('is-resizing'));
      });
    }
  }

  function releaseDrag() {
    cancelAnimationFrame(dragFrame);
    dragFrame = 0;
    const pointerId = drag?.pointerId;
    drag = null;
    stage.classList.remove('is-dragging');
    if (pointerId !== undefined && stage.hasPointerCapture(pointerId)) stage.releasePointerCapture(pointerId);
  }

  function select(index, { focusTab = false, announce = true, immediate = false } = {}) {
    releaseDrag();
    active = wrapIndex(index, count);
    stage.dataset.activeIndex = active;
    covers.forEach((cover, i) => cover.setAttribute('aria-current', String(i === active)));
    panels.forEach((panel, i) => { panel.hidden = i !== active; });
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === active));
      tab.tabIndex = i === active ? 0 : -1;
    });
    document.querySelector('#flow-current').textContent = String(active + 1).padStart(2, '0');
    const instant = immediate || reduced.matches;
    render(active, instant);
    updateIndicator(instant);
    if (announce) status.textContent = `${names[active]}, ${count}개 상품 중 ${active + 1}번째`;
    if (focusTab) tabs[active].focus({ preventScroll: true });
    if (nav.scrollWidth > nav.clientWidth) nav.scrollTo({left: tabs[active].offsetLeft - (nav.clientWidth - tabs[active].offsetWidth) / 2, behavior: instant ? 'instant' : 'smooth'});
  }

  function onArrowKey(event, fromTab = false) {
    let target;
    if (event.key === 'ArrowRight') target = active + 1;
    else if (event.key === 'ArrowLeft') target = active - 1;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = count - 1;
    else return;
    event.preventDefault();
    select(target, { focusTab: fromTab, immediate: true });
  }
  covers.forEach((cover, index) => cover.addEventListener('click', event => select(index, { immediate: event.detail === 0 })));
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', event => select(index, { immediate: event.detail === 0 }));
    tab.addEventListener('keydown', event => onArrowKey(event, true));
  });
  stage.addEventListener('keydown', event => onArrowKey(event));
  document.querySelector('#flow-prev').addEventListener('click', event => select(active - 1, { immediate: event.detail === 0 }));
  document.querySelector('#flow-next').addEventListener('click', event => select(active + 1, { immediate: event.detail === 0 }));

  // Vertical scrolling and pinch zoom remain native. Only deliberate horizontal
  // gestures capture the pointer, and a drag never opens a product link.
  stage.addEventListener('pointerdown', event => {
    if (event.isPrimary === false || (event.pointerType === 'mouse' && event.button !== 0) || drag) return;
    suppressClickUntil = 0;
    drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, deltaX: 0, start: active, axis: null, samples: [{x:event.clientX, time:event.timeStamp}] };
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.axis) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
      drag.axis = Math.abs(dy) > Math.abs(dx) ? 'y' : 'x';
      if (drag.axis === 'x') {
        stage.setPointerCapture(event.pointerId);
        stage.classList.add('is-dragging');
      }
    }
    if (drag.axis !== 'x') return;
    event.preventDefault();
    // Retain only recent movement, so a held drag does not count as a flick.
    drag.samples.push({x:event.clientX, time:event.timeStamp});
    drag.samples = drag.samples.filter(sample => event.timeStamp - sample.time < 100);
    drag.deltaX = clamp(dx, -stride * 2.4, stride * 2.4);
    if (dragFrame) return;
    dragFrame = requestAnimationFrame(() => {
      dragFrame = 0;
      if (drag?.axis === 'x') render(drag.start - drag.deltaX / stride);
    });
  });
  stage.addEventListener('pointerup', event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const { axis, start, deltaX, samples } = drag;
    const recent = samples.find(sample => event.timeStamp - sample.time < 100);
    const elapsed = recent ? event.timeStamp - recent.time : 0;
    const velocity = elapsed > 0 ? (event.clientX - recent.x) / elapsed : 0;
    if (axis) suppressClickUntil = performance.now() + 500;
    if (axis === 'x') select(snapIndex(start, deltaX, stride, count, velocity));
    else releaseDrag();
  });
  function cancelDrag() {
    if (!drag) return;
    suppressClickUntil = performance.now() + 500;
    releaseDrag();
    render(active, true);
  }
  stage.addEventListener('pointercancel', cancelDrag);
  stage.addEventListener('lostpointercapture', cancelDrag);
  // A press released outside the stage must not leave a stale drag session.
  window.addEventListener('pointerup', () => { if (drag) cancelDrag(); });
  stage.addEventListener('click', event => {
    if (performance.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  stage.addEventListener('dragstart', event => event.preventDefault());

  function resize() {
    releaseDrag();
    size = covers[0].offsetWidth;
    stride = size * .78;
    render(active, true);
    updateIndicator(true);
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize', resize, { passive: true });
  reduced.addEventListener('change', () => select(active, { announce: false, immediate: true }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelDrag(); });
  const inquiryDialog = document.querySelector('#inquiry-dialog');
  new MutationObserver(() => { if (inquiryDialog.open) cancelDrag(); }).observe(inquiryDialog, { attributes: true, attributeFilter: ['open'] });
  // Font metrics may settle after the first render.
  document.fonts?.ready.then(() => updateIndicator(true));
  if (window.ResizeObserver) new ResizeObserver(() => updateIndicator(true)).observe(nav);
  select(0, { announce: false, immediate: true });
})();
