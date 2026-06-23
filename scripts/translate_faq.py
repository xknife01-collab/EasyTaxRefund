import os
import glob

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
    "네, 조건만 맞으면 가능합니다! ✈️\n\n비록 현재 한국에 없더라도, 아래 두 가지 조건만 충족하신다면 이지택스를 통해 환급 신청이 가능합니다.\n\n1. 본인 인증 통과: 현재 가입되어 있는 한국 통신사(알뜰폰 포함) 번호를 통해 본인 인증(PASS 문자 등)을 받을 수 있어야 합니다.\n2. 한국 은행 계좌 유지: 환급금을 입금받을 수 있는 본인 명의의 '한국 은행 계좌'가 아직 정지되지 않고 열려 있어야 합니다.\n\n위 두 가지가 가능하시다면 타국에서도 문제없이 앱을 통해 환급을 신청하실 수 있습니다!"
]

t_en = [
    "How do I get my refund?",
    "Hello! Let me guide you through the 4 key steps to receive your hidden tax refund. 🚀\n\n1️⃣ [Most Important] Identity Certificate Installation & Verification\nTo check your refund amount, we must safely connect to the Korean National Tax Service (NTS). Please follow the on-screen instructions to issue a certificate like KakaoTalk, PASS, or Naver and complete identity verification! (Your info is safely protected.)\n\n2️⃣ Check Exact Refund Amount\nOnce verified, the amount of overpaid taxes from working in Korea over the past 5 years will instantly appear.\n\n3️⃣ Pay Fee & Enter Account\nIf you have a refund, please pay the tax accountant's fee (25%) first and then enter your bank account number. (Fee is 100% refunded if a refund is impossible.)\n\n4️⃣ NTS Processing & Deposit\nOnce the tax accountant files it, the Korean NTS will directly deposit the money into your account in about 1-2 months.",
    "Do I really need a certificate?",
    "Yes, it is mandatory! 🚨\n\nBecause the NTS handles sensitive personal tax information, no one can view your records without a highly secure 'Simple Certificate'.\n\nThe certificate is the only 'digital key' to check your hidden money. 🔑 Without it, even a tax accountant cannot check your refund amount or apply for it.\n\nPlease follow the instructions to issue the certificate for this essential government security procedure!",
    "Can I trust Easy Tax Refund?",
    "Yes, you can use it with complete peace of mind! Here are 3 reasons. 🛡️\n\n1️⃣ 100% Direct Deposit from NTS.\nWe never touch your refund money. The NTS transfers it directly to your bank account.\n\n2️⃣ Handled by State-Certified Tax Accountants.\nAll procedures are handled legally by strictly qualified Korean state-certified tax accountants.\n\n3️⃣ Strict Personal Info Protection\nIdentity verification is used solely for filing your tax refund with the government and is safely protected.",
    "Why do I have to pay a fee?",
    "The 25% fee is the rightful service fee for a professional tax accountant who recalculates your taxes and files them with the NTS. 👨‍💼💼\n\n⚠️ The reason you must pay in advance!\nYour refund is directly deposited from the NTS to your account. Therefore, it is impossible for us to deduct the fee from your refund.\n(However, if a refund is not possible, the fee is 100% refunded!)",
    "When will it be deposited?",
    "It usually takes about 45 to 60 days for the money to be deposited into your bank account. ⏳\n\nIt takes time because NTS officials meticulously check and approve your tax records for the past 5 years.\n\nYou can always check the progress in the [My Refund Status] menu!",
    "Is my ID photo safe?",
    "Yes, it is 100% safe! We promise 3 strict security principles. 🔒\n\n1️⃣ Permanently Deleted Immediately (NO Saving!)\nThe ID photo is never saved on our servers. It is permanently destroyed once submitted.\n\n2️⃣ Mandatory Government Document\nThe NTS mandatorily requires a copy of your ID to verify your identity. We never use it for any other purpose.\n\n3️⃣ Bank-Level Encryption\nYour information is transmitted directly to the NTS through a powerful encryption system.",
    "Why does my refund amount show as 0 won?",
    "This can be a normal result. 📊\n\nIf your previous company processed your year-end tax settlement perfectly, or if the taxes you actually paid were low, there might be no additional amount to get back.\n\nEven if it's 0 won this time, you might generate a refund if you check again next year!",
    "Can I receive it in someone else's bank account?",
    "No, that is absolutely impossible! 🚫\n\nTo prevent financial fraud, the NTS deposits money ONLY into a bank account that exactly matches the name of the person applying for the refund.\n\nYou must enter a Korean bank account under your own name.",
    "Can I get a refund even though I already left Korea?",
    "Yes, it is possible if you meet the conditions! ✈️\n\nEven if you are not currently in Korea, you can apply if:\n1. Pass Identity Verification: You can receive verification texts through a Korean phone number.\n2. Maintain a Korean Bank Account: Your Korean bank account is still open.\n\nIf these are met, you can apply through the app from another country!"
]

