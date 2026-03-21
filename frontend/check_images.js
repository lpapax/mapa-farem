const GALLERY_IMAGES = {
  veggie: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80&fit=crop'],
  meat:   ['https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&q=80&fit=crop'],
  dairy:  ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&q=80&fit=crop'],
  honey:  ['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800&q=80&fit=crop'],
  wine:   ['https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80&fit=crop'],
  herbs:  ['https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=800&q=80&fit=crop'],
  bio:    ['https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80&fit=crop'],
  market: ['https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&q=80&fit=crop'],
};

async function run() {
  for (const [cat, urls] of Object.entries(GALLERY_IMAGES)) {
    for (const url of urls) {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (!res.ok) {
          console.log(`BROKEN: ${cat} -> ${url} (Status: ${res.status})`);
        }
      } catch (e) {
        console.log(`ERROR: ${cat} -> ${url} (${e.message})`);
      }
    }
  }
  console.log("Done checking.");
}
run();
