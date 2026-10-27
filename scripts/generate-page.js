const fs = require('node:fs');
const path = require('node:path');

const raw = process.env.ARTICLE_DATA;
if (!raw) throw new Error('ARTICLE_DATA is missing. Pass the article JSON in the workflow payload.');
let article;
try { article = JSON.parse(raw); }
catch (error) { throw new Error('ARTICLE_DATA must be valid JSON: ' + error.message); }

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));
const slugify = value => String(value || 'article')
  .toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'article';

const slug = slugify(article.slug || article.title);
const paragraphs = String(article.content || '').split(/\n\s*\n/)
  .map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('\n');
const references = String(article.references || '').split(/\n+/).map(s => s.trim()).filter(Boolean)
  .map(item => {
    const safe = esc(item);
    return `<li>${/^https:\/\/\S+$/.test(item) ? `<a href="${safe}" rel="noopener noreferrer">${safe}</a>` : safe}</li>`;
  }).join('');
const image = article.imageUrl || article.thumbnail || '';
const title = article.title || 'Untitled article';
const summary = article.summary || title;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(summary)}"><meta name="robots" content="index,follow">
<title>${esc(title)} | MedStart</title><link rel="stylesheet" href="../styles.css">
<style>
.article-wrap{max-width:900px;margin:auto;padding:36px 20px 70px}
.article-cover{display:block;width:100%;max-width:760px;max-height:420px;object-fit:cover;border-radius:16px;margin:20px auto}
.article-content{font-size:1.06rem;line-height:1.85;overflow-wrap:anywhere}
.article-content h2{color:var(--navy)}.article-meta{color:var(--muted)}
.article-content a{color:#087c4a;text-decoration:underline}
.article-references{border-top:1px solid var(--line);margin-top:30px;padding-top:20px}
.backlink{display:inline-block;margin:15px 0;color:var(--navy);font-weight:800}
</style></head>
<body>
<header class="header"><a class="brand" href="../index.html"><img class="logo" src="../medstart-logo.jpg" alt="MedStart"><span><b>MedStart</b><small>LEARN • INSPIRE • HEAL</small></span></a>
<div class="nav-wrap"><nav class="site-nav"><a href="../index.html">Home</a><a href="../specialties.html">Specialties</a><a href="../quiz.html">Specialty Quiz</a><a href="../cases.html">Medical Cases</a><a class="active" href="../articles.html">Articles</a><a href="../health-facts.html">Health Facts</a><a href="../about.html">About</a><a href="../contact.html">Contact</a></nav></div></header>
<main class="article-wrap"><a class="backlink" href="../articles.html">← All articles</a><article>
<p class="eyebrow">${esc(article.category || 'MEDSTART ARTICLE')}</p><h1>${esc(title)}</h1>
<p class="article-meta">By ${esc(article.author || 'MedStart')}</p>
${image ? `<img class="article-cover" src="${esc(image)}" alt="${esc(title)}">` : ''}
<p class="lead">${esc(summary)}</p><div class="article-content">${paragraphs}</div>
${references ? `<section class="article-references"><h2>References</h2><ol>${references}</ol></section>` : ''}
</article></main>
<footer class="footer section"><a class="brand" href="../index.html"><b>MedStart</b><small>LEARN • INSPIRE • HEAL</small></a><p>Educational resource only. Not a substitute for professional medical care.</p><small>© 2026 MedStart</small></footer>
</body></html>`;

const output = path.join(process.cwd(), 'articles', `${slug}.html`);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, html, 'utf8');
console.log(`Created individual article page: ${output}`);
