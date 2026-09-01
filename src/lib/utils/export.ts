import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PlacedEntry } from '../algorithms/types';

export function exportToExcel(type: 'school' | 'class' | 'teacher', entries: PlacedEntry[], classes: any[], teachers: any[]): void {
  const wb = XLSX.utils.book_new();

  const wsData = [
    ['Tiết / Ngày', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
  ];

  for (let period = 1; period <= 10; period++) {
    const row = [period <= 5 ? `Tiết ${period} (Sáng)` : `Tiết ${period - 5} (Chiều)`];
    for (let day = 2; day <= 7; day++) {
      const entry = entries.find(e => e.dayOfWeek === day && e.period === period);
      if (entry) {
        row.push(`${entry.subjectName}\n${entry.teacherName}\n${entry.roomName || ''}`);
      } else {
        row.push('');
      }
    }
    wsData.push(row);
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  ws['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(wb, ws, 'ThoiKhoaBieu');
  XLSX.writeFile(wb, `TKB_${type}.xlsx`);
}

export function exportToPDF(type: 'school' | 'class' | 'teacher', entries: PlacedEntry[], name: string): void {
  const doc = new jsPDF({ orientation: 'landscape' });
  
  doc.setFontSize(16);
  doc.text(name, 14, 15);
  doc.setFontSize(10);
  doc.text(`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`, 14, 22);

  const head = [['Tiết / Ngày', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']];
  const body = [];

  for (let period = 1; period <= 10; period++) {
    const row = [period <= 5 ? `Tiết ${period} Sáng` : `Tiết ${period - 5} Chiều`];
    for (let day = 2; day <= 7; day++) {
      const entry = entries.find(e => e.dayOfWeek === day && e.period === period);
      if (entry) {
        row.push(`${entry.subjectName}\nGV: ${entry.teacherName}\nP: ${entry.roomName || '-'}`);
      } else {
        row.push('');
      }
    }
    body.push(row);
  }

  autoTable(doc, {
    head: head,
    body: body,
    startY: 30,
    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 },
      4: { cellWidth: 40 },
      5: { cellWidth: 40 },
      6: { cellWidth: 40 },
    },
    theme: 'grid'
  });

  doc.save(`TKB_${type}.pdf`);
}
