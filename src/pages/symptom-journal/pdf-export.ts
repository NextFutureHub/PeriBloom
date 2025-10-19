import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

// Функция для безопасного обрезания текста
function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Функция для очистки текста от проблемных символов
function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[^\u0000-\u007F\u0400-\u04FF\u0500-\u052F\u2DE0-\u2DFF\uA640-\uA69F]/g, '') // Оставляем только ASCII и кириллицу
    .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
    .trim();
}

export async function generateSymptomReport(symptoms: Symptom[], userData: UserData) {
  try {
    // Валидация входных данных
    if (!symptoms || !Array.isArray(symptoms)) {
      console.error('Некорректные данные симптомов:', symptoms);
      return;
    }
    
    if (!userData || !userData.name) {
      console.error('Некорректные данные пользователя:', userData);
      return;
    }
    
    // Очистка и валидация данных
    const cleanSymptoms = symptoms
      .filter(symptom => symptom && symptom.id && symptom.date && symptom.symptom)
      .map(symptom => ({
        ...symptom,
        symptom: sanitizeText(symptom.symptom),
        comment: sanitizeText(symptom.comment || ''),
        time: sanitizeText(symptom.time || '')
      }));
    
    if (cleanSymptoms.length === 0) {
      console.warn('Нет валидных симптомов для экспорта');
      return;
    }
    
    // Создаем HTML элемент для отчета
    const reportElement = createReportHTML(cleanSymptoms, userData);
    
    // Добавляем элемент в DOM временно
    document.body.appendChild(reportElement);
    
    // Конвертируем HTML в canvas
    const canvas = await html2canvas(reportElement, {
      scale: 2, // Увеличиваем качество
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Удаляем временный элемент
    document.body.removeChild(reportElement);
    
    // Создаем PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 ширина в мм
    const pageHeight = 295; // A4 высота в мм
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Сохраняем PDF
    const safeName = sanitizeText(userData.name).replace(/[^a-zA-Zа-яА-Я0-9]/g, '_');
    const fileName = `symptom-report-${safeName}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    console.log('PDF успешно создан:', fileName);
    
  } catch (error) {
    console.error('Ошибка при создании PDF:', error);
    alert('Произошла ошибка при создании отчета. Попробуйте еще раз.');
  }
}

// Функция для создания HTML отчета
function createReportHTML(symptoms: Symptom[], userData: UserData): HTMLElement {
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: absolute;
    top: -9999px;
    left: -9999px;
    width: 800px;
    background: white;
    font-family: 'Arial', 'Helvetica', 'DejaVu Sans', sans-serif;
    padding: 20px;
    color: black;
    line-height: 1.4;
    font-size: 14px;
  `;
  
  // Группируем симптомы по датам
  const symptomsByDate = symptoms.reduce((acc, symptom) => {
    const dateKey = symptom.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(symptom);
    return acc;
  }, {} as Record<string, Symptom[]>);
  
  // Сортируем даты
  const sortedDates = Object.keys(symptomsByDate).sort();
  
  let html = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 24px; margin: 0 0 10px 0; color: #333;">Отчет о симптомах</h1>
      <div style="font-size: 14px; color: #666;">
        <p style="margin: 5px 0;">Пациент: ${sanitizeText(userData.name)}</p>
        <p style="margin: 5px 0;">Этап: ${sanitizeText(userData.lifecycleStage)}</p>
        <p style="margin: 5px 0;">Дата создания: ${new Date().toLocaleDateString('ru-RU')}</p>
        <p style="margin: 5px 0;">Всего записей: ${symptoms.length}</p>
      </div>
    </div>
    
    <hr style="border: 1px solid #ddd; margin: 20px 0;">
  `;
  
  sortedDates.forEach(date => {
    const daySymptoms = symptomsByDate[date];
    const formattedDate = new Date(date).toLocaleDateString('ru-RU');
    
    html += `
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; color: #333; margin: 0 0 10px 0;">${formattedDate}</h2>
    `;
    
    daySymptoms.forEach(symptom => {
      const severityColors = {
        low: '#28a745',
        medium: '#ffc107',
        high: '#dc3545'
      };
      
      const severityText = symptom.severity === 'low' ? 'Низкая' : 
                         symptom.severity === 'medium' ? 'Средняя' : 'Высокая';
      
      html += `
        <div style="margin-bottom: 10px; padding: 10px; border-left: 4px solid ${severityColors[symptom.severity]}; background: #f8f9fa;">
          <div style="font-weight: bold; margin-bottom: 5px;">
            • ${truncateText(symptom.symptom, 60)} (${symptom.time})
            <span style="color: ${severityColors[symptom.severity]}; font-size: 12px; margin-left: 10px;">
              [${severityText}]
            </span>
          </div>
          ${symptom.comment && symptom.comment.trim() ? `
            <div style="font-size: 12px; color: #666; margin-top: 5px;">
              Комментарий: ${truncateText(symptom.comment, 80)}
            </div>
          ` : ''}
        </div>
      `;
    });
    
    html += `</div>`;
  });
  
  reportDiv.innerHTML = html;
  return reportDiv;
}