t_vi = [
    "Làm thế nào để tôi nhận được tiền hoàn lại?",
    "Xin chào! Tôi sẽ hướng dẫn bạn 4 bước chính để nhận tiền hoàn thuế. 🚀\n\n1️⃣ [Quan trọng nhất] Cài đặt & Xác thực chứng chỉ\nĐể kiểm tra số tiền hoàn lại, chúng ta phải kết nối an toàn với Cơ quan Thuế Quốc gia Hàn Quốc (NTS). Vui lòng làm theo hướng dẫn trên màn hình để cấp (cài đặt) chứng chỉ như KakaoTalk, PASS hoặc Naver và hoàn thành xác thực danh tính! (Thông tin của bạn được bảo vệ an toàn.)\n\n2️⃣ Kiểm tra số tiền hoàn lại chính xác\nSau khi xác thực, số tiền thuế nộp thừa từ việc làm việc tại Hàn Quốc trong 5 năm qua sẽ hiện ra.\n\n3️⃣ Trả phí & Nhập tài khoản\nNếu bạn có tiền hoàn lại, vui lòng trả phí kế toán thuế (25%) trước và sau đó nhập số tài khoản ngân hàng của bạn. (Sẽ hoàn tiền 100% phí nếu không thể hoàn thuế.)\n\n4️⃣ NTS Xử lý & Hoàn tất gửi tiền\nSau khi kế toán thuế nộp hồ sơ, NTS Hàn Quốc sẽ trực tiếp gửi tiền vào tài khoản của bạn trong khoảng 1-2 tháng.",
    "Tôi có thực sự cần chứng chỉ không?",
    "Có, đây là điều bắt buộc! 🚨\n\nVì NTS xử lý thông tin thuế cá nhân nhạy cảm, không ai có thể xem hồ sơ của bạn mà không có 'Chứng chỉ đơn giản' có tính bảo mật cao.\n\nChứng chỉ là 'chìa khóa kỹ thuật số' duy nhất để kiểm tra số tiền của bạn. 🔑 Nếu không có nó, ngay cả kế toán thuế cũng không thể kiểm tra hoặc nộp đơn xin hoàn thuế.\n\nVui lòng làm theo hướng dẫn để cấp chứng chỉ cho thủ tục bảo mật thiết yếu này của chính phủ!",
    "Tôi có thể tin tưởng Easy Tax Refund không?",
    "Có, bạn có thể sử dụng nó với sự an tâm hoàn toàn! Dưới đây là 3 lý do. 🛡️\n\n1️⃣ 100% Tiền gửi trực tiếp từ NTS.\nChúng tôi không bao giờ chạm vào tiền hoàn lại của bạn. NTS chuyển trực tiếp vào tài khoản ngân hàng của bạn.\n\n2️⃣ Được xử lý bởi các Kế toán thuế được Nhà nước cấp phép.\nTất cả các thủ tục được xử lý hợp pháp bởi các kế toán thuế chuyên nghiệp được nhà nước Hàn Quốc cấp phép.\n\n3️⃣ Bảo vệ thông tin cá nhân nghiêm ngặt\nXác thực danh tính chỉ được sử dụng để nộp hồ sơ hoàn thuế của bạn với chính phủ và được bảo vệ an toàn.",
    "Tại sao tôi phải trả phí?",
    "Phí 25% là phí dịch vụ hợp pháp cho một kế toán thuế chuyên nghiệp, người tính toán lại các loại thuế của bạn và nộp chúng cho NTS. 👨‍💼💼\n\n⚠️ Lý do bạn phải trả trước!\nTiền hoàn lại của bạn được NTS gửi trực tiếp vào tài khoản của bạn. Do đó, chúng tôi không thể trừ phí từ tiền hoàn lại của bạn.\n(Tuy nhiên, nếu không thể hoàn lại, phí sẽ được hoàn lại 100%!)",
    "Khi nào tiền sẽ được gửi?",
    "Thường mất khoảng 45 đến 60 ngày để tiền được gửi vào tài khoản ngân hàng của bạn. ⏳\n\nSẽ mất thời gian vì các quan chức NTS kiểm tra và phê duyệt tỉ mỉ hồ sơ thuế của bạn trong 5 năm qua.\n\nBạn luôn có thể kiểm tra tiến độ trong menu [Trạng thái hoàn tiền của tôi]!",
    "Ảnh CMND/ARC của tôi có an toàn không?",
    "Có, an toàn 100%! Chúng tôi hứa 3 nguyên tắc bảo mật nghiêm ngặt. 🔒\n\n1️⃣ Xóa vĩnh viễn ngay lập tức (KHÔNG Lưu!)\nẢnh CMND không bao giờ được lưu trên máy chủ của chúng tôi. Nó bị hủy vĩnh viễn sau khi gửi.\n\n2️⃣ Tài liệu Bắt buộc của Chính phủ\nNTS bắt buộc yêu cầu bản sao CMND của bạn để xác minh danh tính của bạn. Chúng tôi không bao giờ sử dụng nó cho bất kỳ mục đích nào khác.\n\n3️⃣ Bảo mật Mã hóa cấp Ngân hàng\nThông tin của bạn được truyền trực tiếp đến NTS thông qua hệ thống mã hóa mạnh mẽ.",
    "Tại sao số tiền hoàn lại của tôi lại hiển thị là 0 won?",
    "Đây có thể là kết quả bình thường. 📊\n\nNếu công ty trước đây của bạn xử lý quyết toán thuế cuối năm một cách hoàn hảo, hoặc nếu số thuế bạn thực sự nộp thấp, có thể không có số tiền bổ sung để lấy lại.\n\nNgay cả khi lần này là 0 won, bạn có thể tạo ra tiền hoàn lại nếu kiểm tra lại vào năm sau!",
    "Tôi có thể nhận tiền vào tài khoản ngân hàng của người khác không?",
    "Không, điều đó hoàn toàn không thể! 🚫\n\nĐể ngăn chặn gian lận tài chính, NTS CHỈ gửi tiền vào tài khoản ngân hàng khớp chính xác với tên của người nộp đơn xin hoàn tiền.\n\nBạn phải nhập tài khoản ngân hàng Hàn Quốc dưới tên của chính bạn.",
    "Tôi có thể được hoàn tiền mặc dù tôi đã rời khỏi Hàn Quốc không?",
    "Có, hoàn toàn có thể nếu bạn đáp ứng các điều kiện! ✈️\n\nNgay cả khi bạn hiện không ở Hàn Quốc, bạn có thể nộp đơn nếu:\n1. Vượt qua Xác minh Danh tính: Bạn có thể nhận tin nhắn xác minh thông qua số điện thoại Hàn Quốc.\n2. Duy trì Tài khoản Ngân hàng Hàn Quốc: Tài khoản ngân hàng Hàn Quốc của bạn vẫn đang mở.\n\nNếu đáp ứng những điều này, bạn có thể nộp đơn thông qua ứng dụng từ một quốc gia khác!"
]

