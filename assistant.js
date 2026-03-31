import { currency, percentage } from "../services/format.js";
import { dashboardContext } from "../services/selectors.js";

export async function mount(ctx) {
  const { state, root } = ctx;
  const summary = dashboardContext(state);
  const budgetPercent = percentage(summary.finance.expenseTotal, summary.finance.monthlyBudget || 1);
  const aiPercent = percentage(summary.ai.used, summary.ai.total || 1);

  root.innerHTML = `
    <section class="metrics-grid" aria-label="Các chỉ số chính">
      <article class="metric">
        <span class="label">Tiết kiệm tháng</span>
        <strong>${currency(summary.finance.savings)}</strong>
      </article>
      <article class="metric">
        <span class="label">Chi tiêu tháng</span>
        <strong>${currency(summary.finance.expenseTotal)}</strong>
      </article>
      <article class="metric">
        <span class="label">Việc hoàn thành</span>
        <strong>${summary.productivity.doneCount}/${summary.productivity.totalTasks}</strong>
      </article>
      <article class="metric">
        <span class="label">Tâm trạng TB</span>
        <strong>${summary.wellness.moodAverage || "—"}/5</strong>
      </article>
    </section>

    <section class="grid-2">
      <article class="card">
        <div class="space-between">
          <div>
            <h3>Lõi tăng trưởng ngắn hạn</h3>
            <p class="small">Đúng với 2 tài liệu bác gửi: nên lấy Finance + Productivity làm mũi khoan trước khi bung 6 module cùng lúc.</p>
          </div>
          <span class="badge">MVP</span>
        </div>
        <div class="kpi-line"><span>Retention engine</span><strong>Pomodoro + ghi chi tiêu hằng ngày</strong></div>
        <div class="kpi-line"><span>Monetization trigger</span><strong>AI insight + cloud sync + báo cáo</strong></div>
        <div class="kpi-line"><span>Upsell path</span><strong>Starter → Pro → AI Credits</strong></div>
      </article>

      <article class="card">
        <h3>Ngân sách tháng</h3>
        <div class="progress-bar" aria-label="Tiến độ sử dụng ngân sách"><span style="width:${budgetPercent}%"></span></div>
        <p class="small">${budgetPercent}% ngân sách đã dùng. Mục tiêu là dưới 80% trước ngày 25 hàng tháng.</p>
        <div class="kpi-line"><span>Ngân sách</span><strong>${currency(summary.finance.monthlyBudget)}</strong></div>
        <div class="kpi-line"><span>Chi tiêu</span><strong>${currency(summary.finance.expenseTotal)}</strong></div>
      </article>

      <article class="card">
        <h3>AI usage</h3>
        <div class="progress-bar" aria-label="Tiến độ dùng AI"><span style="width:${aiPercent}%"></span></div>
        <p class="small">Không cho AI chạy vô hạn. Đây là lớp bảo vệ biên lợi nhuận thực chiến.</p>
        <div class="kpi-line"><span>Đã dùng</span><strong>${summary.ai.used} credits</strong></div>
        <div class="kpi-line"><span>Còn lại</span><strong>${summary.ai.remaining} credits</strong></div>
      </article>

      <article class="card">
        <h3>Top hạng mục chi nhiều</h3>
        ${summary.finance.categoryRows.length ? `
          <div class="sync-list">
            ${summary.finance.categoryRows.slice(0, 4).map((row) => `
              <div class="sync-item">
                <div class="space-between">
                  <strong>${row.category}</strong>
                  <span>${currency(row.total)}</span>
                </div>
                <p class="small">${row.count} giao dịch tháng này</p>
              </div>
            `).join("")}
          </div>` : "<p class='small'>Chưa có dữ liệu chi tiêu tháng này.</p>"}
      </article>
    </section>

    <section class="pricing-grid" aria-label="Các gói doanh thu đề xuất">
      <article class="pricing-card">
        <h3>Starter</h3>
        <p class="small">Miễn phí để hút user vào funnel.</p>
        <strong>0đ</strong>
        <ul>
          <li>Pomodoro, task, habit</li>
          <li>Ghi thu chi thủ công</li>
          <li>BMI + mood check-in</li>
        </ul>
      </article>
      <article class="pricing-card highlight">
        <h3>Pro</h3>
        <p class="small">Tầng dễ bán nhất để tạo MRR.</p>
        <strong>99.000đ/tháng</strong>
        <ul>
          <li>AI insight tài chính</li>
          <li>Đồng bộ đa thiết bị</li>
          <li>Weekly report + push thông minh</li>
        </ul>
      </article>
      <article class="pricing-card">
        <h3>AI Credits</h3>
        <p class="small">Dành cho power users, chống lỗ API.</p>
        <strong>29.000đ/gói</strong>
        <ul>
          <li>Tư vấn sâu theo ngữ cảnh</li>
          <li>Phân tích báo cáo dài</li>
          <li>Xuất plan theo mục tiêu</li>
        </ul>
      </article>
    </section>
  `;
}
