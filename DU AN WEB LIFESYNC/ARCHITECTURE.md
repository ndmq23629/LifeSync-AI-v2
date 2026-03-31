# Kiến trúc đề xuất cho LifeSync AI

## 1. Vì sao không tiếp tục kiểu web cũ
Bản cũ có vấn đề:
- landing page nói “100% miễn phí”
- nhiều module nhưng chưa có lõi retention mạnh
- chưa có local-first + offline queue + PWA install
- chưa có backend tách riêng để kiểm soát AI cost

## 2. Kiến trúc mới
### Frontend
- Thư mục: `docs/`
- Công nghệ: HTML + CSS + Vanilla JS modules
- Shell app + lazy-loaded modules:
  - dashboard
  - finance
  - productivity
  - wellness
  - assistant
  - settings

### Offline first
- State lưu trong `localStorage`
- Outbox lưu trong `IndexedDB`
- Service worker cache shell + replay outbox khi có mạng

### Backend
- Node/Express
- Route:
  - `POST /api/sync`
  - `POST /api/assistant`
  - `POST /api/push-subscribe`
  - `POST /api/create-checkout`
  - `GET /api/health`

### Cloud
- Supabase:
  - Auth
  - Postgres
  - RLS
  - snapshot / push subscription / usage events

## 3. Nguyên tắc kinh tế
- Free: local tools không tốn AI
- Pro: insight + sync + weekly report
- Credits: AI sâu / báo cáo dài / phân tích phức tạp

## 4. Tại sao local-first quan trọng
- người dùng dùng được ngay
- giảm ma sát onboarding
- backend lỗi vẫn không làm app chết
- hỗ trợ trải nghiệm kém mạng

## 5. Lộ trình mở rộng
### Phase 1
- Finance
- Productivity
- Assistant basic
- Settings / export / sync

### Phase 2
- Push contextual nudges
- recurring budgets
- weekly reports
- subscription + Stripe live

### Phase 3
- Health integrations
- OCR hóa đơn
- calendar sync
- multi-agent orchestration
