import { shortDateInput, uid } from "../services/format.js";
import { productivitySummary } from "../services/selectors.js";
import { toast } from "../services/ui.js";

let timerRef = null;

export async function mount(ctx) {
  const { state, root, updateState, refreshChrome } = ctx;
  const summary = productivitySummary(state);
  const pomodoro = state.productivity.pomodoro;

  root.innerHTML = `
    <section class="productivity-grid">
      <article class="card">
        <h3>Pomodoro engine</h3>
        <div class="timer">
          <div class="timer-clock" id="pomodoro-clock">${formatSeconds(pomodoro.remaining)}</div>
          <p class="small">Session #${pomodoro.sessionCount}. Đây là lõi tạo thói quen quay lại hằng ngày.</p>
          <div class="form-actions">
            <button id="pomodoro-toggle" class="primary-btn">${pomodoro.running ? "Tạm dừng" : "Bắt đầu"}</button>
            <button id="pomodoro-reset" class="ghost-btn">Reset</button>
          </div>
        </div>
        <hr />
        <div class="kpi-line"><span>Focus score</span><strong>${summary.focusScore}/100</strong></div>
        <div class="kpi-line"><span>Việc mở</span><strong>${summary.openCount}</strong></div>
        <div class="kpi-line"><span>Quá hạn</span><strong>${summary.overdueCount}</strong></div>
      </article>

      <article class="card">
        <h3>Thêm công việc</h3>
        <form id="task-form">
          <label>Tên công việc <input name="title" required placeholder="Ví dụ: Chốt outline landing page" /></label>
          <label>Độ ưu tiên
            <select name="priority">
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
          </label>
          <label>Deadline <input name="deadline" type="date" required value="${shortDateInput(new Date())}" /></label>
          <div class="form-actions">
            <button class="primary-btn" type="submit">Thêm việc</button>
          </div>
        </form>
      </article>
    </section>

    <section class="grid-2">
      <article class="list-card">
        <div class="space-between">
          <div>
            <h3>Công việc</h3>
            <p class="small">Task list này là lớp dữ liệu giá trị cao để bán gói báo cáo tuần + AI planning.</p>
          </div>
        </div>
        <div class="todo-list">
          ${state.productivity.tasks.map((task) => `
            <div class="todo-item ${task.done ? "done" : ""}">
              <div class="todo-head">
                <div>
                  <strong>${task.title}</strong>
                  <p class="small">Hạn: ${new Date(task.deadline).toLocaleDateString("vi-VN")}</p>
                </div>
                <span class="badge is-${task.priority}">${labelPriority(task.priority)}</span>
              </div>
              <div class="form-actions">
                <button class="secondary-btn task-toggle" data-id="${task.id}">
                  ${task.done ? "Đánh dấu chưa xong" : "Đánh dấu hoàn thành"}
                </button>
                <button class="ghost-btn task-delete" data-id="${task.id}">Xóa</button>
              </div>
            </div>
          `).join("")}
        </div>
      </article>

      <article class="list-card">
        <div class="space-between">
          <div>
            <h3>Thói quen</h3>
            <p class="small">Habit loop càng mạnh, LTV càng có cơ hội tăng.</p>
          </div>
        </div>
        <div class="habit-list">
          ${state.productivity.habits.map((habit) => `
            <div class="habit-item">
              <div class="space-between">
                <strong>${habit.icon} ${habit.title}</strong>
                <span>${habit.streak} ngày</span>
              </div>
            </div>
          `).join("")}
        </div>
        <form id="habit-form">
          <label>Tên thói quen <input name="title" required placeholder="Ví dụ: review chi tiêu 5 phút" /></label>
          <label>Icon <input name="icon" value="✨" maxlength="2" /></label>
          <div class="form-actions">
            <button class="primary-btn" type="submit">Thêm thói quen</button>
          </div>
        </form>
      </article>
    </section>
  `;

  bindPomodoro(ctx);
  bindForms(ctx);
  bindTaskActions(ctx);
}

