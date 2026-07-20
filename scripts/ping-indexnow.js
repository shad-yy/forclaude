const fs = require('fs');
const path = require('path');

// Key details
const HOST = 'smartlivetv.co.uk';
const KEY = 'f63234d7ee824249a5b3260c6d2c49e2';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const BASE_URL = `https://${HOST}`;

// Import blog posts dynamically if it exists
let blogPosts = [];
try {
  const postsFilePath = path.join(__dirname, '../lib/blog/posts.ts');
  if (fs.existsSync(postsFilePath)) {
    // Parse the JSON array from the auto-generated ts file
    const content = fs.readFileSync(postsFilePath, 'utf-8');
    const jsonMatch = content.match(/export const BLOG_POSTS: BlogPost\[] = (\[[\s\S]*?\]);/);
    if (jsonMatch) {
      blogPosts = JSON.parse(jsonMatch[1]);
    }
  }
} catch (e) {
  console.error('Failed to parse blog posts:', e.message);
}

// Define URLs
const staticUrls = [
  '/',
  '/channels',
  '/pricing',
  '/iptv-vs-sky-sports',
  '/iptv-vs-netflix',
  '/buy',
  '/free-trial',
  '/watch/premier-league',
  '/watch/la-liga',
  '/watch/bundesliga',
  '/watch/serie-a',
  '/watch/ligue-1',
  '/watch/champions-league',
  '/watch/world-cup-2026',
  '/watch/europa-league',
  '/watch/formula-1',
  '/ufc',
  '/news',
  '/blog',
  '/faq',
  '/setup/firestick',
  '/setup/smart-tv',
  '/setup/android',
  '/setup/iphone',
  '/about',
  '/contact',
];

const urls = [
  ...staticUrls.map(p => `${BASE_URL}${p}`),
  ...blogPosts.map(p => `${BASE_URL}/blog/${p.slug}`)
];

async function ping() {
  console.log(`Submitting ${urls.length} URLs to IndexNow...`);
  
  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 200 || response.status === 202) {
      console.log(`IndexNow ping successful (${response.status} ${response.status === 200 ? 'OK' : 'Accepted'})`);
    } else {
      const text = await response.text();
      console.error(`IndexNow ping failed with status ${response.status}: ${text}`);
    }
  } catch (err) {
    console.error('Error pinging IndexNow:', err.message);
  }
}

ping();
