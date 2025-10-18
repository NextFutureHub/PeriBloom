import jsPDF from 'jspdf';

interface Symptom {
  id: string;
  date: string;
  symptom: string;
  severity: 'low' | 'medium' | 'high';
  time: string;
  comment: string;
}

interface UserData {
  name: string;
  lifecycleStage: string;
}

export function generateSymptomReport(symptoms: Symptom[], userData: UserData) {
  const doc = new jsPDF();
  
  // Заголовок
  doc.setFontSize(20);
  doc.text('Отчет о симптомах', 20, 30);
  
  // Информация о пользователе
  doc.setFontSize(12);
  doc.text(`Пациент: ${userData.name}`, 20, 50);
  doc.text(`Этап: ${userData.lifecycleStage}`, 20, 60);
  doc.text(`Дата создания: ${new Date().toLocaleDateString('ru-RU')}`, 20, 70);
  
  // Разделитель
  doc.line(20, 80, 190, 80);
  
  let yPosition = 90;
  
  // Группируем симптомы по датам
  const symptomsByDate = symptoms.reduce((acc, symptom) => {
    if (!acc[symptom.date]) {
      acc[symptom.date] = [];
    }
    acc[symptom.date].push(symptom);
    return acc;
  }, {} as Record<string, Symptom[]>);
  
  // Сортируем даты
  const sortedDates = Object.keys(symptomsByDate).sort();
  
  sortedDates.forEach(date => {
    const daySymptoms = symptomsByDate[date];
    
    // Дата
    doc.setFontSize(14);
    doc.text(new Date(date).toLocaleDateString('ru-RU'), 20, yPosition);
    yPosition += 10;
    
    // Симптомы за день
    daySymptoms.forEach(symptom => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(10);
      doc.text(`• ${symptom.symptom} (${symptom.time})`, 30, yPosition);
      
      // Цвет для степени тяжести
      const severityColors = {
        low: '#28a745',
        medium: '#ffc107', 
        high: '#dc3545'
      };
      
      doc.setTextColor(severityColors[symptom.severity]);
      doc.text(`[${symptom.severity === 'low' ? 'Низкая' : symptom.severity === 'medium' ? 'Средняя' : 'Высокая'}]`, 150, yPosition);
      doc.setTextColor(0, 0, 0); // Возвращаем черный цвет
      
      yPosition += 8;
      
      if (symptom.comment) {
        doc.text(`  Комментарий: ${symptom.comment}`, 35, yPosition);
        yPosition += 8;
      }
      
      yPosition += 5;
    });
    
    yPosition += 10;
  });
  
  // Сохраняем PDF
  doc.save(`symptom-report-${userData.name}-${new Date().toISOString().split('T')[0]}.pdf`);
}
