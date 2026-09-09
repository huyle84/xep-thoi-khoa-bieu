'use client';

import { Calendar, ArrowRight, CheckCircle, Info, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Step9XepTKB() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎉 Bước 9: Xếp Thời Khóa Biểu
        </h2>
        <p className="text-gray-500">
          Bạn đã hoàn thành tất cả các bước cài đặt. Sẵn sàng để xếp TKB!
        </p>
      </div>

      {/* Summary checklist */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Đã hoàn thành
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            'Khối học', 'Lớp học', 'Tiết học',
            'Môn học', 'Giáo viên', 'GVCN',
            'Phân công', 'Số tiết/tuần',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Tính năng Xếp TKB bao gồm:</p>
          <ul className="space-y-1 text-blue-600">
            <li>⚡ Xếp tự động bằng thuật toán backtracking</li>
            <li>🔒 Kiểm tra ràng buộc cứng (giáo viên trùng giờ...)</li>
            <li>↔️ Kéo thả thủ công để điều chỉnh</li>
            <li>↩️ Undo/Redo (Ctrl+Z / Ctrl+Y)</li>
            <li>📊 Xuất Excel và PDF</li>
          </ul>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-3">
        <Link
          href="/schedule"
          className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 shadow-md transition-all hover:shadow-lg hover:scale-[1.01]"
        >
          <Zap className="w-5 h-5" />
          Bắt đầu xếp Thời Khóa Biểu
          <ArrowRight className="w-5 h-5" />
        </Link>

        <p className="text-center text-xs text-gray-400">
          Bạn có thể quay lại chỉnh sửa bất kỳ bước nào ở trên bất cứ lúc nào
        </p>
      </div>
    </div>
  );
}
