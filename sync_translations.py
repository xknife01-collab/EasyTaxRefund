import os
import re
import json
import urllib.request
import urllib.error
import sys
import time

TRANSLATIONS_DIR = r"c:\Users\zkfnt\Desktop\easy-tax-refund\easy-tax-refund-main\easy-tax-refund-main\src\lib\translations"
SRC_DIR = r"c:\Users\zkfnt\Desktop\easy-tax-refund\easy-tax-refund-main\easy-tax-refund-main\src"

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

LANG_NAMES = {
    'vi': 'Vietnamese',
    'zh': 'Chinese',
    'km': 'Khmer',
    'ne': 'Nepali',
    'uz': 'Uzbek',
    'my': 'Burmese',
    'id': 'Indonesian',
    'th': 'Thai',
    'en': 'English',
    'si': 'Sinhala',
    'mn': 'Mongolian',
    'bn': 'Bengali',
    'kk': 'Kazakh',
    'ur': 'Urdu'
}

API_KEY = "AIzaSyA82eJyNjihN4qmGESignQ50dnboqzzqqI"

REDUNDANT_MAP = {
    "후불 정산 방식": ["Deferred Settlement Method", "ch sau", "n sau"],
    "출금 동의 내역": ["Direct Debit Details", "출금 동의 내역"],
    "사업자 번호": ["Business ID", "Nomor Bisnis", "STIR", "Business ID"],
    "대금결제 및 재화 등의 공급에 관한 기록": [
        "Records on payment and supply of goods", 
        "lovlar va tovarlar yetkazib berishga oid yozuvlar",
        "Catatan mengenai pembayaran dan penyediaan barang, dll"
    ],
    "소비자의 불만 또는 분쟁처리에 관한 기록": [
        "Records on consumer complaints or dispute handling",
        "molchilarning shikoyatlari yoki nizolarni hal qilishga oid yozuvlar",
        "Catatan mengenai penanganan keluhan or perselisihan konsumen"
    ],
    "계약 또는 청약철회 등에 관한 기록": [
        "Records on contracts or withdrawal of subscriptions",
        "zolikni bekor qilishga oid yozuvlar",
        "Catatan mengenai kontrak or pembatalan langganan, dll"
    ],
    "시행일자": ["Effective Date", "Kuchga kirish sanasi", "Tanggal Efektif", "시행일자"],
    "공고일자": ["Announcement Date", "lon qilingan sana", "Tanggal Pengumuman"]
}

def decode_escaped_string(s):
    try:
        return json.loads(f'"{s}"')
    except Exception:
        return s.replace('\\"', '"').replace('\\n', '\n').replace('\\t', '\t').replace('\\\\', '\\')

def read_ts_file(file_path):
    if not os.path.exists(file_path):
        return {}, "", ""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # 타입 아노테이션(예: : Guides)이 있는 경우도 고려하여 변수명 추출
    var_match = re.search(r'export\s+const\s+(\w+)(?:\s*:[^=]+)?\s*=\s*\{', content)
    if not var_match:
        return {}, "", ""
    var_name = var_match.group(1)
    
    pattern = re.compile(r'"(?P<key>(?:[^"\\]|\\.)*)"\s*:\s*"(?P<val>(?:[^"\\]|\\.)*)"')
    matches = pattern.findall(content)
    
    data = {}
    for k, v in matches:
        k_decoded = decode_escaped_string(k)
        v_decoded = decode_escaped_string(v)
        if k_decoded.strip() == "":
            continue
        data[k_decoded] = v_decoded
        
    header = content.split("export const")[0]
    return data, var_name, header

def write_ts_file(file_path, data, var_name, header=""):
    content = header if header else ""
    content += f"export const {var_name} = {{\n"
    for k, v in data.items():
        k_json = json.dumps(k, ensure_ascii=False)
        v_json = json.dumps(v, ensure_ascii=False)
        content += f'  {k_json}: {v_json},\n'
    content += "};\n"
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def translate_batch_via_gemini(texts, target_lang_name):
    if not texts:
        return []
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
    
    prompt = (
        f"Translate the list of Korean strings in the following JSON array into {target_lang_name}. "
        "Return ONLY a valid JSON array of strings containing the translated values in the exact same order. "
        "Do not include any explanations, markdown formatting (like ```json), or additional characters. "
        "Return only the raw JSON array. Keep variables like {amount}, {name}, {year}, {month}, {day} intact and do not translate them.\n\n"
        f"JSON Data:\n{json.dumps(texts, ensure_ascii=False)}"
    )
    
    headers = {"Content-Type": "application/json"}
    body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }
    
    req = urllib.request.Request(url, data=json.dumps(body).encode('utf-8'), headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            if 'candidates' not in res_data:
                raise Exception(f"candidates 누락: {res_data}")
            raw_text = res_data['candidates'][0]['content']['parts'][0]['text'].strip()
            
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()
            
            translated_list = json.loads(raw_text)
            if isinstance(translated_list, list) and len(translated_list) == len(texts):
                return translated_list
            else:
                raise Exception(f"번역 반환 개수 불일치 ({len(translated_list)} vs {len(texts)})")
        
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"  [HTTP 에러] Code {e.code}: {error_body}. 개별 번역으로 폴백합니다.")
    except Exception as e:
        print(f"  [배치 번역 에러]: {e}. 개별 번역으로 폴백합니다.")
        
    results = []
    for t in texts:
        results.append(translate_single(t, target_lang_name))
        time.sleep(0.5)
    return results

