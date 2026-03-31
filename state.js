import { bmi, bmiLabel, shortDateInput, uid } from "../services/format.js";
import { wellnessSummary } from "../services/selectors.js";
import { toast } from "../services/ui.js";

export async function mount(ctx) {
  const { state, root, updateState, refreshChrome } = ctx;
  const summary = wellnessSummary(state);
  const bmiScore = bmi(state.wellness.metrics.heightCm, state.wellness.metrics.weightKg);

  root.innerHTML = `
    <section class="wellness-grid">
      <article class="card">
        <h3>Chỉ số cơ bản</h3>
        <form id="metric-form">
          <label>Chiều cao (cm) <input name="heightCm" type="number" min="100" max="250" value="${state.wellness.metrics.heightCm}" /></label>
          <label>Cân nặng (kg) <input name="weightKg" type="number" min="20" max="300" value="${state.wellness.metrics.weightKg}" /></label>
          <label>Nước hôm nay (ml) <input name="waterMlToday" type="number" min="0" step="100" value="${state.wellness.metrics.waterMlToday}" /></label>
          <div class="form-actions">
            <button class="primary-btn" type="submit">Cập nhật</button>
          </div>
        </form>
        <hr />
        <div class="kpi-line"><span>BMI</span><strong>${bmiScore} — ${bmiLabel(bmiScore)}</strong></div>
        <div class="kpi-line"><span>Tâm trạng TB</span><strong>${summary.moodAverage || "—"}/5</strong></div>
        <div class="kpi-line"><span>Nước hôm nay</span><strong>${summary.waterMlToday} ml</strong></div>
      </article>

      <article class="card">
        <h3>Check-in tâm trạng</h3>
        <form id="mood-form">
          <label>Mức tâm trạng (1-5)
            <select name="mood">
              <option value="1">1 - Rất tệ</option>
              <option value="2">2 - Không ổn</option>
              <option value="3" selected>3 - Bình thường</option>
              <option value="4">4 - Khá ổn</option>
              <option value="5">5 - Rất tốt</option>
            </select>
          </label>
          <label>Ghi chú
            <textarea name="note" placeholder="Ví dụ: áp lực deadline nhưng vẫn kiểm soát được"></textarea>
          </label>
          <div class="form-actions">
            <button class="primary-btn" type="submit">Lưu check-in</button>
          </div>
        </form>
        <p class="small">Mind Care là phân hệ cần cực kỳ thận trọng. Bản này chỉ dùng như self-tracking, không thay chuyên gia.</p>
      </article>
    </section>

    <section class="grid-2">
      <article class="list-card">
        <h3>Nhật ký ngắn</h3>
        <form id="journal-form">
          <label>Ghi lại nhanh
            <textarea name="entry" placeholder="Ghi 1 ý quan trọng về sức khỏe hoặc tinh thần"></textarea>
          </label>
          <div class="form-actions">
            <button class="secondary-btn" type="submit">Thêm vào journal</button>
          </div>
        </form>
        <div class="journal-list">
          ${state.wellness.journal.map((item) => `
            <div class="journal-item">
              <p>${item.entry}</p>
              <span class="small">${new Date(item.createdAt).toLocaleString("vi-VN")}</span>
            </div>
          `).join("")}
        </div>
      </article>

      <article class="list-card">
        <h3>Lịch sử mood</h3>
        <div class="sync-list">
          ${state.wellness.moods.slice().reverse().map((item) => `
            <div class="sync-item">
              <div class="space-between">
                <strong>${item.mood}/5</strong>
                <span class="small">${new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <p class="small">${item.note || "—"}</p>
            </div>
          `).join("")}
        </div>
      </article>
    </section>
  `;

  root.querySelector("#metric-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updateState((draft) => {
      draft.wellness.metrics.heightCm = Number(form.get("heightCm"));
      draft.wellness.metrics.weightKg = Number(form.get("weightKg"));
      draft.wellness.metrics.waterMlToday = Number(form.get("waterMlToday"));
      return draft;
    });
    toast("Đã cập nhật chỉ số cơ bản.");
    refreshChrome();
    await mount({ ...ctx, state: ctx.getState() });
  });

  root.querySelector("#mood-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updateState((draft) => {
      draft.wellness.moods.push({
        id: uid(),
        mood: Number(form.get("mood")),
        note: String(form.get("note") || ""),
        createdAt: new Date().toISOString()
      });
      return draft;
    });
    toast("Đã lưu check-in.");
    refreshChrome();
    await mount({ ...ctx, state: ctx.getState() });
  });

  root.querySelector("#journal-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updateState((draft) => {
      if (String(form.get("entry") || "").trim()) {
        draft.wellness.journal.unshift({
          id: uid(),
          entry: String(form.get("entry")),
          createdAt: new Date().toISOString()
        });
      }
      return draft;
    });
    toast("Đã thêm journal.");
    refreshChrome();
    await mount({ ...ctx, state: ctx.getState() });
  });
}
