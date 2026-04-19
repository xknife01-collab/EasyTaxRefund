const fs = require('fs');
const path = require('path');
const glob = require('glob');

const keysToAdd = [
    { k: '한국에서 일하는 외국인 청년이라면', v: 'If you are a young foreign worker in Korea' },
    { k: '1년에 200만원 한도,', v: 'An annual limit of 2 million won,' },
    { k: '5년동안,', v: 'for 5 years,' },
    { k: '월급에서 차감한 세금 90%', v: '90% of the tax deducted from your salary' },
    { k: '를 환급을 받을 수 있습니다.', v: 'can be refunded.' },
    { k: '평균 환급액 300만원이상!', v: 'Average refund over 3 million won!' }
];

const basePath = path.join('src', 'lib', 'translations');
const patterns = [
    path.join(basePath, '*', 'main.ts')
];

patterns.forEach(pattern => {
    const files = glob.sync(pattern.replace(/\\/g, '/'));
    files.forEach(filePath => {
        // Skip already updated ones
        if (filePath.includes('/ko/') || filePath.includes('/en/') || filePath.includes('/zh/') || 
            filePath.includes('/vi/') || filePath.includes('/th/') || filePath.includes('/id/') || 
            filePath.includes('/mn/')) {
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');

        // Check if already has keys
        if (content.includes('한국에서 일하는 외국인 청년이라면')) return;

        // Cleanup old keys
        content = content.replace(/\s+"hero_title_\d":\s+".*?",?/g, '');

        if (content.includes('};')) {
            const parts = content.split('};');
            const contentBefore = parts[0].trim();
            let newLines = '';
            
            keysToAdd.forEach(pair => {
                newLines += `  "${pair.k}": "${pair.v}",\n`;
            });

            const comma = contentBefore.endsWith(',') ? '' : ',';
            const newContent = contentBefore + comma + '\n' + newLines + '};' + parts.slice(1).join('};');
            
            fs.writeFileSync(filePath, newContent);
            console.log(`Updated ${filePath}`);
        }
    });
});
