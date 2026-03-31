# Hướng dẫn chạy trên GitHub Copilot / VS Code

## A. Chuẩn bị repo
1. Tạo repo mới trên GitHub
2. Chép toàn bộ bộ mã này vào repo
3. Push lên `main`

## B. Chạy frontend
### Cách nhanh nhất
- Mở repo bằng VS Code
- cài extension **Live Server**
- mở `docs/index.html`
- bấm **Go Live**

### Khi muốn đưa lên GitHub Pages
- Vào repo -> Settings -> Pages
- Chọn **GitHub Actions**
- Push lên `main`
- workflow `.github/workflows/deploy-pages.yml` sẽ đẩy thư mục `docs/`

## C. Chạy backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend mặc định chạy ở:
```text
http://localhost:8787
```

## D. Nối frontend với backend
Mở `docs/src/config.js`, sửa:

```js
window.LifeSyncConfig = {
  appName: "LifeSync AI",
  apiBaseUrl: "http://localhost:8787",
  vapidPublicKey: "",
  supabaseUrl: "",
  supabaseAnonKey: "",
  stripePriceIds: {
    proMonthly: "",
    proYearly: ""
  },
  demoUser: {
    id: "demo-user",
    name: "Demo User",
    email: "demo@lifesync.local",
    plan: "starter"
  }
};
```

## E. Cấu hình Supabase
1. Tạo project trên Supabase
2. Mở SQL Editor
3. Chạy file `supabase/schema.sql`
4. Lấy:
   - Project URL
   - anon key
   - service role key

### Gắn vào frontend
- `docs/src/config.js`
  - `supabaseUrl`
  - `supabaseAnonKey`

### Gắn vào backend
- `backend/.env`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## F. Stripe
1. Tạo sản phẩm và price trong Stripe
2. Gắn:
   - `STRIPE_SECRET_KEY` vào `backend/.env`
   - `proMonthly` vào `docs/src/config.js`
3. Sửa:
   - `STRIPE_SUCCESS_URL`
   - `STRIPE_CANCEL_URL`

## G. Push notifications
1. Tạo VAPID key pair
2. Gắn:
   - `VAPID_PUBLIC_KEY` vào frontend config
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` vào backend `.env`

## H. Prompt cho GitHub Copilot
Dán prompt này vào Copilot Chat khi bác muốn nó tiếp tục nâng cấp:

> Hãy nâng cấp LifeSync AI theo kiến trúc local-first PWA + Supabase + Node backend hiện có. Không phá vỡ cấu trúc file. Ưu tiên: 1) thêm recurring budgets, 2) weekly AI report, 3) OCR hóa đơn, 4) calendar sync, 5) analytics funnel Free -> Pro. Mọi thay đổi phải giữ semantic HTML, support offline, và không để AI gọi backend vô hạn.

## I. Checklist debug
- Frontend không gọi được backend -> kiểm tra `apiBaseUrl`
- Push không hoạt động -> kiểm tra HTTPS + service worker + VAPID
- Sync lỗi -> kiểm tra CORS và Supabase service role key
- Auth lỗi -> kiểm tra Supabase URL, anon key, confirm email
