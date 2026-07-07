import os
import re
import json

# 번역 폴더 경로
TRANSLATIONS_DIR = r"c:\Users\zkfnt\Desktop\easy-tax-refund\easy-tax-refund-main\easy-tax-refund-main\src\lib\translations"
SRC_DIR = r"c:\Users\zkfnt\Desktop\easy-tax-refund\easy-tax-refund-main\easy-tax-refund-main\src"

# 각 언어 코드 및 매핑 디렉토리명
LANGUAGES = {
    'ko': 'ko',
    'vi': 'vi',
    'zh': 'zh',
    'km': 'km',
    'ne': 'ne_new_stable',
    'uz': 'uz',
    'my': 'my',
    'id': 'id',
    'th': 'th',
    'en': 'en',
    'si': 'si',
    'mn': 'mn',
    'bn': 'bn',
    'kk': 'kk',
    'ur': 'ur_new'
}

# 1. 번역 파일에서 키셋 추출 함수
def extract_keys_from_ts(file_path):
    keys = set()
    if not os.path.exists(file_path):
        return keys
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 이중 따옴표 키와 뒤이은 값 매칭 (이모지, 특수문자, 이스케이프 문자 전부 허용)
    pattern = re.compile(r'"(?P<key>(?:[^"\\]|\\.)*)"\s*:\s*(?:"(?:[^"\\]|\\.)*"|[\d]|true|false|\{)')
    matches = pattern.findall(content)
    
    for m in matches:
        # 이스케이프 문자 복원하여 키셋에 저장
        try:
            m_clean = json.loads(f'"{m}"').strip()
        except Exception:
            m_clean = m.replace('\\"', '"').replace('\\\\', '\\').strip()
        if m_clean in ['export', 'const', 'default', 'import', 'from']:
            continue
        keys.add(m_clean)
        
    return keys

# 2. 모든 언어의 파일별 키 수집
def gather_translation_keys():
    all_keys = {} # lang -> file -> keys (set)
    
    # ko의 파일 리스트를 기준으로 삼음
    ko_dir = os.path.join(TRANSLATIONS_DIR, 'ko')
    ts_files = [f for f in os.listdir(ko_dir) if f.endswith('.ts') and f != 'index.ts']
    
    for lang, folder in LANGUAGES.items():
        all_keys[lang] = {}
        lang_dir = os.path.join(TRANSLATIONS_DIR, folder)
        for f_name in ts_files:
            file_path = os.path.join(lang_dir, f_name)
            all_keys[lang][f_name] = extract_keys_from_ts(file_path)
            
    return ts_files, all_keys

# 3. 소스코드 전체에서 t("key") 호출 추출
def extract_t_calls_from_src():
    t_keys = set()
    t_pattern = re.compile(r'\bt\(\s*(["\'`])(.*?)\1\s*[\),]')
    
    for root, dirs, files in os.walk(SRC_DIR):
        # node_modules 나 translations 폴더 등은 제외
        if 'node_modules' in root or 'translations' in root:
            continue
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    matches = t_pattern.findall(content)
                    for _, key in matches:
                        t_keys.add(key.strip())
                except Exception as e:
                    pass
    return t_keys

import sys

def main():
    # stdout encoding fix
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

    ts_files, all_keys = gather_translation_keys()
    src_t_keys = extract_t_calls_from_src()
    
    print(f"소스코드 내 총 t() 호출 유니크 키 개수: {len(src_t_keys)}")
    
    # 한국어 전체 키 리스트 병합
    ko_all_keys = set()
    for f_name in ts_files:
        ko_all_keys.update(all_keys['ko'][f_name])
    
    # index.ts도 확인
    ko_index_path = os.path.join(TRANSLATIONS_DIR, 'ko', 'index.ts')
    if os.path.exists(ko_index_path):
        ko_all_keys.update(extract_keys_from_ts(ko_index_path))
    
    print(f"한국어 번역 리소스 총 키 개수: {len(ko_all_keys)}")
    
    # A. 소스코드에는 쓰였지만 한국어 번역 리소스에 빠진 키
    missing_in_ko = src_t_keys - ko_all_keys
    actual_missing_in_ko = []
    for k in missing_in_ko:
        # dynamic key (e.g. status_${state}, t(someVar)) 제외
        if '${' in k or '+' in k or not k:
            continue
        actual_missing_in_ko.append(k)
        
    print(f"\n[1] 소스코드에는 존재하나 한국어(ko) 번역 리소스에 빠져 있는 키 (총 {len(actual_missing_in_ko)}개):")
    for k in actual_missing_in_ko[:30]:
        try:
            print(f"  - {k}")
        except Exception:
            # 이모지 등으로 인한 터미널 출력 실패 대비
            print(f"  - [인코딩 오류로 미출력 키]")
            
    if len(actual_missing_in_ko) > 30:
        print(f"  ...외 {len(actual_missing_in_ko) - 30}개 더 있음")
        
    # B. 한국어 키와 다른 14개 언어의 키 개수 대조 및 누락 검출
    print("\n[2] 한국어(ko) 기준 타국어 번역 키 누락 현황:")
    
    results = {}
    for lang in LANGUAGES.keys():
        if lang == 'ko':
            continue
        
        lang_all_keys = set()
        for f_name in ts_files:
            lang_all_keys.update(all_keys[lang][f_name])
            
        lang_index_path = os.path.join(TRANSLATIONS_DIR, LANGUAGES[lang], 'index.ts')
        if os.path.exists(lang_index_path):
            lang_all_keys.update(extract_keys_from_ts(lang_index_path))
            
        # 한국어에는 있지만 해당 언어에는 없는 키
        missing_keys = ko_all_keys - lang_all_keys
        # 해당 언어에는 있지만 한국어에는 없는 키 (잘못 추가되었을 가능성)
        redundant_keys = lang_all_keys - ko_all_keys
        
        results[lang] = {
            'total': len(lang_all_keys),
            'missing_count': len(missing_keys),
            'missing_keys': list(missing_keys),
            'redundant_count': len(redundant_keys),
            'redundant_keys': list(redundant_keys)
        }
        
        print(f"  - {lang} ({LANGUAGES[lang]}): 총 키 {len(lang_all_keys)}개 | ko 대비 누락 {len(missing_keys)}개 | ko에 없는 키 {len(redundant_keys)}개")

    # 결과 리포트 json 파일로 저장
    with open('translation_audit_temp.json', 'w', encoding='utf-8') as f:
        json.dump({
            'missing_in_ko': actual_missing_in_ko,
            'details': results
        }, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    main()
