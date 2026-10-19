"""Extract authentic covers from the official content book, without repainting.

The small JP2 images are stored sideways in the PDF. Only a lossless quarter
turn is needed; keep their original resolution and record the source identity.
"""
from pathlib import Path
import json
from PIL import Image
from pypdf import PdfReader

root = Path(__file__).resolve().parents[1]
source = root / 'references/content-thumbnails.json'
manifest = json.loads(source.read_text(encoding='utf-8-sig'))
existing = {(item['pdfPage'], item['embeddedImage']): item for item in manifest['items']}
reader = PdfReader(root / 'references/codle-contents-book-260123.pdf')
items = []
for page_number in [8, 9, 27]:
    for embedded in reader.pages[page_number - 1].images:
        image = embedded.image
        width, height = image.size
        sideways = .5 < width / height < .65 and 70 <= width <= 75
        if not sideways and not (1.5 < width / height < 2.2 and width > 200):
            continue
        if sideways:
            image = image.transpose(Image.Transpose.ROTATE_270)
        item = existing.get((page_number, embedded.name), {
            'file': f'thumbnail-p{page_number}-{Path(embedded.name).stem.lower()}.webp',
            'pdfPage': page_number,
            'embeddedImage': embedded.name,
        }).copy()
        item['dimensions'] = list(image.size)
        item['rotationDegreesClockwise'] = 90 if sideways else 0
        image.convert('RGB').save(root / 'assets/worlds' / item['file'], lossless=True)
        items.append(item)

assert len(items) == 24
manifest['items'] = items
manifest['note'] = ('24 authentic embedded content covers. Lossless extraction; '
                    'sideways PDF images rotated to match the printed page. '
                    'No repainting, cropping, generative replacement or upscaling.')
for path in [source, root / 'assets/worlds/content-thumbnails.sources.json']:
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Extracted {len(items)} distinct covers; {sum(i["rotationDegreesClockwise"] != 0 for i in items)} corrected orientations.')
