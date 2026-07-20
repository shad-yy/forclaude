const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// Configure marked to render properly
marked.setOptions({
  gfm: true,
  breaks: true,
});

const CONTENT_DIR = path.join(__dirname, '../content/blog');
const OUTPUT_FILE = path.join(__dirname, '../lib/blog/posts.ts');

function getCategory(categoryStr) {
  if (!categoryStr) return 'guides';
  const cat = categoryStr.toLowerCase().trim();
  if (cat.includes('how')) return 'how-to';
  if (cat.includes('comparison') || cat.includes('vs')) return 'comparison';
  if (cat.includes('news')) return 'news';
  return 'guides';
}

function generate() {
  console.log('Generating posts from MDX...');
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`Content directory ${CONTENT_DIR} does not exist!`);
    process.exit(1);
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.mdx'));
  const posts = [];

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const slug = file.replace(/\.mdx$/, '');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const { data, content } = matter(fileContent);

    // Convert markdown content to HTML
    const htmlContent = marked.parse(content);

    // Calculate reading time
    const words = content.trim().split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(words / 200));

    posts.push({
      slug,
      title: data.title || '',
      description: data.description || '',
      category: getCategory(data.category),
      publishedAt: data.date || new Date().toISOString().slice(0, 10),
      readTime: data.readTime || readTime,
      featured: typeof data.featured === 'boolean' ? data.featured : false,
      metaTitle: data.metaTitle || null,
      content: htmlContent
    });
  }

  // Sort posts by date descending
  posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  const code = `// AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY.
// Run "npm run generate-posts" or build to regenerate from content/blog/

export interface BlogPost {
  slug: string
  title: string
  description: string
  category: "how-to" | "guides" | "news" | "comparison"
  publishedAt: string
  readTime: number
  featured: boolean
  content: string
  metaTitle?: string
}

export const BLOG_POSTS: BlogPost[] = ${JSON.stringify(posts, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, code, 'utf-8');
  console.log(`Successfully generated ${posts.length} posts to ${OUTPUT_FILE}`);

  generateLlmsFull(posts);
}

function generateLlmsFull(posts) {
  const llmsFullFile = path.join(__dirname, '../public/llms-full.txt');
  
  let content = `# Smart Live TV — Full Information Directory
> This is a comprehensive, full-text resource detailing the services, pricing, setup guides, FAQs, and informational blogs of Smart Live TV.

---

## 1. About Smart Live TV
Smart Live TV is a premium IPTV streaming service for the UK and global audiences.
- **USP:** Replaces Sky Sports (£43/mo), Netflix (£18/mo), Disney+ (£5/mo), and TNT Sports (£31/mo) with a single starting package at £12/month.
- **Channels & Content:** 230,000+ live TV channels and on-demand content including all Sky Sports, TNT Sports, beIN Sports, BBC, ITV, Channel 4, UCL, UFC, F1, NBA, NFL, Netflix, Disney+, Amazon Prime, Hulu, and Shahid.
- **Streaming Quality:** True 4K UHD and HD streams at 60 FPS.
- **Trial:** Free 24-hour trial with zero payment details or credit card required.
- **Simultaneous streams:** Up to 2 streams simultaneously (more on custom request).
- **Geography:** Works globally without regional restrictions or VPN requirements.
- **Customer Support:** Available 7 days a week, 9 AM to 11 PM UK time via WhatsApp (typically 5-10 mins response time).

---

## 2. Pricing & Subscription Plans
All plans include identical content, 4K UHD streaming, and 2 concurrent streams. Pricing is based on commitment duration:
- **Basic (1 Month):** £12.00
- **Popular (3 Months):** £24.00 (Works out to £8/month)
- **Standard (6 Months):** £36.00 (Works out to £6/month)
- **Premium (12 Months):** £54.00 (Works out to £4.50/month)
- **Refund Policy:** 7-day money-back guarantee.
- **No Contracts:** All plans are contract-free and cancelable anytime without fees.

