(() => {
 const elements=document.querySelectorAll('[data-reveal]');
 if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
 },{threshold:.08,rootMargin:'0px 0px -30px 0px'});
 document.documentElement.classList.add('flow-ready');
 elements.forEach(element=>observer.observe(element));
})();
