import os
import glob
import sys

from full_trans_a import translations_a
from full_trans_b import translations_b
from full_trans_c import translations_c
from full_trans_d import translations_d

all_translations = {}
all_translations.update(translations_a)
all_translations.update(translations_b)
all_translations.update(translations_c)
all_translations.update(translations_d)

base_keys = [
    "환급은 어떻게 받나요?",
    "안녕하세요! 숨은 세금 환급금을 찾아 통장으로 받기까지의 전체 핵심 4단계 과정을 안내해 드릴게요. 🚀\n\n1️⃣ [가장 중요] 본인 인증서 설치 및 인증\n고객님의 정확한 환급액을 확인하려면 한국 국세청(NTS) 전산망과 안전하게 연결해야 합니다. 화면의 안내에 따라 카카오톡, PASS, 네이버 등의 인증서를 발급(설치) 하시고 본인 인증을 먼저 꼭 완료해 주세요! (고객님의 정보는 안전하게 보호됩니다.)\n\n2️⃣ 정확한 환급금 확인\n인증이 완료되면, 최근 5년 동안 한국에서 일하며 더 낸 세금이 얼마인지 화면에 즉시 나타납니다.\n\n3️⃣ 수수료 결제 및 계좌 입력 (Step 8 ~ Step 9)\n환급금이 있다면, 세무사 수임료(25%)를 먼저 결제하신 후 환급금을 입금받으실 본인 명의의 은행 계좌번호를 입력해 주세요. (환급이 불가능한 경우 수수료는 100% 환불됩니다.)\n\n4️⃣ 국세청 처리 및 입금 완료\n담당 세무사가 국세청에 신고를 완료하면, 약 1~2개월 뒤에 한국 국세청에서 직접 고객님의 계좌로 돈을 입금해 드립니다.\n\n💬 지금 해야 할 일!\n대화창을 닫고, 화면에 보이는 [인증 수단 선택] 버튼을 눌러 인증서를 먼저 설치해 보세요. 막히는 부분이 있다면 언제든 다시 질문해 주세요!",
    "인증서는 꼭 발급받아야 하나요?",
    "네, 선택이 아닌 필수입니다! 🚨\n\n한국 국세청(NTS)은 개인의 민감한 세금 및 금융 정보를 다루기 때문에, 보안이 가장 강력한 '간편 인증서(PASS, 카카오, 네이버 등)'가 없으면 그 누구도 고객님의 세금 기록을 열람할 수 없습니다.\n\n인증서는 국세청 금고를 열어 고객님의 숨은 돈을 확인하는 유일한 '디지털 열쇠'입니다. 🔑\n이 열쇠가 없으면 전문 세무사조차도 고객님의 환급금이 얼마인지 확인하거나 환급을 신청할 방법이 전혀 없습니다. \n\n조금 번거로우시더라도, 소중한 내 돈을 안전하게 돌려받기 위한 필수 정부 보안 절차이니 꼭 안내에 따라 인증서를 발급(설치)해 주시길 부탁드립니다!",
    "이지택스, 믿을 수 있나요?",
    "네, 안심하고 이용하셔도 좋습니다! 이지택스를 믿을 수 있는 3가지 확실한 이유를 말씀드릴게요. 🛡️\n\n1️⃣ 100% 한국 국세청(NTS)에서 직접 입금해 드립니다.\n가장 많이 걱정하시는 부분이죠! 저희는 고객님의 환급금에 절대 손대지 않습니다. 신고가 완료되면 환급금은 저희를 거치지 않고, 한국 국세청에서 고객님 본인 명의의 계좌로 직접 송금합니다.\n\n2️⃣ 국가 공인 전문 세무사가 전담합니다.\n모든 환급 절차는 엄격한 자격을 갖춘 대한민국 국가 공인 전문 세무사가 합법적이고 꼼꼼하게 처리합니다.\n\n3️⃣ 철저한 개인정보 보호\n본인 인증과 개인정보는 오직 정부(국세청) 시스템에 세금 환급을 신고하기 위한 목적으로만 사용되며, 철저한 보안 속에 안전하게 보호됩니다.\n\n매년 수많은 외국인 근로자분들이 잘 몰라서 놓치고 있는 '정당하게 돌려받아야 할 내 돈'을 안전하게 찾아드리고 있습니다. 안심하고 화면의 안내에 따라 조회를 시작해 보세요! 👍",
    "수수료는 왜 내야 하나요?",
    "수수료 25%는 고객님의 세금을 꼼꼼하게 다시 계산해서 국세청에 대신 신고해 주는 '전문 세무사'의 정당한 수임료(인건비)입니다. 👨‍💼💼\n\n세금 환급은 단순히 버튼만 누른다고 돈이 나오는 것이 아니라, 과거 5년 치의 복잡한 세금 기록을 세무사가 직접 분석하고 국세청에 신고 서류를 제출해야 하는 까다로운 법적 절차입니다. \n\n⚠️ 수수료를 미리 결제해야 하는 진짜 이유!\n고객님의 환급금은 저희를 거치지 않고 '한국 국세청'에서 '고객님의 계좌'로 100% 직접 입금됩니다. 따라서 저희가 환급금에서 수수료를 빼고 입금해 드릴 수가 시스템상 불가능합니다. \n(단, 세무사의 최종 검토 결과 환급이 불가능하다고 판정되면 결제하신 수수료는 100% 즉시 환불해 드립니다!)",
    "언제 입금되나요?",
    "환급 신청을 완료하신 후, 실제 통장으로 돈이 입금되기까지는 보통 45일에서 최대 60일 정도 소요됩니다. ⏳\n\n시간이 꽤 걸리는 이유는, 한국 국세청(NTS)의 공무원들이 고객님의 지난 5년 치 세금 기록을 하나하나 꼼꼼히 확인하고 승인하는 심사 기간이 필요하기 때문입니다. (관할 세무서의 업무량에 따라 조금 더 빠르거나 늦어질 수 있습니다.)\n\n환급 진행 상황은 언제든지 이지택스의 [나의 환급 진행사항] 메뉴에서 실시간으로 확인하실 수 있으니 안심하고 기다려 주세요!",
    "신분증 사진, 안전한가요?",
    "네, 100% 안전합니다! 신분증 사진이 혹시라도 나쁜 곳에 쓰일까 걱정하시는 마음, 충분히 이해합니다. 이지택스의 철저한 보안 원칙 3가지를 약속드립니다. 🔒\n\n1️⃣ 전송 즉시 영구 삭제 (저장 NO!)\n촬영하신 신분증 사진은 저희 서버나 휴대폰에 절대 '저장'되지 않습니다. 오직 세무서에 본인 확인용으로 제출되는 즉시 영구적으로 파기됩니다.\n\n2️⃣ 국세청(정부) 필수 제출 서류\n한국 국세청(NTS)에서 세금 환급을 승인하려면, '이 사람이 진짜 본인이 맞는지' 확인하기 위해 반드시 신분증 사본을 요구합니다. 저희는 이 필수 서류를 국세청에 대신 내드리는 역할만 할 뿐, 대출이나 휴대폰 개통 등 다른 어떤 목적으로도 절대 사용할 수 없습니다.\n\n3️⃣ 은행급 암호화 보안\n고객님의 모든 정보는 한국의 대형 은행들과 동일한 수준의 강력한 암호화 시스템을 통해 국세청으로만 바로 전송됩니다. \n\n내 소중한 개인정보가 유출될 일은 절대 없으니, 안심하고 안내에 따라 신분증을 촬영해 주세요!",
    "환급액이 0원이라고 나오는데 왜 그런가요?",
    "조회 결과 환급액이 0원으로 나오셨나요? 이는 정상적인 결과일 수 있습니다. 📊\n\n세금 환급은 '내가 낸 세금' 중에서 '돌려받을 자격이 있는 세금'을 돌려받는 것입니다. 만약 과거에 다니던 회사에서 연말정산을 완벽하게 잘 처리해주었거나, 납부한 세금 자체가 적었다면 돌려받을 추가 금액(숨은 세금)이 없을 수 있습니다. \n\n이번에는 환급액이 0원이더라도, 내년이나 이직 후에 다시 조회해 보시면 환급금이 발생할 수 있으니 내년에 이지택스를 다시 꼭 찾아주세요!",
    "다른 사람 명의 은행 계좌로 받을 수 있나요?",
    "아니요, 절대 불가능합니다! 🚫\n\n금융 사기 및 명의 도용을 방지하기 위해 한국 국세청(NTS)은 '환급을 신청한 본인 이름'과 정확히 일치하는 은행 계좌로만 돈을 입금합니다. \n\n따라서 반드시 환급자 본인 명의로 된 한국 은행 계좌를 입력해 주셔야 하며, 다른 일체의 계좌 번호를 입력하시면 국세청에서 환급금 송금을 거절하게 됩니다.",
    "이미 한국을 떠났는데 환급받을 수 있나요?",
    "네, 조건만 맞으면 가능합니다! ✈️\n\n비록 현재 한국에 없더라도, 아래 두 가지 조건만 충족하신다면 이지택스를 통해 환급 신청이 가능합니다.\n\n1. 본인 인증 통과: 현재 가입되어 있는 한국 통신사(알뜰폰 포함) 번호를 통해 본인 인증(PASS 문자 등)을 받을 수 있어야 합니다.\n2. 한국 은행 계좌 유지: 환급금을 입금받을 수 있는 본인 명의의 '한국 은행 계좌'가 아직 정지되지 않고 열려 있어야 합니다.\n\n위 두 가지가 가능하시다면 타국에서도 문제없이 앱을 통해 환급을 신청하실 수 있습니다!",
    "상담원과 직접 채팅하기",
    "자주 묻는 질문 (FAQ)"
]

