// Match the browser import map when building geometry with Node.
export async function resolve(specifier,context,nextResolve){
  if(specifier==='three')return {url:new URL('../vendor/three.module.min.js',import.meta.url).href,shortCircuit:true};
  return nextResolve(specifier,context);
}
