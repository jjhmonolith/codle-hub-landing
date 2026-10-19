import * as THREE from 'three';

// Compact precomputed attributes; no contour solving or meshing during startup.
export function decodeToyParts(buffer){
  const view=new DataView(buffer);
  if(view.getUint32(0,true)!==0x31594f54)throw new Error('Invalid toy model');
  const length=view.getUint32(4,true),start=(8+length+3)&~3;
  const manifest=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,8,length)));
  const types={Float32Array,Uint32Array,Uint16Array};
  return manifest.parts.map(({group,material,z,attributes,index})=>{
    const geometry=new THREE.BufferGeometry();
    const read=spec=>{
      let array;
      if(spec.encoding==='quantized-delta'){
        array=new Float32Array(spec.length);
        const packed=new Uint16Array(buffer,start+spec.offset,spec.length),previous=new Uint16Array(spec.itemSize);
        for(let i=0;i<spec.length;i++){
          const c=i%spec.itemSize,q=(previous[c]+packed[i])&65535;previous[c]=q;
          array[i]=spec.min[c]+q/65535*(spec.max[c]-spec.min[c]);
        }
      }else if(spec.encoding==='index-delta'){
        array=new types[spec.type](spec.length);
        const packed=new Uint8Array(buffer,start+spec.offset,spec.bytes);let cursor=0,previous=0;
        for(let i=0;i<spec.length;i++){
          let value=0,shift=0,byte;
          do{byte=packed[cursor++];value|=(byte&127)<<shift;shift+=7}while(byte&128);
          previous+=(value>>>1)^-(value&1);array[i]=previous;
        }
      }else throw new Error('Unknown toy model encoding');
      return new THREE.BufferAttribute(array,spec.itemSize,spec.normalized);
    };
    for(const [name,spec] of Object.entries(attributes))geometry.setAttribute(name,read(spec));
    if(index)geometry.setIndex(read(index));
    geometry.computeBoundingBox();geometry.computeBoundingSphere();
    return {group,material,z,geometry};
  });
}

export async function loadToyParts(){
  const response=await fetch(new URL('./assets/toy-models-v1.bin.gz',import.meta.url));
  if(!response.ok)throw new Error('Toy model unavailable');
  const stream=response.body.pipeThrough(new DecompressionStream('gzip'));
  return decodeToyParts(await new Response(stream).arrayBuffer());
}