all_translations['ko'] = base_keys

def format_ts_string(s):
    s = s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
    return s

def process_file(file_path):
    lang = file_path.split(os.sep)[-2]
    
    if lang not in all_translations:
        print(f"Skipping {lang}, not in translations.")
        return
        
    trans_list = all_translations[lang]
    if len(trans_list) != len(base_keys):
        print(f"Error: {lang} has {len(trans_list)} translations, expected {len(base_keys)}")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # We will remove all previously added FAQ keys to avoid duplication.
    # We can do this by splitting at "};" and just keeping the original parts that are not our base keys.
    # Actually, a simpler way is to just parse out any line that starts with our base keys, but they might span multiple lines.
    # The safest way: use a regex or just clean up the file. Since I appended them before "};", they are at the end.
    
    # We can rebuild the file:
    # Read line by line. If a line contains any of the base keys as a key, we drop it.
    
    # But some values have newlines \n, meaning they are just one long line in TS.
    # Let's use a simpler approach:
    # Just read the original file, remove ALL the previous injections (we can do this by restoring git or just stripping out lines containing our base keys).
    
    # Actually, the user's `ko/faq.ts` doesn't have the keys at all. 
    # For others, they were appended in my previous scripts.
    pass

def rewrite_files():
    search_path = os.path.join('c:\\', 'Users', 'zkfnt', 'Desktop', 'easy-tax-refund', 'easy-tax-refund-main', 'easy-tax-refund-main', 'src', 'lib', 'translations', '*', 'faq.ts')
    files = glob.glob(search_path)
    
    # First, to make sure we don't duplicate, we will run `git checkout src/lib/translations/*/faq.ts` to reset them to HEAD.
    os.system('git restore src/lib/translations/*/faq.ts')
    
    for file_path in files:
        lang = file_path.split(os.sep)[-2]
        if lang not in all_translations:
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if '};' in content:
            parts = content.rsplit('};', 1)
            content_before = parts[0].strip()
            
            # Remove trailing comma if exists to cleanly add ours
            if content_before.endswith(','):
                pass
            else:
                content_before += ','
                
            new_lines = ""
            for i in range(len(base_keys)):
                k = format_ts_string(base_keys[i])
                v = format_ts_string(all_translations[lang][i])
                new_lines += f'\n  "{k}": "{v}",'
                
            new_content = content_before + new_lines + '\n};\n'
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {file_path} ({lang})")

if __name__ == '__main__':
    rewrite_files()
