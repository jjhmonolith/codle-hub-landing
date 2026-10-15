"""Submit one cinematic study or resume it without duplicate charges."""
from pathlib import Path
import base64, json, os, sys, urllib.request

root=Path(__file__).resolve().parent
state=root/'prediction.json'
token=os.environ.get('REPLICATE_API_TOKEN')
if not token:
    raise SystemExit('Replicate token is unavailable in this process.')

def request(url, data=None):
    headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'}
    req=urllib.request.Request(url,data=None if data is None else json.dumps(data).encode(),headers=headers)
    with urllib.request.urlopen(req,timeout=90) as response:
        return json.load(response)

mode=sys.argv[1]
if mode=='submit':
    if state.exists():
        raise SystemExit('A prediction already exists; use poll to resume.')
    image=root/'opening.png'
    config=json.loads((root/'video-config.json').read_text(encoding='utf-8-sig'))
    inputs=dict(config['input'])
    inputs['start_image']='data:image/png;base64,'+base64.b64encode(image.read_bytes()).decode()
    result=request('https://api.replicate.com/v1/models/'+config['model']+'/predictions',{'input':inputs})
    state.write_text(json.dumps(result,indent=2),encoding='utf-8')
elif mode=='poll':
    previous=json.loads(state.read_text(encoding='utf-8'))
    result=request('https://api.replicate.com/v1/predictions/'+previous['id'])
    state.write_text(json.dumps(result,indent=2),encoding='utf-8')
    if result['status']=='succeeded':
        output=result['output']
        if isinstance(output,list): output=output[0]
        if not (root/'approach.mp4').exists():
            with urllib.request.urlopen(output,timeout=120) as response:
                (root/'approach.mp4').write_bytes(response.read())
else:
    raise SystemExit('Use submit or poll.')
print(json.dumps({key:result.get(key) for key in ('id','status','error')},ensure_ascii=False))
