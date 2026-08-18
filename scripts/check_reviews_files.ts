import fs from 'fs';
import path from 'path';

const langDirs = ['ko', 'en', 'vi', 'zh', 'km', 'ne_new_stable', 'uz', 'my', 'id', 'th', 'si', 'mn', 'bn', 'kk', 'ur_new'];

for (const dir of langDirs) {
  const reviewsPath = path.join(process.cwd(), 'src/lib/translations', dir, 'reviews.ts');
  if (fs.existsSync(reviewsPath)) {
    const content = fs.readFileSync(reviewsPath, 'utf8');
    const lineCount = content.split('\n').length;
    console.log(`[${dir}] reviews.ts exists (${lineCount} lines)`);
  } else {
    console.log(`[${dir}] reviews.ts does NOT exist`);
  }
}
