import { env, hasAi } from "./env.js";

export function selectModel({ plan = "starter", question = "", domain = "general" }) {
  const longQuestion = question.length > 280;
  const premiumDomain = ["finance", "general"].includes(domain) && longQuestion;
  const useSmart = plan !== "starter" || premiumDomain;
  return {
    model: useSmart ? env.aiModelSmart : env.aiModelCheap,
    creditsUsed: useSmart ? 3 : 1
  };
}

export async function generateAdvice({ question, context, plan, domain }) {
  if (!hasAi()) {
    return {
      text: buildFallback({ question, context }),
      model: "local-fallback",
      creditsUsed: 0
    };
  }

  const { model, creditsUsed } = selectModel({ plan, question, domain });
  const system = `Bạn là trợ lý điều phối cho LifeSync AI.
- Ưu tiên hiệu quả kinh tế, hành động rõ, không lan man.
- Nếu dữ liệu chưa đủ, phải nói thẳng dữ liệu thiếu.
- Chỉ đưa 3-5 hành động ưu tiên.
- Phải tách phần: "Nhận định", "Việc làm ngay", "Cơ hội nâng cấp".
- Không được khuyên về y khoa chuyên sâu hoặc chẩn đoán tâm lý.`;

  const response = await fetch(`${env.openAiCompatBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openAiApiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: JSON.stringify({
            question,
            plan,
            domain,
            context
          })
        }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI provider error: ${text}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  return {
    text: text || buildFallback({ question, context }),
    model,
    creditsUsed
  };
}

function buildFallback({ question, context }) {
  const finance = context?.finance || {};
  const productivity = context?.productivity || {};
  const items = [];

  if ((finance.expenseTotal || 0) > (finance.monthlyBudget || 0) * 0.8) {
    items.push("Nhận định: chi tiêu đã chạm vùng đỏ của ngân sách tháng.");
  } else {
    items.push("Nhận định: dữ liệu chi tiêu chưa quá xấu, nhưng cần theo dõi đều mỗi ngày.");
  }

  if ((productivity.overdueCount || 0) > 0) {
    items.push("Việc làm ngay: đóng 1 việc quá hạn trong 25 phút đầu tiên hôm nay.");
  } else {
    items.push("Việc làm ngay: chốt 3 việc quan trọng nhất trước khi mở thêm việc mới.");
  }

  items.push("Cơ hội nâng cấp: mở cloud sync + AI insight để xem báo cáo tuần và nhắc nhở theo ngữ cảnh.");
  items.push(`Gợi ý theo câu hỏi: ${question}`);
  return items.join(" ");
}
