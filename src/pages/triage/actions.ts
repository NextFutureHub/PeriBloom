// Улучшенный Triage анализ с умной логикой
export async function getTriageAnalysis({ symptomsDescription }: { symptomsDescription: string }) {
  // Имитация задержки API
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  const description = symptomsDescription.toLowerCase();
  
  // Умный анализатор симптомов
  const getRiskLevel = (desc: string) => {
    // Анализ интенсивности симптомов
    const intensityWords = {
      critical: ['критически', 'критическое', 'экстренно', 'экстренная', 'нестерпимо', 'нестерпимая', 'мучительно', 'мучительная'],
      high: ['очень', 'сильно', 'сильная', 'сильные', 'острая', 'острая', 'невыносимо', 'невыносимая', 'ужасно', 'ужасная'],
      medium: ['довольно', 'достаточно', 'заметно', 'ощутимо', 'чувствительно'],
      low: ['слегка', 'немного', 'чуть-чуть', 'легко', 'легкая', 'легкие']
    };

    // Анализ локализации симптомов
    const criticalLocations = ['живот', 'животе', 'низу живота', 'нижней части живота', 'таз', 'тазовой области'];
    const pregnancyTerms = ['триместр', 'триместре', 'срок', 'сроках', 'беременности', 'беременная', 'беременности'];
    
    // Анализ времени и продолжительности
    const timeIndicators = ['часов', 'минут', 'дней', 'недель', 'продолжается', 'длится', 'уже'];
    const urgentTime = ['сейчас', 'только что', 'внезапно', 'резко', 'мгновенно'];
    
    // Анализ эмоционального состояния
    const emotionalWords = ['боюсь', 'страшно', 'паника', 'паникую', 'волнуюсь', 'переживаю', 'тревожно'];
    
    // Подсчет очков риска
    let riskScore = 0;
    
    // 1. Анализ интенсивности
    for (const [level, words] of Object.entries(intensityWords)) {
      const foundWords = words.filter(word => desc.includes(word));
      if (foundWords.length > 0) {
        switch (level) {
          case 'critical': riskScore += 40; break;
          case 'high': riskScore += 25; break;
          case 'medium': riskScore += 10; break;
          case 'low': riskScore += 2; break;
        }
      }
    }
    
    // 2. Анализ локализации (критично для беременности)
    const hasCriticalLocation = criticalLocations.some(loc => desc.includes(loc));
    const hasPregnancyContext = pregnancyTerms.some(term => desc.includes(term));
    
    if (hasCriticalLocation && hasPregnancyContext) {
      riskScore += 35; // Критическая комбинация
    } else if (hasCriticalLocation) {
      riskScore += 20;
    }
    
    // 3. Анализ времени
    const hasTimeUrgency = urgentTime.some(time => desc.includes(time));
    const hasTimeDuration = timeIndicators.some(time => desc.includes(time));
    
    if (hasTimeUrgency) riskScore += 15;
    if (hasTimeDuration) riskScore += 5;
    
    // 4. Анализ эмоционального состояния
    const hasEmotionalStress = emotionalWords.some(emotion => desc.includes(emotion));
    if (hasEmotionalStress) riskScore += 10;
    
    // 5. Анализ длины и детальности описания
    if (desc.length > 200) riskScore += 5; // Детальное описание
    if (desc.length > 100) riskScore += 3;
    
    // 6. Специальные медицинские термины
    const medicalTerms = ['кровотечение', 'кровь', 'температура', 'жар', 'судороги', 'судорога', 'рвота', 'тошнота'];
    const foundMedicalTerms = medicalTerms.filter(term => desc.includes(term));
    riskScore += foundMedicalTerms.length * 8;
    
    // 7. Анализ повторяющихся слов (указывает на серьезность)
    const words = desc.split(/\s+/);
    const wordCounts: Record<string, number> = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    const repeatedWords = Object.values(wordCounts).filter((count: number) => count > 1).length;
    riskScore += repeatedWords * 3;
    
    // Определение уровня риска на основе очков
    if (riskScore >= 50) return 'high';
    if (riskScore >= 25) return 'medium';
    return 'low';
  };
  
  const riskLevel = getRiskLevel(description);
  
  // Отладочная информация
  console.log('Анализ симптомов:', {
    description: symptomsDescription,
    riskLevel,
    descriptionLength: description.length
  });
  
  // Умная генерация рекомендаций
  const getRecommendations = (risk: string, desc: string) => {
    // Анализ симптомов
    const symptoms = {
      pain: /боль|болит|болевые|болезненн/i.test(desc),
      abdominalPain: /живот|животе|низу живота|таз/i.test(desc),
      nausea: /тошнота|рвота|тошнит/i.test(desc),
      bleeding: /кровь|кровотечение|кровит/i.test(desc),
      temperature: /температура|жар|горяч/i.test(desc),
      breathing: /дышать|дыхание|задыхаюсь/i.test(desc),
      dizziness: /головокружение|кружится|слабость/i.test(desc),
      contractions: /схватки|схваткообразн|сокращения/i.test(desc)
    };
    
    // Анализ контекста беременности
    const pregnancyContext = {
      trimester: /триместр|срок|беременности/i.test(desc),
      thirdTrimester: /3 триместр|третий триместр|поздних сроках/i.test(desc),
      timeDuration: /часов|минут|дней|продолжается|длится/i.test(desc),
      urgency: /сейчас|внезапно|резко|только что/i.test(desc)
    };
    
    // Анализ интенсивности (для будущего использования)
    // const intensity = {
    //   critical: /критически|экстренно|нестерпимо|мучительно/i.test(desc),
    //   high: /очень|сильно|сильная|невыносимо|ужасно/i.test(desc),
    //   medium: /довольно|заметно|ощутимо/i.test(desc),
    //   low: /слегка|немного|легко/i.test(desc)
    // };
    
    if (risk === 'high') {
      let specificAdvice = '';
      let emergencyActions = '';
      let generalAdvice = '';
      
      // КРИТИЧЕСКИЕ СЛУЧАИ
      if (symptoms.abdominalPain && pregnancyContext.thirdTrimester) {
        emergencyActions += '🚨 КРИТИЧЕСКАЯ СИТУАЦИЯ: Боли в животе на поздних сроках!\n';
        emergencyActions += '• НЕМЕДЛЕННО вызовите скорую помощь (103)\n';
        emergencyActions += '• Это может быть началом родов или осложнением\n';
        emergencyActions += '• Сообщите диспетчеру о сроке беременности\n';
        emergencyActions += '• Соберите документы и вещи для роддома\n\n';
      }
      
      if (symptoms.bleeding) {
        emergencyActions += '• При кровотечении - немедленно вызовите скорую помощь\n';
        emergencyActions += '• Приложите чистую ткань к месту кровотечения\n';
        emergencyActions += '• Не используйте тампоны при вагинальном кровотечении\n\n';
      }
      
      if (symptoms.contractions && pregnancyContext.thirdTrimester) {
        emergencyActions += '• При схватках на поздних сроках - срочно в роддом\n';
        emergencyActions += '• Засекайте интервалы между схватками\n';
        emergencyActions += '• При схватках каждые 5 минут - ехать в роддом\n\n';
      }
      
      // СПЕЦИФИЧЕСКИЕ СОВЕТЫ
      if (symptoms.temperature) {
        specificAdvice += '• Измерьте температуру и запишите время\n';
        specificAdvice += '• При температуре выше 38.5°C - срочно к врачу\n';
        specificAdvice += '• Пейте больше жидкости\n';
      }
      
      if (symptoms.breathing) {
        specificAdvice += '• При затрудненном дыхании - срочно к врачу\n';
        specificAdvice += '• Попробуйте дышать медленно и глубоко\n';
        specificAdvice += '• При ухудшении - немедленно вызывайте скорую\n';
      }
      
      if (symptoms.pain && !symptoms.abdominalPain) {
        specificAdvice += '• При сильной боли - не терпите, обратитесь за помощью\n';
        specificAdvice += '• Не принимайте обезболивающие без консультации врача\n';
        specificAdvice += '• Попробуйте расслабляющие техники\n';
      }
      
      // ОБЩИЕ РЕКОМЕНДАЦИИ
      generalAdvice += '• Немедленно обратитесь к врачу или вызовите скорую помощь (103)\n';
      generalAdvice += '• Не принимайте никаких лекарств без консультации врача\n';
      generalAdvice += '• Сообщите врачу о всех симптомах и их продолжительности\n';
      generalAdvice += '• При ухудшении состояния - не ждите, вызывайте скорую\n';
      generalAdvice += '• Ваше здоровье и здоровье малыша - это приоритет!';
      
      return `🚨 ВНИМАНИЕ: Высокий уровень риска!

${emergencyActions}${specificAdvice}

Общие рекомендации:
${generalAdvice}`;
    }
    
    if (risk === 'medium') {
      let specificAdvice = '';
      
      if (symptoms.nausea) {
        specificAdvice += '• При тошноте - пейте воду маленькими глотками\n';
        specificAdvice += '• Избегайте резких движений\n';
      }
      
      if (symptoms.pain) {
        specificAdvice += '• При боли - попробуйте расслабляющие техники\n';
        specificAdvice += '• Отдыхайте в удобной позе\n';
      }
      
      return `⚠️ Средний уровень риска

${specificAdvice}

Рекомендации:
• Обратитесь к врачу в ближайшие 24-48 часов
• Отслеживайте изменения в симптомах
• При ухудшении состояния - немедленно обратитесь к врачу
• Пейте больше воды и отдыхайте
• Избегайте физических нагрузок
• Ведите дневник симптомов

Если симптомы ухудшаются или появляются новые - не ждите, обратитесь к врачу.`;
    }
    
    return `✅ Низкий уровень риска

Рекомендации:
• Следите за своим состоянием
• При ухудшении симптомов обратитесь к врачу
• Соблюдайте режим дня и здоровое питание
• Пейте достаточно воды (8-10 стаканов в день)
• Отдыхайте и избегайте стрессов
• Регулярно посещайте врача для плановых осмотров
• Ведите дневник самочувствия

Если симптомы не проходят в течение нескольких дней или ухудшаются - обратитесь к врачу для консультации.`;
  };
  
  const recommendations = getRecommendations(riskLevel, description);
  
  return {
    success: true,
    riskLevel,
    recommendations
  };
}
