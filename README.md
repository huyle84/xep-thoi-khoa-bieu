# Xếp Thời Khóa Biểu (Next.js 14)

Ứng dụng web hỗ trợ sắp xếp thời khóa biểu cho trường học (THPT), được xây dựng bằng Next.js 14, Prisma và TailwindCSS.

## Công nghệ sử dụng
- **Framework:** Next.js 14 (App Router)
- **Database ORM:** Prisma
- **Styling:** Tailwind CSS, Radix UI (shadcn/ui)
- **Ngôn ngữ:** TypeScript
- **Kéo thả:** dnd-kit
- **State Management:** Zustand

## Hướng dẫn cài đặt

1. **Clone & Cài đặt dependencies**
   ```bash
   npm install
   ```

2. **Cấu hình database**
   Copy file `.env.example` thành `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *Mặc định sử dụng SQLite, có thể cấu hình lại chuỗi kết nối cho PostgreSQL nếu muốn deploy production.*

3. **Tạo database và seed dữ liệu**
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

4. **Chạy ứng dụng**
   ```bash
   npm run dev
   ```
   Mở trình duyệt: `http://localhost:3000`

## Chức năng chính
- Quản lý danh mục: Môn học, Giáo viên, Lớp học, Phòng học.
- Quản lý phân công chuyên môn.
- Xếp thời khóa biểu tự động và kéo thả thủ công.
- Quản lý tiết bận giáo viên.

## Hướng dẫn deploy lên Vercel
1. Push code lên GitHub.
2. Kết nối repo với Vercel.
3. Đảm bảo cấu hình biến môi trường `DATABASE_URL` là database PostgreSQL (Neon, Supabase...).
4. Thêm `prisma generate && prisma migrate deploy` vào bước Build Command.

## Biến môi trường
- `DATABASE_URL`: Đường dẫn kết nối CSDL (SQLite local, PostgreSQL staging/production).
