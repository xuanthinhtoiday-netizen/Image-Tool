# Lumina AI — Imagine & AI Image Creation Studio

Ứng dụng web tạo ảnh AI phong cách **Meta AI (`meta.ai`)** với giao diện 3 cột hiện đại (hỗ trợ cả **Dark Mode Obsidian** & **Light Mode**), tạo ảnh dạng hội thoại, tự động xóa logo góc ảnh và hỗ trợ đa nhà cung cấp AI (miễn phí lẫn API Key cá nhân).

🌐 **Live Demo (GitHub Pages):** https://xuanthinhtoiday-netizen.github.io/Image-Tool/

## Tính năng nổi bật

- **Giao diện phong cách Meta AI (`meta.ai`)**:
  - Thanh điều hướng trái thu gọn/mở rộng kèm biểu tượng **Halo Ring phát sáng** và **Lịch sử phiên sáng tạo** (lưu bền vững bằng IndexedDB).
  - Thanh **Omnibox nổi** tích hợp chọn nhanh Nguồn AI, Model, Tỉ lệ khung hình, 12 Phong cách, Số lượng ảnh, Negative Prompt, Seed và đính kèm/dán ảnh (`Ctrl+V`).
  - Luồng tạo ảnh dạng hội thoại (**Conversational Imagine**) kèm **5 chip chỉnh sửa nhanh 1 chạm** dưới mỗi ảnh.
  - Trang **Khám phá (Discover)** với 8 danh mục ý tưởng & **Bảng Inspector bên phải** xem chi tiết, chỉnh sửa tiếp, Remix, tải ảnh gốc và phóng to toàn màn hình.
  - Chuyển đổi tức thì giữa **Giao diện Tối** và **Giao diện Sáng**.
- **Tự động xóa logo góc ảnh (Client-side Canvas)**:
  - **Inpaint thông minh (Mặc định):** Hòa trộn texture lân cận theo trọng số khoảng cách để làm sạch watermark mà vẫn giữ 100% khung hình.
  - **Cắt mép siêu nét:** Cắt gọn viền dưới và căn chỉnh giữ nguyên tỉ lệ gốc.
  - Hỗ trợ bật/tắt 1 chạm trong Omnibox và xóa thủ công cho ảnh cũ trong bảng Chi tiết.
- **2 nguồn AI Miễn phí chạy ngay (không cần API Key)**:
  - **Pollinations FLUX (Miễn phí)**: `FLUX.1 Classic`, `FLUX Turbo`.
  - **AI Horde GPU Cộng đồng (Miễn phí)**: `Deliberate v3`, `ICBINP Photoreal`, `AbsoluteReality`, `Nova Anime XL`, `AlbedoBase XL 3.1`, `AIO Pixel Art` (hiển thị hàng đợi & ETA trực tiếp).
- **Hỗ trợ API Key cá nhân (BYOK — lưu cục bộ trên `localStorage`)**:
  - **Google Gemini** (`gemini-2.5-flash-image` — hỗ trợ tạo ảnh & chỉnh sửa trực tiếp ảnh tải lên)
  - **Pollinations Pro** (`FLUX.1 Schnell`, `Z-Image Turbo`, `SD 3.5 Large`)
  - **OpenAI** (`gpt-image-1`, `dall-e-3`)
  - **Hugging Face Inference** (`FLUX.1-schnell`, `FLUX.1-dev`, `SDXL`)

## Chạy ở máy cá nhân

```bash
npm install
npm run dev
```

Build bản sản phẩm:

```bash
npm run build
```