function bindForms(ctx) {
  const { root, updateState, refreshChrome } = ctx;
  root.querySelector("#task-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updateState((draft) => {
      draft.productivity.tasks.unshift({
        id: uid(),
        title: String(form.get("title")),
        priority: String(form.get("priority")),
        deadline: new Date(String(form.get("deadline"))).toISOString(),
        done: false
      });
      return draft;
    });
    toast("Đã thêm công việc.");
    refreshChrome();
    await mount({ ...ctx, state: ctx.getState() });
  });

  root.querySelector("#habit-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updateState((draft) => {
      draft.productivity.habits.unshift({
        id: uid(),
        title: String(form.get("title")),
        icon: String(form.get("icon") || "✨"),
        streak: 0
      });
      return draft;
    });
    toast("Đã thêm thói quen.");
    refreshChrome();
    await mount({ ...ctx, state: ctx.getState() });
  });
}

function bindTaskActions(ctx) {
  const { root, updateState, refreshChrome } = ctx;
  root.querySelectorAll(".task-toggle").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      updateState((draft) => {
        const task = draft.productivity.tasks.find((item) => item.id === id);
        if (task) task.done = !task.done;
        return draft;
      });
      refreshChrome();
      await mount({ ...ctx, state: ctx.getState() });
    });
  });

  root.querySelectorAll(".task-delete").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      updateState((draft) => {
        draft.productivity.tasks = draft.productivity.tasks.filter((item) => item.id !== id);
        return draft;
      });
      toast("Đã xóa việc.");
      refreshChrome();
      await mount({ ...ctx, state: ctx.getState() });
    });
  });
}

function bindPomodoro(ctx) {
  const { root, updateState, refreshChrome } = ctx;

  const rerenderClock = () => {
    const state = ctx.getState();
    const clock = root.querySelector("#pomodoro-clock");
    if (clock) clock.textContent = formatSeconds(state.productivity.pomodoro.remaining);
  };

  root.querySelector("#pomodoro-toggle")?.addEventListener("click", async () => {
    const stateNow = ctx.getState();
    const running = stateNow.productivity.pomodoro.running;
    if (running) {
      clearInterval(timerRef);
      timerRef = null;
      updateState((draft) => {
        draft.productivity.pomodoro.running = false;
        return draft;
      });
    } else {
      updateState((draft) => {
        draft.productivity.pomodoro.running = true;
        draft.productivity.pomodoro.lastStartedAt = new Date().toISOString();
        return draft;
      });
      timerRef = setInterval(() => {
        updateState((draft) => {
          if (!draft.productivity.pomodoro.running) return draft;
          draft.productivity.pomodoro.remaining = Math.max(0, draft.productivity.pomodoro.remaining - 1);
          if (draft.productivity.pomodoro.remaining === 0) {
            draft.productivity.pomodoro.running = false;
            draft.productivity.pomodoro.remaining = draft.productivity.pomodoro.duration;
            draft.productivity.pomodoro.sessionCount += 1;
            clearInterval(timerRef);
            timerRef = null;
            toast("Hoàn thành 1 Pomodoro. Đây là lúc nhắc user quay lại vào ngày mai.");
          }
          return draft;
        });
        rerenderClock();
        refreshChrome();
      }, 1000);
    }
    refreshChrome();
    await mount({ ...ctx, state: ctx.getState() });
  });

  root.querySelector("#pomodoro-reset")?.addEventListener("click", async () => {
    clearInterval(timerRef);
    timerRef = null;
    updateState((draft) => {
      draft.productivity.pomodoro.running = false;
      draft.productivity.pomodoro.remaining = draft.productivity.pomodoro.duration;
      return draft;
    });
    refreshChrome();
    await mount({ ...ctx, state: ctx.getState() });
  });
}

function labelPriority(priority) {
  if (priority === "high") return "Cao";
  if (priority === "medium") return "TB";
  return "Thấp";
}

function formatSeconds(total) {
  const minutes = String(Math.floor(total / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