t_zh = [
    "我该如何获得退税？",
    "您好！让我带您了解获得隐藏退税的4个关键步骤。🚀\n\n1️⃣ [最重要] 身份认证证书安装与验证\n为了准确查询您的退税金额，我们必须安全地连接到韩国国税厅（NTS）。请按照屏幕上的说明发放（安装）KakaoTalk、PASS或Naver等证书，并首先完成身份验证！（您的信息受到安全保护。）\n\n2️⃣ 确认准确的退税金额\n验证完成后，您过去5年在韩国工作多缴纳的税款将立即显示在屏幕上。\n\n3️⃣ 支付手续费及输入账户（第8步 ~ 第9步）\n如果有退税，请先支付税务师手续费（25%），然后输入您本人名下的银行账号。（如果无法退税，手续费将100%退还。）\n\n4️⃣ 国税厅处理及入账完成\n税务师完成向国税厅的申报后，韩国国税厅将在约1-2个月内直接将钱汇入您的账户。",
    "一定要发放证书吗？",
    "是的，这是必须的，而不是可选的！🚨\n\n因为韩国国税厅（NTS）处理敏感的个人税务及金融信息，如果没有安全级别最高的“简易证书（PASS、Kakao、Naver等）”，任何人都无法查看您的税务记录。\n\n证书是打开国税厅金库确认您隐藏资金的唯一“数字钥匙”。🔑\n如果没有这把钥匙，即使是专业税务师也完全无法确认您的退税金额或申请退税。\n\n即使稍微有些繁琐，这也是为了安全找回您宝贵资金的必要政府安全程序，请务必按照说明发放（安装）证书！",
    "Easy Tax Refund 可以信任吗？",
    "是的，您可以安心使用！我们为您提供3个可以信任Easy Tax Refund的确切理由。🛡️\n\n1️⃣ 100% 由韩国国税厅（NTS）直接入账。\n这是您最担心的部分！我们绝对不会碰您的退税款。申报完成后，退税款不会经过我们，而是由韩国国税厅直接汇入您本人名下的账户。\n\n2️⃣ 由国家公认的专业税务师专职负责。\n所有退税程序均由具备严格资格的大韩民国国家公认专业税务师合法、细致地处理。\n\n3️⃣ 彻底的个人信息保护\n身份验证和个人信息仅用于向政府（国税厅）系统申报退税的目的，并在彻底的安保下受到安全保护。",
    "为什么要缴纳手续费？",
    "25%的手续费是代替您向国税厅申报的“专业税务师”的正当代理费（人工费）。👨‍💼💼\n\n⚠️ 必须预先支付手续费的真正原因！\n您的退税款不会经过我们，而是100%由“韩国国税厅”直接汇入“您的账户”。因此，在系统上，我们无法从退税款中扣除手续费后再汇给您。\n（但是，如果税务师最终审查结果判定无法退税，您支付的手续费将立即100%退还！）",
    "什么时候入账？",
    "完成退税申请后，实际将钱汇入存折通常需要45天到最多60天左右的时间。⏳\n\n需要这么长时间的原因是，韩国国税厅（NTS）的公务员需要审查期，仔细确认并批准您过去5年的税务记录。\n\n您可以随时在Easy Tax Refund的[我的退税进度]菜单中实时确认退税进度，请安心等待！",
    "身份证（外国人登录证）照片安全吗？",
    "是的，100%安全！我们非常理解您担心身份证照片可能被用于不良用途。我们承诺Easy Tax Refund的3大彻底安保原则。🔒\n\n1️⃣ 传输后立即永久删除（不保存！）\n您拍摄的身份证照片绝对不会“保存”在我们的服务器或手机上。在作为身份确认提交给税务署后，将立即永久销毁。\n\n2️⃣ 国税厅（政府）必须提交的材料\n韩国国税厅（NTS）要求必须提供身份证复印件以确认“此人是否真的是本人”。我们只负责代您向国税厅提交这份必须材料，绝对不能用于贷款或开通手机等任何其他目的。\n\n3️⃣ 银行级加密安保\n您的所有信息均通过与韩国大型银行同等水平的强大加密系统直接传输至国税厅。",
    "为什么查询结果退税额为0韩元？",
    "查询结果退税额显示为0韩元吗？这可能是正常结果。📊\n\n退税是拿回“您缴纳的税款”中“有资格拿回的税款”。如果以前就职的公司完美处理了年末结算，或者您缴纳的税款本身就少，可能就没有可以额外拿回的金额（隐藏税款）。\n\n即使这次退税额为0韩元，明年或跳槽后再次查询时可能会产生退税款，所以明年请务必再次访问Easy Tax Refund！",
    "可以用他人（家人/朋友）名义的银行账户接收吗？",
    "不行，绝对不可能！🚫\n\n为了防止金融诈骗和盗用名义，韩国国税厅（NTS）只向与“申请退税的本人姓名”完全一致的银行账户汇款。\n\n因此，您必须输入退税者本人名义的韩国银行账户，如果输入任何其他账号，国税厅将拒绝汇出退税款。",
    "我已经离开韩国了，还能获得退税吗？",
    "是的，只要符合条件就可以！✈️\n\n即使您现在不在韩国，只要满足以下两个条件，就可以通过Easy Tax Refund申请退税。\n\n1. 通过身份验证：您必须能够通过当前加入的韩国通信公司（包括平价手机）号码接收身份验证（PASS短信等）。\n2. 维持韩国银行账户：可以接收退税款的本人名义的“韩国银行账户”必须尚未停用且处于开通状态。\n\n如果这两点都能做到，在其他国家也可以毫无问题地通过App申请退税！"
]

