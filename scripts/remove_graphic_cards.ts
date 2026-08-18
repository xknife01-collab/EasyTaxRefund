import fs from 'fs';
import path from 'path';

// 1. Update FloatingAiChat.tsx
const floatingChatPath = path.join(process.cwd(), 'src/components/FloatingAiChat.tsx');
let content = fs.readFileSync(floatingChatPath, 'utf8');

// (a) Remove richCard from Step 1
content = content.replace(
  /metrics:\s*\{\s*estimated_refund:\s*'₩450,000 ~ ₩1,800,000'\s*\}\s*\}\s*\};\s*case 2:/g,
  '}; case 2:'
);
content = content.replace(
  /richCard:\s*\{\s*cardType:\s*'estimate_preview'[\s\S]*?metrics:\s*\{[\s\S]*?\}\s*\}\s*\};\s*case 2:/g,
  '}; case 2:'
);

// (b) Remove richCard from Step 2
content = content.replace(
  /richCard:\s*\{\s*cardType:\s*'security_badge'[\s\S]*?국세청 연동 즉시 자동 파기됩니다\.'\s*\}\s*\};\s*case 3:/g,
  '}; case 3:'
);

// (c) Remove richCard from Step 3
content = content.replace(
  /richCard:\s*\{\s*cardType:\s*'telecom_helper'[\s\S]*?알뜰폰 대행사 구분을 확인해 주세요\.'\s*\}\s*\};\s*case 4:/g,
  '}; case 4:'
);

// (d) Remove richCard from Step 9
content = content.replace(
  /richCard:\s*\{\s*cardType:\s*'completion_checklist'[\s\S]*?title: lang === 'ne' \? 'कर फिर्ता आवेदन चेकलिस्ट' : '환급금 신청 진행 체크리스트'\s*\}\s*\};\s*case 10:/g,
  '}; case 10:'
);

// (e) In RichCardRenderer, return null for estimate_preview, security_badge, telecom_helper, completion_checklist
const oldRendererRegex = /function RichCardRenderer\(\{[\s\S]*?switch \(cardType\) \{[\s\S]*?case 'guide':\s*return <LiveVisualCoachCard activeGuide=\{activeGuide\} language=\{language\} onAskQuestion=\{onAskQuestion\} \/>;\s*default:\s*return null;\s*\}\s*\}/;

const newRenderer = `function RichCardRenderer({
  card,
  language,
  currentStep,
  activeGuide,
  onAskQuestion
}: {
  card: NonNullable<ChatMessage['richCard']>;
  language?: string;
  currentStep?: number;
  activeGuide?: { method: 'hana' | 'pass' | 'kakao'; slideIndex: number; total: number } | null;
  onAskQuestion?: (q: string) => void;
}) {
  const { cardType } = card;

  // Clunky graphics (badges, locks, checklists) are permanently disabled for premium 1:1 manager experience
  switch (cardType) {
    case 'guide':
      return <LiveVisualCoachCard activeGuide={activeGuide} language={language} onAskQuestion={onAskQuestion} />;
    default:
      return null;
  }
}`;

content = content.replace(oldRendererRegex, newRenderer);

fs.writeFileSync(floatingChatPath, content, 'utf8');
console.log('Successfully updated FloatingAiChat.tsx');

// 2. Update manager-chat-flow.ts
const managerFlowPath = path.join(process.cwd(), 'src/ai/flows/manager-chat-flow.ts');
let flowContent = fs.readFileSync(managerFlowPath, 'utf8');

// Update prompt instructions so AI manager only uses guide for slide coaching and does NOT output fake badge/lock cards
flowContent = flowContent.replace(
  /- 만약 고객이 보안에 대해 가볍게 궁금해하거나[\s\S]*?자연스럽게 팩트를 전달하십시오\./g,
  "- 보안 및 환급 안내 시 인위적인 그래픽 카드 대신, 친절하고 진심 어린 사람의 말투로만 텍스트 답변을 작성하십시오 (cardType: 'none')."
);

flowContent = flowContent.replace(
  /답변 과정에서 화면상에 시각적 카드를 띄워줄 필요가 있는 경우, output의 'richCardPayload' 필드를 작성하십시오:[\s\S]*?3\. \*\*본인인증 가이드 요청 시\*\*/g,
  "답변 과정에서 고객이 PASS/카카오톡/하나은행 인증 가이드를 요청하는 경우에만 cardType: 'guide'를 사용하십시오:\n3. **본인인증 가이드 요청 시**"
);

fs.writeFileSync(managerFlowPath, flowContent, 'utf8');
console.log('Successfully updated manager-chat-flow.ts');
