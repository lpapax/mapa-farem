import urllib.request
import urllib.error
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = ['photo-1540420773420-3366772f4999', 'photo-1529692236671-f1f6cf9683ba', 'photo-1550583724-b2692b85b150', 'photo-1558642452-9d2a7deb7f62', 'photo-1506377247377-2a5b3b417ebb', 'photo-1465226388285-0adb1a0a3ba0', 'photo-1488459716781-31db52582fe9', 'photo-1523741543316-beb7fc7023d8', 'photo-1416879595882-3373a0480b5b', 'photo-1592924357228-91a4daadcfea', 'photo-1607623814075-e51df1bdc82f', 'photo-1589985270826-4b7bb135bc9d', 'photo-1471943311424-646960669fbc', 'photo-1510812431401-41d2bd2722f3', 'photo-1515586000433-45406d8e6662', 'photo-1530836369250-ef72a3f5cda8', 'photo-1608686207856-001b95cf60ca']

for u in urls:
    try:
        req = urllib.request.Request(f'https://images.unsplash.com/{u}?w=10', headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, context=ctx)
        print(f'{u}: {res.getcode()}')
    except urllib.error.HTTPError as e:
        print(f'{u}: {e.code}')
    except Exception as e:
        print(f'{u}: {e}')
