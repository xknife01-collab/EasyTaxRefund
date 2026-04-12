import fs from 'fs';

const koPath = './src/lib/translations/ko.ts';
let content = fs.readFileSync(koPath, 'utf8');

const strings = [
    "🎉 축하합니다 🎉\n이제 카카오톡에서의 모든 작업이 끝났습니다!\n\n열려있는 앱을 닫고 '텍스리펀 앱'으로 돌아가\n최종 '인증완료'를 누르세요!",
    "🎉 축하합니다 🎉\n이제 PASS에서의 모든 작업이 끝났습니다!\n\n열려있는 앱을 닫고 '텍스리펀 앱'으로 돌아가\n최종 '인증완료'를 누르세요!"
];

let added = false;
strings.forEach(s => {
    const escaped = s.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    if (!content.includes(`"${escaped}":`)) {
        content = content.replace(/};\s*$/, `  "${escaped}": "${escaped}",\n};`);
        added = true;
    }
});

if (added) {
    fs.writeFileSync(koPath, content);
    console.log('Updated ko.ts with final congratulations strings.');
} else {
    console.log('Already in ko.ts');
}
