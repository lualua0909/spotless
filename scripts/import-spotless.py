"""Build the local Spotless snapshot from saved public pages (requires beautifulsoup4).
Usage: python3 scripts/import-spotless.py. Exactly ten representative articles.
"""
import concurrent.futures as futures
import hashlib
import json
import subprocess
import time
import re
import urllib.parse as url
import urllib.request as http
import xml.etree.ElementTree as ET
from pathlib import Path
from bs4 import BeautifulSoup

ORIGIN = 'https://spotless.vn'
ROOT = Path(__file__).resolve().parents[1]
RESEARCH = ROOT / 'docs/research/spotless'
ASSETS = ROOT / 'public/sites/spotless'
SOURCE = RESEARCH / 'source'
for folder in (ASSETS, SOURCE, ROOT / 'src/data'): folder.mkdir(parents=True, exist_ok=True)

def fetch(address):
    address = url.quote(address, safe=':/?=&%+#')
    request = http.Request(address, headers={'User-Agent': 'Mozilla/5.0 SpotlessLocalClone/1.0'})
    for attempt in range(2):
        try:
            with http.urlopen(request, timeout=60) as response: return response.read()
        except http.HTTPError as error:
            if error.code == 429 and re.search(r'/collections/|/products/', address): raise
            if error.code not in (429,500,502,503) or attempt == 1: raise
            print('Retrying', address, 'after server cooldown', flush=True)
            time.sleep(max(60, int(error.headers.get('Retry-After', '60'))))

def soup_at(path):
    filename = SOURCE / (hashlib.sha256(path.encode()).hexdigest()[:12] + '.html')
    legacy = SOURCE / (path.split('/')[-1] + '.html')
    if not filename.exists() and legacy.exists(): filename.write_bytes(legacy.read_bytes())
    if not filename.exists():
        try: filename.write_bytes(fetch(ORIGIN + path))
        except http.HTTPError as error:
            if error.code not in (404,429): raise
            if error.code == 429:
                print('Source unavailable:', path, flush=True)
                filename.write_text('<main data-source-unavailable="429"></main>')
            else: filename.write_bytes(error.read())
    return BeautifulSoup(filename.read_text(), 'html.parser')

def text(node, selector=None):
    node = node.select_one(selector) if selector and node else node
    return node.get_text(' ', strip=True) if node else ''

def attr(node, key, default=''): return node.get(key, default) if node else default

def clean_html(node):
    if not node: return ''
    node = BeautifulSoup(str(node), 'html.parser')
    for frame in node.select('iframe'):
        address=frame.get('src','')
        if address.startswith('https://www.youtube.com/embed/'):
            button=node.new_tag('button',type='button')
            button['class']='source-video-button'
            button['data-video-src']=address
            button['data-video-title']=frame.get('title','Video hướng dẫn')
            button.string='▶ '+frame.get('title','Phát video hướng dẫn')
            frame.replace_with(button)
        else:frame.decompose()
    for e in node.select('script,style,form,meta,link,object,embed'): e.decompose()
    for e in node.find_all(True):
        for key in list(e.attrs):
            if key.startswith('on') or key in ('srcset','sizes','data-reveal'): del e[key]
        if str(e.get('href','')).lower().startswith('javascript:'): del e['href']
        if e.name=='img': e['loading']='lazy'
    return str(node)

def detail_html(node):
    body=BeautifulSoup(str(node),'html.parser').find('details')
    if body.find('summary'):body.find('summary').decompose()
    return clean_html(BeautifulSoup(''.join(str(e) for e in body.contents),'html.parser'))


def sitemap(name):
    file = next(SOURCE.glob(name + '*.xml'), None)
    if file is None:
        file=SOURCE/(name+'.xml');file.write_bytes(fetch(ORIGIN+'/'+name+'.xml'))
    tree=ET.fromstring(file.read_bytes())
    return [url.unquote(e.text).removeprefix(ORIGIN) for e in tree.iter() if e.tag.endswith('}loc') and e.text.startswith(ORIGIN)]