---

## 3. Frequently Asked Questions (FAQ)

### Do I need a credit card for the free trial?
No. Your 24-hour free trial requires zero payment details. Message us on WhatsApp and we activate your trial immediately.

### How many screens can I watch on simultaneously?
All plans support up to 2 simultaneous streams. If you need more, contact us — we can accommodate specific requirements.

### What channels are included?
All plans include identical content: 230,000+ live channels including all Sky Sports, TNT Sports, beIN Sports, BBC, ITV, Channel 4, UCL, UFC, F1, NBA, NFL, and 50+ country packages. No plan has fewer channels than another.

### Is there a contract?
No contract on any plan. Cancel at any time before your next billing date. No cancellation fees.

### What's the difference between the plans?
Only the duration and effective monthly price differ. The 1-month Basic is £12/mo. The 3-month Popular works out at £8/mo. The 6-month Standard is £6/mo. The 12-month Premium is £4.50/mo. Every plan has identical features.

### What happens after the 24-hour trial?
Nothing automatic. We contact you to confirm if you'd like to continue. You choose your plan and pay only when you're satisfied.

### Which countries does this work in?
Everywhere. No regional restrictions, no VPN needed. UK, France, UAE, USA — or anywhere worldwide.

### How do I get support?
WhatsApp support 7 days a week, 9am–11pm UK time. We typically respond within 5–10 minutes.

---

## 4. Device Setup Guides

### Amazon Firestick Setup
1. **Enable Unknown Sources:** Go to Settings → My Fire TV → Developer Options → Apps from Unknown Sources → turn ON.
2. **Install Downloader App:** Search for "Downloader" in the Amazon Appstore and install it for free.
3. **Download the IPTV Player:** Open Downloader and enter the URL provided in your Smart Live TV welcome email.
4. **Enter Your Credentials:** Open the IPTV app, enter your username and password from your Smart Live TV account.
5. **Start Watching:** Navigate to Live TV → Sports to find all Premier League, Champions League and sports channels.

### Smart TV Setup
1. **Open Smart Hub or App Store:** Press the Home button on your remote and navigate to Apps or Smart Hub.
2. **Search for IPTV Player:** Search for "Smart IPTV" or "IPTV Smarters" in the app store and install.
3. **Enter Your Playlist URL:** Open the app and enter the M3U URL provided in your Smart Live TV welcome email.
4. **Load Your Channels:** The app will load your 230,000+ channels automatically. Navigate to Sports for live matches.

### Android Setup
1. **Download the App:** Go to Google Play Store and download "IPTV Smarters Pro" or the app link we provide.
2. **Open and Add Playlist:** Open the app, tap "Add User" and enter your Smart Live TV login credentials.
3. **Select Your Content:** Choose Live TV for sports channels, or VOD for movies and on-demand content.

### iPhone & iPad Setup
1. **Download the App:** Go to the App Store and download "GSE Smart IPTV" or the player app we recommend.
2. **Add Your Playlist:** In the app settings, add playlist URL and enter the M3U link from your welcome email.
3. **Browse Channels:** Open Live TV and navigate to Sports for all live sports channels in HD and 4K.

---

## 5. Full Articles & Guides
`;

  for (const post of posts) {
    const filePath = path.join(CONTENT_DIR, `${post.slug}.mdx`);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { content: rawMarkdown } = matter(fileContent);
      
      content += `\n### Article: ${post.title}\n`;
      content += `**Published Date:** ${post.publishedAt} | **Category:** ${post.category}\n`;
      content += `**Description:** ${post.description}\n\n`;
      content += `${rawMarkdown}\n`;
      content += `\n---\n`;
    }
  }

  fs.writeFileSync(llmsFullFile, content, 'utf-8');
  console.log(`Successfully generated public/llms-full.txt with ${posts.length} articles`);
}

generate();
