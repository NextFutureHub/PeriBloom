"use client";

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import type { Symptom, UserData } from '@/lib/types';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

export const generateSymptomReport = (symptoms: Symptom[], userData: UserData) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;

  // It's necessary to add a font that supports Cyrillic characters.
  // We'll add a simple one, but for a real app, you would embed a custom font like Alegreya.
  doc.addFont('Arial', 'Arial', 'normal');
  doc.setFont('Arial');

  doc.text(`Журнал симптомов для ${userData.name}`, 14, 20);
  doc.setFontSize(12);
  doc.text(`Период: ${userData.lifecycleStage}`, 14, 28);
  doc.text(`Дата отчета: ${format(new Date(), 'd MMMM yyyy', { locale: ru })}`, 14, 36);

  const tableColumn = ["Дата", "Время", "Симптом", "Тяжесть", "Комментарий"];
  const tableRows: (string | undefined)[][] = [];

  const severityMap = {
    low: 'Низкая',
    medium: 'Средняя',
    high: 'Высокая'
  };

  symptoms.forEach(symptom => {
    const symptomData = [
      format(new Date(symptom.date), 'dd.MM.yyyy'),
      symptom.time,
      symptom.symptom,
      severityMap[symptom.severity],
      symptom.comment,
    ];
    tableRows.push(symptomData);
  });

  doc.autoTable({
    startY: 50,
    head: [tableColumn],
    body: tableRows,
    styles: { font: 'Arial', fontStyle: 'normal' },
    headStyles: { fillColor: [140, 122, 230] } // A shade of purple
  });

  doc.save(`symptom_report_${userData.name.replace(' ','_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
