const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('C:/Users/rbghk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{
  const root=__dirname;
  const codle=(await fs.readFile(path.join(root,'codle-asset-study/assets/codle-drop-mask.svg'),'utf8')).replace('fill="white"','fill="#3e88ff"');
  const jitda=(await fs.readFile(path.join(root,'codle-asset-study/assets/jitda-logo.svg'),'utf8')).replace('viewBox="0 0 774.61 304.29"','viewBox="0 30 230 230"');
  await sharp(Buffer.from(codle)).resize(600,600,{fit:'contain',background:'#ffffff'}).flatten({background:'#ffffff'}).png().toFile(path.join(root,'codle-symbol-reference.png'));
  await sharp(Buffer.from(jitda)).resize(600,600,{fit:'contain',background:'#ffffff'}).flatten({background:'#ffffff'}).png().toFile(path.join(root,'jitda-symbol-reference.png'));
})();