home=soup_at('/')
page_paths=sitemap('sitemap_pages_1')
collection_paths=sitemap('sitemap_collections_1') + ['/collections/all']
blog_paths=sitemap('sitemap_blogs_1')
extra=['/pages/huong-dan-su-dung','/pages/chinh-sach-bao-mat']
all_paths=list(dict.fromkeys(page_paths+collection_paths+blog_paths+extra))
with futures.ThreadPoolExecutor(1) as pool: soups=dict(zip(all_paths,pool.map(soup_at,all_paths)))
# Two practical guides, two health posts, four grooming posts, one news, one recruitment post.
articles=[]
for blog,count in [('huong-dan-su-dung',2),('suc-khoe',2),('cham-soc-nam-gioi',4),('news',1),('tuyen-dung-viec-lam',1)]:
    s=soups['/blogs/'+blog]
    links=list(dict.fromkeys(url.unquote(a['href'].split('?')[0]) for a in s.select('main a[href]') if a['href'].startswith('/blogs/'+blog+'/') and '/tagged/' not in a['href']))
    articles.extend(links[:count])
assert len(articles)==10, articles
with futures.ThreadPoolExecutor(1) as pool: soups.update(zip(articles,pool.map(soup_at,articles)))
products=json.loads((SOURCE/'products.json').read_text())['products']
with futures.ThreadPoolExecutor(1) as pool:
    paths=['/products/'+p['handle'] for p in products]
    soups.update(zip(paths,pool.map(soup_at,paths)))

assets={}
asset_map = RESEARCH / 'asset-map.json'
cached_assets = json.loads(asset_map.read_text()) if asset_map.exists() else {}
def asset_address(address):
    if not address or '<' in address or '>' in address or address.startswith(('data:','#','blob:')): return None
    address=url.urljoin(ORIGIN,address)
    parsed=url.urlsplit(address)
    if parsed.hostname not in ('spotless.vn','cdn.shopify.com','fonts.gstatic.com','image.optcdn.me','review-images.judgeme.com','public-images.judge.me'): return None
    if not re.search(r'\.(png|jpg|jpeg|webp|avif|gif|svg|woff2?|ttf|mp4|webm)$',parsed.path,re.I): return None
    query=url.parse_qs(parsed.query);query.pop('width',None);query.pop('height',None)
    return url.urlunsplit((parsed.scheme,parsed.netloc,parsed.path,url.urlencode(query,doseq=True),''))

def register(address):
    normalized=asset_address(address)
    if not normalized: return address
    if normalized not in assets:
        parsed=url.urlsplit(normalized)
        basename=url.unquote(parsed.path.split('/')[-1]);basename=re.sub(r'[^a-zA-Z0-9._-]','-',basename)
        local='/sites/spotless/'+hashlib.sha256(normalized.encode()).hexdigest()[:10]+'-'+basename
        webp=local.rsplit('.',1)[0]+'.webp'
        if cached_assets.get(normalized)==webp and (ROOT/'public'/webp.lstrip('/')).is_file():
            local=webp
        assets[normalized]=local
    return assets[normalized]

# Only media actually used by cloned pages; blog listing media is limited to the selected articles.
media_soups=[home]+[s for path,s in soups.items() if path not in blog_paths+['/pages/huong-dan-su-dung']]
for s in media_soups:
    for e in s.select('main img,main video,main source,header img,footer img'):
        for key in ['src','poster']: 
            if e.get(key):register(e[key])
        if e.get('srcset'):
            for entry in e['srcset'].split(','): register(entry.strip().split(' ')[0])
for p in products:
    for im in p['images']: register(im['src'])

records=[]
for path in articles:
    s=soups[path];main=s.find('main')
    body=main.select_one('.sp-article__body, .sp-article-body, .article-template__content, [itemprop="articleBody"]')
    if not body:
        candidates=[e for e in main.select('div,article') if 'body' in ' '.join(e.get('class',[])) or 'rte' in e.get('class',[])]
        body=max(candidates,key=lambda e:len(e.get_text()),default=main)
    img=main.select_one('.sp-article__hero img, .sp-article__media img, img')
    records.append({'path':path,'category':path.split('/')[2],'title':text(main,'h1'),'date':attr(main.find('time'),'datetime'),'image':attr(img,'src'),'excerpt':text(body,'p')[:220],'html':clean_html(body)})

