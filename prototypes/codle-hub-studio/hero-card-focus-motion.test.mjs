import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sample} from './hero-card-focus-motion.mjs';
test('all 501 poses are finite and preserve a positive card surface',()=>{for(let i=0;i<=500;i++){const p=sample(i/100);for(const v of Object.values(p))assert(Number.isFinite(v));assert(p.cs>0&&p.height>=256&&p.height<=540);assert(p.open>=0&&p.open<=1);}});
test('final pose holds and reverse seek is deterministic',()=>{assert.deepEqual(sample(4),sample(5));const a=sample(1.5);sample(5);assert.deepEqual(a,sample(1.5));});
test('card lifts before its contents unfold',()=>{assert.equal(sample(2).lift,1);assert.equal(sample(2).open,0);assert.equal(sample(4).open,1);});
