const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/public/images/guide/pass';

for (let i = 9; i <= 28; i++) {
    const oldNum = String(i).padStart(2, '0');
    const newNum = String(i - 1).padStart(2, '0');
    const oldPath = path.join(dir, `pass_${oldNum}.jpg`);
    const newPath = path.join(dir, `pass_${newNum}.jpg`);

    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed ${oldPath} to ${newPath}`);
    } else {
        console.log(`File not found: ${oldPath}`);
    }
}
