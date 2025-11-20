const https = require('https');
const fs = require('fs');
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractNuxtData(html) {
  const match = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>(.*?)<\/script>/s);
  if (!match) throw new Error('__NUXT_DATA__ not found');
  return JSON.parse(match[1]);
}

async function main() {
  console.log('正在获取数据...');
  baseURL = process.env.API_PATH
  const html = await fetchPage(baseURL);

  console.log('解析数据');
  const nuxt = extractNuxtData(html);
  const base64Str = nuxt[33];
  if (typeof base64Str !== 'string') throw new Error('字段无效');
  const decoded = Buffer.from(base64Str.replace(/\n/g, ''), 'base64').toString('utf8');

  console.log('过滤中...');
  const filtered = decoded
    .split('\n')
    .filter(line => !line.toLowerCase().includes('hysteria2'))
    .join('\n');

  console.log('重新编码');
  const newBase64 = Buffer.from(filtered, 'utf8').toString('base64');
  console.log(newBase64);
  fs.writeFileSync('sub.txt', newBase64 + '\n');
  console.log('已完成');
}

main().catch(err => {
  console.error('错误:', err.message);
  process.exit(1);
});
