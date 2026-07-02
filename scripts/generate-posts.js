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
}

generate();
