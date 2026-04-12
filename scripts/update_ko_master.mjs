import fs from 'fs';
import path from 'path';

const srcDir = './src';
const koPath = './src/lib/translations/ko.ts';

// Get current keys
const koFileContent = fs.readFileSync(koPath, 'utf8');
const koKeys = new Set();
const matchAllKeys = koFileContent.match(/"([^"]+)":/g) || [];
matchAllKeys.forEach(m => {
    const key = m.slice(1, -2);
    koKeys.add(key);
});

const missingResults = new Set();
const adminPrefix = path.join('src', 'app', 'admin');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fullPath.includes(adminPrefix) || fullPath.includes('translations')) continue;

        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const stringMatches = content.match(/["'`]([^"'`\r\n]*[\uAC00-\uD7AF]+[^"'`\r\n]*)["'`]/g) || [];
            stringMatches.forEach(m => {
                const text = m.slice(1, -1).trim();
                // Basic cleanup
                if (text && !koKeys.has(text) && !text.includes('${') && text.length > 1) {
                    missingResults.add(text);
                }
            });
            const jsxMatches = content.match(/>([^<]*[\uAC00-\uD7AF]+[^<]*)<\//g) || [];
            jsxMatches.forEach(m => {
                const text = m.slice(1, -2).trim();
                if (text && !koKeys.has(text) && text.length > 1) {
                    missingResults.add(text);
                }
            });
        }
    }
}

walk(srcDir);

// Manual additions for complex cases or missed fragments
const manual = [
    "카카오톡 앱에서 어떻게 승인하나요? (가이드 보기)",
    "카카오 지갑 알림을 확인한 뒤\n아래 버튼을 눌러주세요.",
    "🎉 축하합니다 🎉\n이제 PASS에서의 모든 작업이 끝났습니다!\n\n열려있는 앱을 닫고",
    "전문 비서로서 해당 주제에 대해서만 도움을 드릴 수 있습니다.",
    "예상 환급액이 {amount}원이나 됩니다! 인증이 막히셨다면 전문 상담원이 즉시 도와드려요.",
    "안녕하세요! 예상 환급액이 매우 큰 고액 자산가님으로 감지되어 전문 상담원 채팅 세션이 열렸습니다. 인증이나 서류 접수에 어려움이 있다면 무엇이든 물어봐 주세요."
];

manual.forEach(m => {
    if (!koKeys.has(m)) missingResults.add(m);
});

let newKoContent = koFileContent.replace(/};\s*$/, '');
let appendContent = '';

Array.from(missingResults).sort().forEach(s => {
    // Escape double quotes for JSON-like key
    const escaped = s.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    appendContent += `  "${escaped}": "${escaped}",\n`;
});

fs.writeFileSync(koPath, newKoContent + appendContent + '};');
console.log('Successfully updated ko.ts with ALL user-facing Korean keys.');