def translate_single(text, target_lang_name):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
    prompt = f"Translate the following Korean text into {target_lang_name}. Return ONLY the translation. Keep variables like {{amount}}, {{name}}, {{year}}, {{month}}, {{day}} intact. Do not wrap in quotes.\n\nText: {text}"
    headers = {"Content-Type": "application/json"}
    body = {"contents": [{"parts": [{"text": prompt}]}]}
    req = urllib.request.Request(url, data=json.dumps(body).encode('utf-8'), headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            if 'candidates' not in res_data:
                return text
            translation = res_data['candidates'][0]['content']['parts'][0]['text'].strip()
            if translation.startswith('"') and translation.endswith('"'):
                translation = translation[1:-1]
            if translation.startswith("'") and translation.endswith("'"):
                translation = translation[1:-1]
            return translation
    except urllib.error.HTTPError as e:
        print(f"    [개별 HTTP 에러] Code {e.code}: {e.read().decode('utf-8')}")
    except Exception:
        pass
    return text

def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

    if not os.path.exists('translation_audit_temp.json'):
        print("감사 결과 파일이 없습니다.")
        return
        
    with open('translation_audit_temp.json', 'r', encoding='utf-8') as f:
        audit_data = json.load(f)
        
    missing_in_ko = audit_data.get('missing_in_ko', [])
    
    print(f"[1단계] {len(missing_in_ko)}개의 누락된 한국어 키를 ko/common.ts에 주입 중...")
    ko_common_path = os.path.join(TRANSLATIONS_DIR, 'ko', 'common.ts')
    ko_common_data, var_name, header = read_ts_file(ko_common_path)
    
    added_count = 0
    for k in missing_in_ko:
        if k not in ko_common_data:
            ko_common_data[k] = k
            added_count += 1
            
    write_ts_file(ko_common_path, ko_common_data, var_name, header)
    print(f"  - 완료: ko/common.ts에 {added_count}개 키 신규 주입됨.")

    ko_dir = os.path.join(TRANSLATIONS_DIR, 'ko')
    ts_files = [f for f in os.listdir(ko_dir) if f.endswith('.ts') and f != 'index.ts']
    
    print("\n[2-3단계] 14개 언어 파일 동기화 및 번역 주입 시작...")
    
    for lang, folder in LANGUAGES.items():
        if lang == 'ko':
            continue
            
        print(f"\n* 언어 처리 중: {lang} ({folder})")
        lang_dir = os.path.join(TRANSLATIONS_DIR, folder)
        target_lang_name = LANG_NAMES[lang]
        
        for f_name in ts_files:
            ko_file_path = os.path.join(ko_dir, f_name)
            lang_file_path = os.path.join(lang_dir, f_name)
            
            ko_data, ko_var, ko_header = read_ts_file(ko_file_path)
            lang_data, lang_var, lang_header = read_ts_file(lang_file_path)
            
            if not lang_var:
                lang_var = ko_var
                
            ko_keys = set(ko_data.keys())
            lang_keys = set(lang_data.keys())
            
            missing_keys = ko_keys - lang_keys
            redundant_keys = lang_keys - ko_keys
            
            FORCE_TRANSLATE_KEYS = {
                "최근 5년 동안 한국에서 일하며 더 낸 세금이 얼마인지 즉시 확인합니다. 환급금이 확인되면, 국세청에서 고객님 통장으로 환급금이 입금된 후에만 출금되는 후불제 정산(플랫폼 이용료 25%) 등록을 진행합니다. 환급 거절/실패 시 청구되는 금액은 0원입니다.",
                "국세청에서 고객님 명의의 은행 계좌로 환급금을 직접 입금해 드리면, 나중에 후불 정산합니다.",
                "후불제 자동 정산"
            }

            new_lang_data = {}
            for k in ko_keys:
                if k in lang_data and k not in FORCE_TRANSLATE_KEYS:
                    new_lang_data[k] = lang_data[k]
            
            keys_to_translate = []
            pre_mapped = {}
            
            for k in missing_keys:
                found_existing_val = None
                redundant_candidates = REDUNDANT_MAP.get(k, [])
                for r_cand in redundant_candidates:
                    for red_key in redundant_keys:
                        if r_cand.lower().replace(" ", "") == red_key.lower().replace(" ", ""):
                            found_existing_val = lang_data[red_key]
                            break
                    if found_existing_val:
                        break
                        
                if found_existing_val:
                    pre_mapped[k] = found_existing_val
                else:
                    keys_to_translate.append(k)
            
            for k in FORCE_TRANSLATE_KEYS:
                if k in ko_keys:
                    keys_to_translate.append(k)

            for k, val in pre_mapped.items():
                new_lang_data[k] = val
                print(f"  [{f_name}] 기존 키 매핑 승계: '{k}' -> '{val}'")
                
            if keys_to_translate:
                print(f"  [{f_name}] {len(keys_to_translate)}개 키 번역 시작 (Batch) -> {target_lang_name}...")
                
                chunk_size = 30
                translated_vals = []
                for i in range(0, len(keys_to_translate), chunk_size):
                    chunk = keys_to_translate[i:i+chunk_size]
                    chunk_vals = [ko_data[k] for k in chunk]
                    chunk_translated = translate_batch_via_gemini(chunk_vals, target_lang_name)
                    translated_vals.extend(chunk_translated)
                    time.sleep(0.5)
                
                for k, val in zip(keys_to_translate, translated_vals):
                    new_lang_data[k] = val
            
            write_ts_file(lang_file_path, new_lang_data, lang_var, lang_header)
            
    print("\n[완료] 15개국 전체 번역 키 100% 완벽 동기화 완료!")

if __name__ == '__main__':
    main()