pages=[]
for path in page_paths+extra:
    s=soups[path];main=s.find('main')
    body=main.select_one('[data-doc-body], .sp-doc__body, .sp-doc-body, .rte') if main else None
    if not body:body=main
    pages.append({'path':path,'title':text(main,'h1') or text(s,'title').split(' - ')[0],'html':clean_html(body),'text':text(body),'image':attr(main.select_one('img') if main else None,'src')})

collections=[]
for path in collection_paths:
    main=soups[path].find('main')
    handles=list(dict.fromkeys(a['href'].split('/products/')[-1].split('?')[0] for a in main.select('a[href*="/products/"]')))
    fallback={'/collections/may-cạo':('Máy cạo',['trimday-3-0-max','trimday-lite']),'/collections/phụ-kiện':('Phụ kiện',['trimblade','trimsmooth']),'/collections/cham-soc-da':('Chăm sóc da',['sach-cool','diu-cool']),'/collections/mega-menu':('Mua hàng',['trimday-3-0-max','trimday-lite','trimblade'])}
    title=text(main,'h1')
    if not title and path in fallback:title,handles=fallback[path]
    collections.append({'path':path,'title':title,'description':text(main,'.sp-coll__desc'),'products':handles})

for p in products:
    main=soups['/products/'+p['handle']].find('main')
    p['path']='/products/'+p['handle']
    p['gallery']=[attr(e,'src') for e in main.select('.spm-stage img')] or [im['src'] for im in p['images']]
    p['sealImage']=attr(main.select_one('.sp-seal'),'src')
    p['switchImages']=[attr(e,'src') for e in main.select('.spm-switch__media img')]
    p['summary']=text(main,'.spm-desc') or text(main,'.spm-subtitle') or text(BeautifulSoup(p['body_html'],'html.parser'),'p')
    p['reviewCount']=text(main,'.spm-rating')
    p['features']=[text(e) for e in main.select('.spm-feat > span:last-child, .spm-perks li, .spm-benefits li')]
    p['details']=[{'title':text(e,'summary').removesuffix(' +'),'kind':'spec' if 'spm-spec' in e.get('class',[]) else 'faq','html':detail_html(e)} for e in main.select('details')]
    p['body_html']=clean_html(BeautifulSoup(p['body_html'],'html.parser'))
    # Preserve editorial product sections as data, not third-party application code.
    p['sections']=[{'title':text(e,'h2'),'text':text(e,'p'),'image':attr(e.select_one('img'),'src'),'points':list(dict.fromkeys(text(x) for x in e.select('h3,h4,p,li') if text(x) and len(text(x))<700)),'comparison':[text(x) for x in e.select('.cmp-c')]} for e in main.select('main>section') if text(e,'h2')]

categories=[{'title':text(e,'h3'),'path':attr(e,'href'),'image':attr(e.find('img'),'src')} for e in home.select('.sp-catcards__card')]
reviews=[{'name':text(e,'.sp-vr__name'),'role':text(e,'.sp-vr__role'),'quote':text(e,'.sp-vr__quote'),'video':attr(e.find('video'),'src'),'product':attr(e.select_one('.sp-vr__ptitle'),'href')} for e in home.select('.sp-vr__card')]
splits=[{'title':text(e,'h2'),'eyebrow':text(e,'.sp-eyebrow, .sp-eyebrow-pill'),'text':text(e,'p'),'image':attr(e.find('img'),'src'),'path':attr(e.find('a'),'href') or '/products/trimday-3-0-max','cta':text(e,'a,button')} for e in home.select('.sp-split')]
scrub=home.select_one('.sp-scrub video')
home_data={'hero':attr(home.select_one('.sp-hero img'),'src'),'heroMobile':attr(home.select_one('.sp-hero source'),'srcset').split(' ')[0],'logo':attr(home.select_one('header img'),'src'),'categories':categories,'reviews':reviews,'splits':splits,'scrub':{'video':attr(scrub,'src'),'poster':attr(scrub,'poster'),'lines':[text(e) for e in home.select('[data-scrub-line]')]},'benefits':{'image':attr(home.select_one('.sp-benefits img'),'src'),'items':[text(e) for e in home.select('.sp-benefits li')]}}
# The Google CSS response contains font files only; no storefront JavaScript is reused.
font_reference=SOURCE/'fonts-reference.css'
font_css=font_reference.read_text() if font_reference.exists() else fetch('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500&family=Google+Sans+Flex:wght@400;500;600;700&display=swap').decode()
for address in re.findall(r'url\(([^)]+)\)',font_css): register(address)
for address in list(assets):font_css=font_css.replace(address,assets[address])
(ROOT/'src/components/sites/spotless/fonts.css').write_text(font_css)