# Provide fallback translated dictionary
translations = {
    "en": t_en,
    "zh": t_zh,
    "vi": t_vi,
    "th": t_en,
    "id": t_en,
    "kk": t_en,
    "km": t_en,
    "mn": t_en,
    "my": t_en,
    "ne_new_stable": t_en,
    "si": t_en,
    "ur_new": t_en,
    "uz": t_en,
    "bn": t_en
}

def format_ts_string(s):
    s = s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
    return s

def main():
    search_path = r'c:\Users\zkfnt\Desktop\easy-tax-refund\easy-tax-refund-main\easy-tax-refund-main\src\lib\translations\*\faq.ts'
    files = glob.glob(search_path)
    
    for file_path in files:
        if '\\ko\\' in file_path:
            continue
            
        lang = file_path.split('\\')[-2]
        if lang not in translations:
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if '환급은 어떻게 받나요?' in content:
            print(f"Skipping {lang}, already updated.")
            continue
            
        if '};' in content:
            parts = content.rsplit('};', 1)
            content_before = parts[0].strip()
            
            new_lines = ""
            for i in range(len(base_keys)):
                k = format_ts_string(base_keys[i])
                # Using the translated array for the specific language
                v = format_ts_string(translations[lang][i])
                new_lines += f'  "{k}": "{v}",\n'
                
            if not content_before.endswith(','):
                content_before += ','
                
            new_content = content_before + '\n' + new_lines + '};' + parts[1]
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {file_path} ({lang})")

if __name__ == '__main__':
    main()
