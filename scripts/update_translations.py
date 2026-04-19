import os
import glob

keys_to_add = [
    ('한국에서 일하는 외국인 청년이라면', 'If you are a young foreign worker in Korea'),
    ('1년에 200만원 한도,', 'An annual limit of 2 million won,'),
    ('5년동안,', 'for 5 years,'),
    ('월급에서 차감한 세금 90%', '90% of the tax deducted from your salary'),
    ('를 환급을 받을 수 있습니다.', 'can be refunded.'),
    ('평균 환급액 300만원이상!', 'Average refund over 3 million won!')
]

search_path = r'c:\Users\zkfnt\Desktop\easy-tax-refund\easy-tax-refund-main\easy-tax-refund-main\src\lib\translations\*\main.ts'
files = glob.glob(search_path)

for file_path in files:
    # Skip ko and en as they are already handled or need special care
    if '\\ko\\' in file_path or '\\en\\' in file_path:
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'hero_title_1' in content:
        # Clean up old keys if they exist
        import re
        content = re.sub(r'\s+"hero_title_\d":\s+".*?",?', '', content)

    # Find the last };
    if '};' in content:
        parts = content.rsplit('};', 1)
        new_lines = ""
        for k, v in keys_to_add:
            if f'"{k}":' not in content:
                new_lines += f'  "{k}": "{v}",\n'
        
        if new_lines:
            # Ensure the previous line has a comma if it doesn't
            content_before = parts[0].strip()
            if not content_before.endswith(','):
                parts[0] = content_before + ','
            
            new_content = parts[0] + '\n' + new_lines + '};' + parts[1]
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {file_path}")
