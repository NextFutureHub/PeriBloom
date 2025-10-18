// Triage анализ с умными ответами
export async function getTriageAnalysis({ symptomsDescription }: { symptomsDescription: string }) {
  // Имитация задержки API
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  const description = symptomsDescription.toLowerCase();
  
  // Определяем уровень риска на основе ключевых слов
  const getRiskLevel = (desc: string) => {
    const highRiskKeywords = [
      'сильная боль', 'кровотечение', 'высокая температура', 'потеря сознания',
      'затрудненное дыхание', 'сильная тошнота', 'рвота', 'судороги',
      'острая боль', 'нестерпимая боль', 'кровь', 'травма головы'
    ];
    
    const mediumRiskKeywords = [
      'умеренная боль', 'головная боль', 'тошнота', 'слабость',
      'головокружение', 'боль в животе', 'дискомфорт', 'недомогание'
    ];
    
    const hasHighRisk = highRiskKeywords.some(keyword => desc.includes(keyword));
    const hasMediumRisk = mediumRiskKeywords.some(keyword => desc.includes(keyword));
    
    if (hasHighRisk) return 'high';
    if (hasMediumRisk) return 'medium';
    return 'low';
  };
  
  const riskLevel = getRiskLevel(description);
  
  // Генерируем рекомендации на основе уровня риска
  const getRecommendations = (risk: string, desc: string) => {
    if (risk === 'high') {
      return `ВНИМАНИЕ: Высокий уровень риска!

На основе ваших симптомов рекомендуется:
• Немедленно обратитесь к врачу или вызовите скорую помощь
• Не принимайте никаких лекарств без консультации врача
• Если есть кровотечение - приложите чистую ткань и держите давление
• При высокой температуре (выше 38.5°C) - обратитесь к врачу
• При сильной боли - не терпите, обратитесь за медицинской помощью

Ваше здоровье - это приоритет. Не откладывайте визит к врачу.`;
    }
    
    if (risk === 'medium') {
      return `Средний уровень риска

Рекомендации:
• Обратитесь к врачу в ближайшие 24-48 часов
• Отслеживайте изменения в симптомах
• При ухудшении состояния - немедленно обратитесь к врачу
• Пейте больше воды и отдыхайте
• Избегайте физических нагрузок

Если симптомы ухудшаются или появляются новые - не ждите, обратитесь к врачу.`;
    }
    
    return `Низкий уровень риска

Рекомендации:
• Следите за своим состоянием
• При ухудшении симптомов обратитесь к врачу
• Соблюдайте режим дня и здоровое питание
• Пейте достаточно воды
• Отдыхайте и избегайте стрессов

Если симптомы не проходят в течение нескольких дней или ухудшаются - обратитесь к врачу для консультации.`;
  };
  
  const recommendations = getRecommendations(riskLevel, description);
  
  return {
    success: true,
    riskLevel,
    recommendations
  };
}
