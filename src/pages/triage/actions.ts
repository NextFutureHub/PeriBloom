// ИИ Triage анализ с автоматическим определением симптомов
export async function getTriageAnalysis({ symptomsDescription }: { symptomsDescription: string }) {
  try {
    // Получаем API ключ из переменных окружения или используем демо ключ
    const apiKey = (import.meta as any).env.VITE_GOOGLE_AI_API_KEY || 'demo-key';
    
    if (apiKey === 'demo-key') {
      // Fallback на умные ответы если нет API ключа
      return getSmartFallbackTriage(symptomsDescription);
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Ты - эксперт-гинеколог с 20-летним опытом, специализирующийся на ведении беременности. Твоя задача - провести профессиональный триаж симптомов у беременных женщин.

🚨 КРИТИЧЕСКИЕ СИМПТОМЫ (ВСЕГДА ВЫСОКИЙ РИСК):
- Любое кровотечение (кровь, кровотечение, кровит, мажущие выделения с кровью)
- Сильные боли в животе + кровотечение
- СХВАТКИ НА ЛЮБОМ СРОКЕ БЕРЕМЕННОСТИ (регулярные сокращения, боли как при месячных)
- Потеря сознания, судороги, обмороки
- Высокая температура (38.5°C+) + боли в животе
- Острая боль в правом боку (подозрение на аппендицит)
- Сильная головная боль + нарушения зрения
- Отсутствие шевелений плода после 28 недель

⚠️ ВАЖНО: Слово "схватки" = ВСЕГДА ВЫСОКИЙ РИСК! Даже если это тренировочные схватки Брекстона-Хикса, их нужно проверить у врача.

📊 АНАЛИЗ СИМПТОМОВ: "${symptomsDescription}"

🔍 ДЕТАЛЬНЫЙ АНАЛИЗ:
1. УРОВЕНЬ РИСКА: low/medium/high (кровотечение = ВСЕГДА high)
2. ОСНОВНЫЕ СИМПТОМЫ: список всех выявленных симптомов с описанием
3. ТЯЖЕСТЬ: mild/moderate/severe для каждого симптома
4. СРОЧНОСТЬ: low/medium/high
5. ПЕРСОНАЛЬНЫЕ КОММЕНТАРИИ: детальный анализ ситуации
6. ОБУЧЕНИЕ: ссылки на релевантные уроки (если применимо)

📚 ДОСТУПНЫЕ УРОКИ В ПРИЛОЖЕНИИ:

ОСНОВЫ БЕРЕМЕННОСТИ:
- "Питание во время беременности" (pregnancy-nutrition) - Правильное питание для здоровой беременности
- "Физические упражнения" (pregnancy-exercise) - Безопасные упражнения для беременных  
- "Подготовка к родам" (pregnancy-preparation) - Как подготовиться к родам
- "Эмоциональное здоровье" (pregnancy-emotional) - Поддержание эмоционального благополучия

ПОСЛЕРОДОВОЙ ПЕРИОД:
- "Восстановление организма" (postpartum-recovery) - Физическое восстановление после родов
- "Грудное вскармливание" (breastfeeding) - Основы успешного грудного вскармливания
- "Послеродовая депрессия" (postpartum-depression) - Понимание и преодоление послеродовой депрессии
- "Физическая активность" (postpartum-activity) - Возвращение к физической активности

УХОД ЗА РЕБЕНКОМ:
- "Кормление ребенка" (baby-feeding) - Основы кормления новорожденного
- "Сон новорожденного" (baby-sleep) - Организация здорового сна
- "Гигиена ребенка" (baby-hygiene) - Ежедневный уход за новорожденным
- "Развитие ребенка" (baby-development) - Этапы развития в первый год

💡 ПРАВИЛА АНАЛИЗА:
- При НИЗКОМ риске: дай успокаивающий комментарий + ссылку на обучение
- При СРЕДНЕМ риске: объясни ситуацию + рекомендации + обучение
- При ВЫСОКОМ риске: срочные действия + экстренные меры

Отвечай ТОЛЬКО в формате JSON:
{
  "riskLevel": "low/medium/high",
  "symptoms": [
    {
      "name": "детальное название симптома",
      "severity": "mild/moderate/severe",
      "urgency": "low/medium/high",
      "description": "краткое описание симптома"
    }
  ],
  "recommendations": "детальные рекомендации на русском языке с объяснениями",
  "emergencyActions": "действия при экстренной ситуации (если нужны)",
  "personalComment": "персональный комментарий врача с анализом ситуации",
  "educationLinks": [
    {
      "title": "название урока",
      "link": "урок-X-название",
      "description": "краткое описание урока"
    }
  ],
  "comfortingMessage": "успокаивающее сообщение для беременной (если низкий риск)",
  "followUpAdvice": "советы по дальнейшему наблюдению"
}

🚨 ПОМНИ: Кровотечение у беременных = ВЫСОКИЙ РИСК! Всегда будь внимательным к деталям и давай максимально полезные советы.`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Ошибка анализа';
    
          try {
            const analysis = JSON.parse(aiResponse);
            return {
              success: true,
              riskLevel: analysis.riskLevel || 'medium',
              symptoms: analysis.symptoms || [],
              recommendations: analysis.recommendations || 'Обратитесь к врачу для консультации.',
              emergencyActions: analysis.emergencyActions || null,
              personalComment: analysis.personalComment || null,
              educationLinks: analysis.educationLinks || [],
              comfortingMessage: analysis.comfortingMessage || null,
              followUpAdvice: analysis.followUpAdvice || null
            };
          } catch (parseError) {
            console.error('Ошибка парсинга ИИ ответа:', parseError);
            return getSmartFallbackTriage(symptomsDescription);
          }

  } catch (error) {
    console.error('AI Triage Error:', error);
    return getSmartFallbackTriage(symptomsDescription);
  }
}

// Умный fallback анализ
function getSmartFallbackTriage(symptomsDescription: string) {
  const description = symptomsDescription.toLowerCase();
  
  // Умный анализатор симптомов
  const getRiskLevel = (desc: string) => {
    // Анализ интенсивности симптомов
    const intensityWords = {
      critical: ['критически', 'критическое', 'экстренно', 'экстренная', 'нестерпимо', 'нестерпимая', 'мучительно', 'мучительная', 'ужасно', 'ужасная'],
      high: ['очень', 'сильно', 'сильная', 'сильные', 'острая', 'острая', 'невыносимо', 'невыносимая', 'интенсивно', 'интенсивная'],
      medium: ['довольно', 'достаточно', 'заметно', 'ощутимо', 'чувствительно', 'чувствительная'],
      low: ['слегка', 'немного', 'чуть-чуть', 'легко', 'легкая', 'легкие', 'слабо', 'слабая']
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
    const medicalTerms = {
      critical: ['кровотечение', 'кровь', 'судороги', 'судорога', 'потеря сознания', 'обморок'],
      high: ['температура', 'жар', 'рвота', 'тошнота', 'головокружение', 'слабость'],
      medium: ['боль', 'болит', 'дискомфорт', 'неприятные ощущения']
    };
    
    let medicalScore = 0;
    for (const [level, terms] of Object.entries(medicalTerms)) {
      const foundTerms = terms.filter(term => desc.includes(term));
      if (foundTerms.length > 0) {
        switch (level) {
          case 'critical': medicalScore += foundTerms.length * 15; break;
          case 'high': medicalScore += foundTerms.length * 10; break;
          case 'medium': medicalScore += foundTerms.length * 5; break;
        }
      }
    }
    riskScore += medicalScore;
    
    // 7. Специальные комбинации симптомов (критические)
    const criticalCombinations = [
      { symptoms: ['боль', 'живот', 'кровь'], score: 50 }, // Критическая комбинация
      { symptoms: ['боль', 'низу живота', 'кровь'], score: 60 }, // Еще более критическая
      { symptoms: ['схватки', 'живот', 'беременн'], score: 30 },
      { symptoms: ['температура', 'боль', 'живот'], score: 20 },
      { symptoms: ['рвота', 'боль', 'живот'], score: 18 },
      { symptoms: ['кровь', 'беременн'], score: 50 }, // Кровотечение при беременности = критично
      { symptoms: ['кровотечение', 'беременн'], score: 55 },
      { symptoms: ['судороги', 'беременн'], score: 40 }
    ];
    
    for (const combo of criticalCombinations) {
      const foundSymptoms = combo.symptoms.filter(symptom => desc.includes(symptom));
      if (foundSymptoms.length >= 2) {
        riskScore += combo.score;
        console.log(`Critical combination found: ${foundSymptoms.join(', ')} (+${combo.score} points)`);
      }
    }
    
    // 8. Анализ повторяющихся слов (указывает на серьезность)
    const words = desc.split(/\s+/);
    const wordCounts: Record<string, number> = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    const repeatedWords = Object.values(wordCounts).filter((count: number) => count > 1).length;
    riskScore += repeatedWords * 3;
    
    // Специальная проверка для критических симптомов
    if (desc.includes('кровь') || desc.includes('кровотечение') || desc.includes('кровит')) {
      console.log('CRITICAL: Blood detected - forcing HIGH risk');
      return 'high';
    }
    
    // Специальная проверка для схваток
    if (desc.includes('схватки') || desc.includes('сокращения') || desc.includes('схватка')) {
      console.log('CRITICAL: Contractions detected - forcing HIGH risk');
      return 'high';
    }
    
    // Определение уровня риска на основе очков
    console.log('Risk score calculated:', riskScore);
    
    if (riskScore >= 60) return 'high';
    if (riskScore >= 30) return 'medium';
    return 'low';
  };
  
  let riskLevel = getRiskLevel(description);
  
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
  
  // Определяем симптомы для fallback
  const detectedSymptoms = [];
  
  if (/боль|болит|болевые/i.test(description)) {
    detectedSymptoms.push({
      name: "Боль",
      severity: riskLevel === 'high' ? 'severe' : riskLevel === 'medium' ? 'moderate' : 'mild',
      urgency: riskLevel
    });
  }
  
  if (/кровь|кровотечение|кровит/i.test(description)) {
    detectedSymptoms.push({
      name: "Кровотечение",
      severity: 'severe',
      urgency: 'high'
    });
    // Принудительно устанавливаем высокий риск при кровотечении
    if (riskLevel !== 'high') {
      console.log('FORCING HIGH RISK due to bleeding');
      riskLevel = 'high';
    }
  }
  
  if (/тошнота|рвота|тошнит/i.test(description)) {
    detectedSymptoms.push({
      name: "Тошнота/Рвота",
      severity: riskLevel === 'high' ? 'severe' : 'moderate',
      urgency: riskLevel
    });
  }
  
  if (/температура|жар|горяч/i.test(description)) {
    detectedSymptoms.push({
      name: "Повышенная температура",
      severity: 'moderate',
      urgency: 'medium'
    });
  }
  
  if (/схватки|схваткообразн|сокращения/i.test(description)) {
    detectedSymptoms.push({
      name: "Схватки",
      severity: 'severe',
      urgency: 'high'
    });
    // Принудительно устанавливаем высокий риск при схватках
    if (riskLevel !== 'high') {
      console.log('FORCING HIGH RISK due to contractions');
      riskLevel = 'high';
    }
  }
  
  // Дополнительные функции для расширенного анализа
  const getPersonalComment = (risk: string) => {
    if (risk === 'low') {
      return "Ваши симптомы в пределах нормы для беременности. Не волнуйтесь, это обычные изменения в организме.";
    } else if (risk === 'medium') {
      return "Симптомы требуют внимания, но не критичны. Рекомендую наблюдение и консультацию врача.";
    } else {
      return "Симптомы требуют немедленного медицинского вмешательства. Не откладывайте обращение к врачу.";
    }
  };

  const getEducationLinks = (desc: string) => {
    const links = [];
    
    // Кровотечения - нет прямого урока, но есть общие основы беременности
    if (/кровь|кровотечение|кровит/i.test(desc)) {
      links.push({
        title: "Основы беременности",
        link: "pregnancy-basics",
        description: "Общие принципы здоровой беременности и когда обращаться к врачу"
      });
    }
    
    // Боли в животе - физические упражнения могут помочь
    if (/боль|болит|живот/i.test(desc)) {
      links.push({
        title: "Физические упражнения",
        link: "pregnancy-exercise",
        description: "Безопасные упражнения для беременных и укрепление мышц"
      });
    }
    
    // Тошнота - питание и эмоциональное здоровье
    if (/тошнота|рвота|тошнит/i.test(desc)) {
      links.push({
        title: "Питание во время беременности",
        link: "pregnancy-nutrition",
        description: "Правильное питание для борьбы с тошнотой и токсикозом"
      });
      links.push({
        title: "Эмоциональное здоровье",
        link: "pregnancy-emotional",
        description: "Управление стрессом и эмоциями во время беременности"
      });
    }
    
    // Головные боли - эмоциональное здоровье
    if (/головная боль|голова болит/i.test(desc)) {
      links.push({
        title: "Эмоциональное здоровье",
        link: "pregnancy-emotional",
        description: "Способы управления стрессом и поддержания эмоционального благополучия"
      });
    }
    
    // Подготовка к родам для серьезных симптомов
    if (/схватки|сокращения|роды/i.test(desc)) {
      links.push({
        title: "Подготовка к родам",
        link: "pregnancy-preparation",
        description: "Как подготовиться к родам и что ожидать"
      });
    }
    
    return links;
  };

  const getComfortingMessage = () => {
    return "Не волнуйтесь! Ваши симптомы являются нормальной частью беременности. Рекомендую изучить соответствующие материалы для лучшего понимания.";
  };

  const getFollowUpAdvice = (risk: string) => {
    if (risk === 'low') {
      return "Продолжайте наблюдение за симптомами. При любых изменениях обращайтесь к врачу.";
    } else if (risk === 'medium') {
      return "Запишитесь на прием к врачу в ближайшие дни. Ведите дневник симптомов.";
    } else {
      return "Немедленно обратитесь за медицинской помощью. Не ждите улучшения симптомов.";
    }
  };

  return {
    success: true,
    riskLevel,
    symptoms: detectedSymptoms,
    recommendations,
    emergencyActions: riskLevel === 'high' ? 'Немедленно обратитесь к врачу или вызовите скорую помощь (103).' : null,
    personalComment: getPersonalComment(riskLevel),
    educationLinks: getEducationLinks(description),
    comfortingMessage: riskLevel === 'low' ? getComfortingMessage() : null,
    followUpAdvice: getFollowUpAdvice(riskLevel)
  };
}
