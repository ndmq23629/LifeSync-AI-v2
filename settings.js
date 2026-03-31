import { syncSnapshot, assistantPlan } from "../services/api.js";
import { currency, dateOnly, shortDateInput, uid } from "../services/format.js";
import { financeSummary, dashboardContext } from "../services/selectors.js";
import { toast } from "../services/ui.js";

export async function mount(ctx) {
  const { state, root, updateState, refreshChrome } = ctx;
  const summary = financeSummary(state);

  root.innerHTML = `
    <section class="finance-layout">
      <article class="card">
        <h3>Thêm giao dịch</h3>
        <form id="finance-form">
          <label>
            Loại
            <select name="type" required>
              <option value="expense">Chi tiêu</option>
              <option value="income">Thu nhập</option>
            </select>
          </label>
          <label>
            Số tiền
            <input name="amount" type="number" min="0" step="1000" required placeholder="Ví dụ: 120000" />
          </label>
          <label>
            Danh mục
            <select name="category" required>
              <option>Ăn uống</option>
              <option>Di chuyển</option>
              <option>Học tập</option>
              <option>Mua sắm</option>
              <option>Sức khỏe</option>
              <option>Nhà ở</option>
              <option>Lương</option>
              <option>Thưởng</option>
              <option>Khác</option>
            </select>
          </label>
          <label>
            Ghi chú
            <textarea name="note" placeholder="Ghi nhanh lý do chi hoặc nguồn thu"></textarea>
          </label>
          <label>
            Ngày
            <input name="createdAt" type="date" required value="${shortDateInput(new Date())}" />
          </label>
          <div class="form-actions">
            <button class="primary-btn" type="submit">Lưu giao dịch</button>
            <button class="ghost-btn" type="button" id="finance-ai-btn">AI phân tích nhanh</button>
          </div>
          <p class="inline-help">Ở bản kiếm tiền, nút AI sẽ là điểm upsell sang gói Pro.</p>
        </form>
      </article>

      <div class="grid-2">
        <article class="card">
          <h3>Tóm tắt tháng này</h3>
          <div class="kpi-line"><span>Thu nhập</span><strong>${currency(summary.incomeTotal)}</strong></div>
          <div class="kpi-line"><span>Chi tiêu</span><strong>${currency(summary.expenseTotal)}</strong></div>
          <div class="kpi-line"><span>Tiết kiệm</span><strong>${currency(summary.savings)}</strong></div>
          <div class="kpi-line"><span>Ngân sách</span><strong>${currency(summary.monthlyBudget)}</strong></div>
        </article>

        <article class="card">
          <h3>Gợi ý vận hành</h3>
          <div class="sync-list">
            <div class="sync-item">
              <strong>Rule #1</strong>
              <p class="small">Dữ liệu chi tiêu phải được nhập dễ trong 10 giây, nếu không retention rơi rất nhanh.</p>
            </div>
            <div class="sync-item">
              <strong>Rule #2</strong>
              <p class="small">Insight AI chỉ mở khi user đã có ít nhất 5-10 giao dịch đầu tiên.</p>
            </div>
            <div class="sync-item">
              <strong>Rule #3</strong>
              <p class="small">Cloud sync và export báo cáo nên là tính năng trả phí, không để miễn phí toàn bộ.</p>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="card">
      <div class="space-between">
        <div>
          <h3>Lịch sử giao dịch</h3>
          <p class="small">Mỗi hàng đều là dữ liệu gốc cho AI Finance, dashboard và báo cáo.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Loại</th>
              <th>Danh mục</th>
              <th>Ghi chú</th>
              <th>Số tiền</th>
              <th>Xóa</th>
            </tr>
          </thead>
          <tbody>
            ${state.finance.transactions.slice().sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).map((item) => `
              <tr>
                <td>${dateOnly(item.createdAt)}</td>
                <td>${item.type === "income" ? "Thu nhập" : "Chi tiêu"}</td>
                <td>${item.category}</td>
                <td>${item.note || "—"}</td>
                <td>${currency(item.amount)}</td>
                <td><button class="ghost-btn finance-delete" data-id="${item.id}">Xóa</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="grid-2">
      <article class="card">
        <h3>Chi tiêu theo hạng mục</h3>
        <div class="sync-list">
          ${summary.categoryRows.length ? summary.categoryRows.map((row) => `
            <div class="sync-item">
              <div class="space-between">
                <strong>${row.category}</strong>
                <span>${currency(row.total)}</span>
              </div>
              <p class="small">${row.count} giao dịch</p>
            </div>
          `).join("") : "<p class='small'>Chưa có dữ liệu.</p>"}
        </div>
      </article>

      <article class="card">
        <h3>Đồng bộ cloud</h3>
        <p class="small">Lưu ý: bản code này local-first. Bác có thể dùng ngay. Khi gắn cloud, nút đồng bộ sẽ đẩy snapshot lên backend để đa thiết bị hoạt động.</p>
        <div class="form-actions">
          <button id="finance-sync-btn" class="secondary-btn">Đồng bộ snapshot</button>
        </div>
      </article>
    </section>
  `;

  root.querySelector("#finance-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updateState((draft) => {
      draft.finance.transactions.push({
        id: uid(),
        type: form.get("type"),
        amount: Number(form.get("amount")),
        category: String(form.get("category")),
        note: String(form.get("note") || "").trim(),
        createdAt: new Date(String(form.get("createdAt"))).toISOString()
      });
      return draft;
    });
    toast("Đã lưu giao dịch.");
    refreshChrome();
    await mount({ ...ctx, state: ctx.getState() });
  });

  root.querySelectorAll(".finance-delete").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      updateState((draft) => {
        draft.finance.transactions = draft.finance.transactions.filter((item) => item.id !== id);
        return draft;
      });
      toast("Đã xóa giao dịch.");
      refreshChrome();
      await mount({ ...ctx, state: ctx.getState() });
    });
  });

  root.querySelector("#finance-ai-btn")?.addEventListener("click", async () => {
    const stateNow = ctx.getState();
    const summaryNow = financeSummary(stateNow);
    const result = await assistantPlan({
      domain: "finance",
      question: "Phân tích nhanh chi tiêu tháng này và gợi ý 3 hành động ưu tiên.",
      context: {
        ...dashboardContext(stateNow),
        finance: summaryNow
      }
    });
    toast(result.text);
  });

  root.querySelector("#finance-sync-btn")?.addEventListener("click", async () => {
    const result = await syncSnapshot(ctx.getState());
    if (result?.queued) toast("Mất mạng hoặc backend lỗi. Đã đưa vào hàng chờ offline.");
    else if (result?.localOnly) toast("Đang chạy local-only. Hãy cấu hình backend để sync.");
    else toast("Đồng bộ snapshot thành công.");
    refreshChrome();
  });
}
