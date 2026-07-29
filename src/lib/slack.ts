import axios from 'axios';

interface TakeoverAlertParams {
  chatId: string;
  channel: string;
  userName?: string;
  detectedLanguage?: string;
  cumulativeNeg: number;
  summary?: string;
  lastMessage?: string;
}

/**
 * Sends a notification to Slack when a chat requires direct admin intervention
 */
export async function sendTakeoverAlert({
  chatId,
  channel,
  userName = 'Unknown User',
  detectedLanguage = 'ko',
  cumulativeNeg,
  summary = '이전 요약 기록 없음',
  lastMessage = '',
}: TakeoverAlertParams): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[Slack Alert] SLACK_WEBHOOK_URL is not configured in environment variables.');
    return false;
  }

  // App or admin dashboard base URL
  const adminBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ktrs-service.vercel.app';
  const chatLink = `${adminBaseUrl}/admin?view=dashboard&chatId=${chatId}`;

  const langFlagMap: Record<string, string> = {
    vi: '🇻🇳 베트남어',
    zh: '🇨🇳 중국어',
    th: '🇹🇭 태국어',
    id: '🇮🇩 인도네시아어',
    en: '🇵🇭 영어',
    uz: '🇺🇿 우즈베크어',
    my: '🇲🇲 미얀마어',
    km: '🇰🇭 캄보디아어',
    mn: '🇲🇳 몽골어',
    ne: '🇳🇵 네팔어',
    si: '🇱🇰 스리랑카어',
    bn: '🇧🇩 벵골어',
    kk: '🇰🇿 카자흐어',
    ur: '🇵🇰 우르두어',
    ko: '🇰🇷 한국어',
  };

  const languageText = langFlagMap[detectedLanguage] || `🌐 ${detectedLanguage}`;

  const slackPayload = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 [긴급] 관리자 직접 개입(Takeover) 알림',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*고객명*: ${userName}\n*상담 채널*: \`${channel.toUpperCase()}\`\n*사용 언어*: ${languageText}\n*누적 부정 지수*: \`${cumulativeNeg}점\``,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*고객 마지막 메시지*:\n> ${lastMessage || '메시지 텍스트 없음'}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*상담 요약*:\n> ${summary}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '👉 실시간 상담방 바로가기',
              emoji: true,
            },
            style: 'primary',
            url: chatLink,
          },
        ],
      },
    ],
  };

  try {
    const res = await axios.post(webhookUrl, slackPayload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.status === 200;
  } catch (error: any) {
    console.error('[Slack Alert Error] Failed to send webhook alert:', error?.response?.data || error.message);
    return false;
  }
}
