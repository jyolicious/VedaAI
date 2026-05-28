const fs = require('fs');
const p = 'src/services/aiService.ts';
let s = fs.readFileSync(p, 'utf8');
const header = "const headers: Record<string, string> = { Accept: 'application/json' };";
const idx1 = s.indexOf(header);
if (idx1 === -1) {
  console.error('header not found');
  process.exit(1);
}
const idxAfter = idx1 + header.length;
const idxTry = s.indexOf('try {', idxAfter);
if (idxTry === -1) {
  console.error('try not found');
  process.exit(1);
}
const newMiddle = "\n    // Accept either GROQ_API_KEY (user provided) or GROQ_TOKEN for Bearer auth\n    const groqAuth = process.env.GROQ_API_KEY || process.env.GROQ_TOKEN;\n    if (groqAuth) headers.Authorization = `Bearer ${groqAuth}`;\n\n    ";

s = s.slice(0, idxAfter) + newMiddle + s.slice(idxTry);
fs.writeFileSync(p, s, 'utf8');
console.log('fixed');
