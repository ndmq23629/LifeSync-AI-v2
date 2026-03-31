import { exportState, importState, resetState } from "../services/state.js";
import { flushOutbox, subscribePush } from "../services/api.js";
import { getSupabaseClient, getUserSession, signInWithPassword, signUpWithPassword, signOut } from "../services/cloud.js";
import { readOutbox } from "../services/idb.js";
import { toast, confirmDanger } from "../services/ui.js";

export async function mount(ctx) {
  const { state, root, updateState, refreshChrome } = ctx;
  const session = await getUserSession();
  const outbox = await readOutbox();

  root.innerHTML = `
    <section class="settings-layout">
      <article class="card">
        <h3>Tài khoản & cloud</h3>
        <p class="small">Không cấu hình Supabase vẫn chạy. Khi muốn đa thiết bị thật sự, bật Supabase + backend.</p>
        <div class="kpi-line"><span>Session</span><strong>${session?.user?.email || "Chưa đăng nhập cloud"}</strong></div>
        <div class="kpi-line"><span>Outbox offline</span><strong>${outbox.length} mục</strong></div>

        <form id="signin-form">
          <label>Email <input name="email" type="email" placeholder="you@example.com" /></label>
          <label>Mật khẩu <input name="password" type="password" placeholder="••••••••" /></label>
          <label>Họ tên (chỉ dùng khi đăng ký) <input name="fullName" placeholder="Nguyễn Văn A" /></label>
          <div class="form-actions">
            <button class="primary-btn" type="button" id="sign-in-btn">Đăng nhập cloud</button>
            <button class="secondary-btn" type="button" id="sign-up-btn">Tạo tài khoản</button>
            <button class="ghost-btn" type="button" id="sign-out-btn">Đăng xuất</button>
          </div>
        </form>
      </article>

      <article class="card">
        <h3>Xuất / nhập dữ liệu</h3>
        <p class="small">Vì local-first, xuất dữ liệu JSON là đường lui rất quan trọng.</p>
        <div class="form-actions">
          <button id="export-btn" class="secondary-btn">Xuất JSON</button>
          <button id="import-btn" class="secondary-btn">Nhập JSON</button>
          <button id="reset-btn" class="ghost-btn">Reset demo data</button>
          <input id="import-file" type="file" accept="application/json" hidden />
        </div>
        <hr />
        <h3>Offline queue</h3>
        <div class="sync-list">
          ${outbox.length ? outbox.map((item) => `
            <div class="sync-item">
              <div class="space-between">
                <strong>${item.method} ${item.path}</strong>
                <span class="small">${new Date(item.createdAt).toLocaleString("vi-VN")}</span>
              </div>
            </div>
          `).join("") : "<p class='small'>Chưa có yêu cầu nào đang chờ.</p>"}
        </div>
        <div class="form-actions">
          <button id="flush-outbox-btn" class="primary-btn">Flush queue ngay</button>
        </div>
      </article>
    </section>

    <section class="grid-2">
      <article class="card">
        <h3>Thông báo đẩy</h3>
        <p class="small">Chỉ nên gửi push như nudge đúng ngữ cảnh, không spam.</p>
        <div class="form-actions">
          <button id="subscribe-push-btn" class="secondary-btn">Đăng ký push</button>
        </div>
      </article>

      <article class="card">
        <h3>Checklist production</h3>
        <ul class="compact-list">
          <li>RLS bật cho toàn bộ bảng dữ liệu người dùng</li>
          <li>JWT/Supabase Auth chạy đúng trên frontend và backend</li>
          <li>Rate limit cho AI + push + checkout</li>
          <li>Không để service role key lộ ra frontend</li>
          <li>Kiểm tra lại scope của service worker trên GitHub Pages</li>
        </ul>
      </article>
    </section>
  `;

  root.querySelector("#export-btn")?.addEventListener("click", () => {
    const blob = new Blob([exportState()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lifesyncai-export.json";
    link.click();
    URL.revokeObjectURL(url);
  });

  root.querySelector("#import-btn")?.addEventListener("click", () => {
    root.querySelector("#import-file")?.click();
  });

  root.querySelector("#import-file")?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    importState(text);
    toast("Đã nhập dữ liệu.");
    refreshChrome();
    await mount({ ...ctx, state: ctx.getState() });
  });

  root.querySelector("#reset-btn")?.addEventListener("click", async () => {
    if (!confirmDanger("Reset toàn bộ dữ liệu demo hiện tại?")) return;
    resetState();
    toast("Đã reset dữ liệu demo.");
    refreshChrome();
    await mount({ ...ctx, state: ctx.getState() });
  });

  root.querySelector("#flush-outbox-btn")?.addEventListener("click", async () => {
    const result = await flushOutbox();
    toast(`Đã gửi ${result.sent} yêu cầu. Còn ${result.pending} mục.`);
    refreshChrome();
    await mount({ ...ctx, state: ctx.getState() });
  });

  root.querySelector("#sign-in-btn")?.addEventListener("click", async () => {
    const form = formData(root);
    try {
      await signInWithPassword(form.email, form.password);
      toast("Đăng nhập cloud thành công.");
      refreshChrome();
      await mount({ ...ctx, state: ctx.getState() });
    } catch (error) {
      toast(`Đăng nhập lỗi: ${error.message}`);
    }
  });

  root.querySelector("#sign-up-btn")?.addEventListener("click", async () => {
    const form = formData(root);
    try {
      await signUpWithPassword(form.email, form.password, form.fullName);
      toast("Đã tạo tài khoản. Kiểm tra email xác thực nếu Supabase bật confirm email.");
    } catch (error) {
      toast(`Đăng ký lỗi: ${error.message}`);
    }
  });

  root.querySelector("#sign-out-btn")?.addEventListener("click", async () => {
    await signOut();
    toast("Đã đăng xuất cloud.");
    refreshChrome();
    await mount({ ...ctx, state: ctx.getState() });
  });

  root.querySelector("#subscribe-push-btn")?.addEventListener("click", async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast("Người dùng chưa cấp quyền thông báo.");
        return;
      }
      const publicKey = window.LifeSyncConfig?.vapidPublicKey;
      if (!publicKey) {
        toast("Chưa có VAPID public key trong config.");
        return;
      }
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(publicKey)
      });
      await subscribePush(subscription);
      updateState((draft) => {
        draft.settings.notificationsEnabled = true;
        return draft;
      });
      toast("Đã đăng ký push.");
      refreshChrome();
    } catch (error) {
      toast(`Đăng ký push lỗi: ${error.message}`);
    }
  });
}

function formData(root) {
  return {
    email: root.querySelector('input[name="email"]')?.value?.trim() || "",
    password: root.querySelector('input[name="password"]')?.value || "",
    fullName: root.querySelector('input[name="fullName"]')?.value?.trim() || ""
  };
}

function base64ToUint8Array(base64) {
  const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
  const base64Safe = padded.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Safe);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}
