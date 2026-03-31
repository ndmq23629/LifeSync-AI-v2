import { assistantPlan, createCheckout } from "../services/api.js";
import { dashboardContext } from "../services/selectors.js";
import { toast } from "../services/ui.js";

export async function mount(ctx) {
  const { state, root, updateState, refreshChrome } = ctx;
  const messages = state.assistant.messages || [];

  root.innerHTML = `
    <section class="assistant-layout">
      <article class="card">
        <div class="space-between">
          <div>
            <h3>Trợ lý AI điều phối</h3>
            <p class="small">Đây là nơi nối dữ liệu Finance + Productivity + Wellness để tạo cross-sell và tăng retention.</p>
          </div>
          <span class="badge">${state.user.plan || "starter"}</span>
        </div>

        <div class="chat-log" id="chat-log">
          ${messages.map((msg) => `
            <article class="chat-msg ${msg.role}">
              <div class="chat-meta">${msg.role === "user" ? "Bạn" : "AI"} • ${new Date(msg.createdAt).toLocaleString("vi-VN")}</div>
              <div>${escapeHtml(msg.content)}</div>
            </article>
          `).join("")}
        </div>

        <form id="assistant-form">
          <label class="sr-only" for="assistant-input">Câu hỏi cho trợ lý</label>
          <textarea id="assistant-input" name="question" placeholder="Ví dụ: Hãy sắp 3 việc quan trọng nhất hôm nay và cảnh báo giúp nếu chi tiêu đang lệch hướng." required></textarea>
          <div class="form-actions">
            <button class="primary-btn" type="submit">Gửi cho AI</button>
            <button class="ghost-btn" id="assistant-clear" type="button">Xóa hội thoại</button>
          </div>
        </form>
      </article>

      <article class="card">
        <h3>Lớp doanh thu đề xuất</h3>
        <div class="sync-list">
          <div class="sync-item">
            <strong>Starter</strong>
            <p class="small">Cho nhắn ít, dùng heuristic cục bộ hoặc model rẻ.</p>
          </div>
          <div class="sync-item">
            <strong>Pro</strong>
            <p class="small">Cho AI hiểu snapshot đa module, trả insight tuần và đồng bộ đa thiết bị.</p>
          </div>
          <div class="sync-item">
            <strong>Credit</strong>
            <p class="small">Bật phân tích sâu: kế hoạch tháng, báo cáo tài chính, lộ trình cá nhân hóa.</p>
          </div>
        </div>
        <hr />
        <h3>Prompt gợi ý</h3>
        <div class="form-actions">
          <button class="chip-btn assistant-suggest" data-q="Tóm tắt hôm nay và đề xuất 3 việc quan trọng nhất">Tóm tắt hôm nay</button>
          <button class="chip-btn assistant-suggest" data-q="Phân tích chi tiêu tháng này và chỗ nào nên cắt">Phân tích chi tiêu</button>
          <button class="chip-btn assistant-suggest" data-q="Lập kế hoạch 7 ngày để tôi vừa dạy học vừa phát triển web">Plan 7 ngày</button>
        </div>
        <hr />
        <div class="form-actions">
          <button id="upgrade-pro-btn" class="secondary-btn">Mở gói Pro</button>
        </div>
      </article>
    </section>
  `;

  const form = root.querySelector("#assistant-form");
  const textarea = root.querySelector("#assistant-input");

  root.querySelectorAll(".assistant-suggest").forEach((button) => {
    button.addEventListener("click", () => {
      textarea.value = button.dataset.q || "";
      textarea.focus();
    });
  });

  root.querySelector("#assistant-clear")?.addEventListener("click", async () => {
    updateState((draft) => {
      draft.assistant.messages = draft.assistant.messages.filter((msg) => msg.role === "assistant").slice(0, 1);
      return draft;
    });
    refreshChrome();
    await mount({ ...ctx, state: ctx.getState() });
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = textarea.value.trim();
    if (!question) return;

    updateState((draft) => {
      draft.assistant.messages.push({
        id: crypto.randomUUID(),
        role: "user",
        content: question,
        createdAt: new Date().toISOString()
      });
      return draft;
    });
    refreshChrome();
    await mount({ ...ctx, state: ctx.getState() });

    const result = await assistantPlan({
      domain: "general",
      question,
      context: dashboardContext(ctx.getState()),
      plan: ctx.getState().user.plan || "starter"
    });

    updateState((draft) => {
      draft.assistant.messages.push({
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.text,
        createdAt: new Date().toISOString()
      });
      draft.meta.usedAiCredits += Number(result.creditsUsed || 0);
      return draft;
    });

    refreshChrome();
    await mount({ ...ctx, state: ctx.getState() });

    const chatLog = root.querySelector("#chat-log");
    if (chatLog) chatLog.scrollTop = chatLog.scrollHeight;
  });

  root.querySelector("#upgrade-pro-btn")?.addEventListener("click", async () => {
    const priceId = window.LifeSyncConfig?.stripePriceIds?.proMonthly;
    if (!priceId) {
      toast("Chưa cấu hình Stripe priceId. Hãy thêm vào config.js và backend env.");
      return;
    }
    try {
      const result = await createCheckout(priceId);
      if (result?.url) window.location.href = result.url;
    } catch (error) {
      toast(`Không tạo được checkout: ${error.message}`);
    }
  });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