def localize(value):
    if isinstance(value,str):
        if asset_address(value):return register(value)
        # Rewrite media references inside sanitized article/policy content.
        if '<' in value:
            s=BeautifulSoup(value,'html.parser')
            for e in s.select('[src], [poster], a[href]'):
                for key in ['src','poster']:
                    if e.get(key):e[key]=register(e[key])
                href=e.get('href','')
                if href.startswith(ORIGIN):
                    href=href[len(ORIGIN):] or '/'
                    e['href']=href
                if href.startswith('/blogs/') and href.count('/')>=3 and url.unquote(href.split('?')[0]) not in articles:e['href']=ORIGIN+href
            return str(s)
        return value
    if isinstance(value,list):return [localize(e) for e in value]
    if isinstance(value,dict):return {k:localize(v) for k,v in value.items()}
    return value

data=localize({'source':ORIGIN,'home':home_data,'products':products,'pages':pages,'collections':collections,'blogs':[{'path':p,'title':text(soups[p].find('main'),'h1')} for p in blog_paths],'articles':records})

def download(item):
    address,local=item;file=ROOT/'public'/local.lstrip('/')
    if file.exists() and file.stat().st_size:return None
    try:
        blob=fetch(address)
        if blob.lstrip().startswith((b'<!DOCTYPE html',b'<!doctype html')):raise ValueError('HTML instead of media')
        file.write_bytes(blob)
        return None
    except Exception as e:return {'url':address,'error':str(e)}
(ROOT/'src/data/spotless.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Downloading',len(assets),'media files...',flush=True)
with futures.ThreadPoolExecutor(4) as pool: errors=[e for e in pool.map(download,list(assets.items())) if e]
# A dead source image must not create a broken local request. Keep its original link.
failed={assets[e['url']]:e['url'] for e in errors}
def unavailable_media(value):
    if isinstance(value,str) and value in failed:
        return ''
    if isinstance(value,str) and '<' in value:
        markup=BeautifulSoup(value,'html.parser')
        for image in markup.select('img[src]'):
            if image['src'] in failed:
                link=markup.new_tag('a',href=failed[image['src']],target='_blank',rel='noreferrer')
                link.string='Xem ảnh minh họa gốc'
                image.replace_with(link)
        return str(markup)
    if isinstance(value,list):return [unavailable_media(v) for v in value]
    if isinstance(value,dict):return {k:unavailable_media(v) for k,v in value.items()}
    return value
if failed:data=unavailable_media(data)
(ROOT/'src/data/spotless.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(RESEARCH/'asset-map.json').write_text(json.dumps({u:p for u,p in assets.items() if p not in failed},ensure_ascii=False,indent=2)+'\n')
(RESEARCH/'source-status.json').write_text(json.dumps([{'path':path,'status':429,'fallback':'Public products.json / shared observed collection layout'} for path, soup in soups.items() if soup.select_one('[data-source-unavailable]')],ensure_ascii=False,indent=2)+'\n')
(RESEARCH/'import-errors.json').write_text(json.dumps(errors,ensure_ascii=False,indent=2)+'\n')
(RESEARCH/'routes.json').write_text(json.dumps(['/']+list(dict.fromkeys(page_paths+extra+collection_paths+blog_paths+articles+['/products/'+p['handle'] for p in products]+['/search','/cart','/account/login'])),ensure_ascii=False,indent=2)+'\n')
assert len(data['articles'])==10
assert len({p['path'] for p in data['products']})==8
if not errors:
    used={ROOT/'public'/p.lstrip('/') for p in assets.values()}
    for file in ASSETS.iterdir():
        if file.is_file() and file not in used: file.unlink()
print('Done:',len(data['pages']),'pages,',len(data['products']),'products,',len(data['articles']),'articles;',len(errors),'asset failures',flush=True)
subprocess.run(['node', str(ROOT/'scripts/compress-images.cjs')], check=True)
