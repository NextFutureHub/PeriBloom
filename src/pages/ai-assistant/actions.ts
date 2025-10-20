// Функция для построения промпта с историей сообщений
function buildPromptWithHistory(lifecycleStage: string, query: string, messageHistory: Array<{ role: string; content: string }>) {
  // Берем последние 20 сообщений для контекста
  const recentHistory = messageHistory.slice(-20);
  
  let historyContext = '';
  if (recentHistory.length > 0) {
    historyContext = '\n\nКонтекст предыдущих сообщений:\n';
    recentHistory.forEach(msg => {
      const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
      historyContext += `${role}: ${msg.content}\n`;
    });
  }

  return `Ты - персональный AI ассистент по здоровью для матерей. Предоставляй советы, рекомендации и дыхательные упражнения на основе выбранного этапа жизни пользователя.

Этап жизни пользователя: ${lifecycleStage}
Текущий вопрос пользователя: ${query}${historyContext}

ВАЖНО: Учитывай контекст предыдущих сообщений. Не повторяй приветствия, если уже здоровался. Продолжай разговор естественно, как будто помнишь всю историю общения.

Отвечай на русском языке, будь дружелюбным и поддерживающим. Давай практические советы, но всегда напоминай обратиться к врачу при серьезных проблемах.`;
}

// Настоящий AI ассистент с Google Gemini API
export async function getAIResponse({ lifecycleStage, query, messageHistory = [] }: { 
  lifecycleStage: string; 
  query: string; 
  messageHistory?: Array<{ role: string; content: string }>;
}) {
  try {
    // Получаем API ключ из переменных окружения или используем демо ключ
    const apiKey = (import.meta as any).env.VITE_GOOGLE_AI_API_KEY || 'demo-key';
    
    if (apiKey === 'demo-key') {
      // Fallback на умные ответы если нет API ключа
      return getSmartFallbackResponse(lifecycleStage, query, messageHistory);
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: buildPromptWithHistory(lifecycleStage, query, messageHistory)
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Извините, не удалось получить ответ от AI.';

    return {
      success: true,
      response: aiResponse
    };

  } catch (error) {
    console.error('AI Assistant Error:', error);
    // Fallback на умные ответы при ошибке
    return getSmartFallbackResponse(lifecycleStage, query, messageHistory);
  }
}

// Умные ответы как fallback
function getSmartFallbackResponse(stage: string, userQuery: string, messageHistory: Array<{ role: string; content: string }> = []) {
  const query = userQuery.toLowerCase();
  
  // Проверяем, есть ли уже история разговора
  const hasHistory = messageHistory.length > 0;
  const isFirstMessage = !hasHistory || messageHistory.every(msg => msg.role === 'user');
  
  let response = "";
  
  // Ответы для беременности
  if (stage === 'pregnancy') {
    if (query.includes('тошнот') || query.includes('токсикоз')) {
      response = isFirstMessage 
        ? "Тошнота во время беременности - это нормальное явление. Попробуйте есть небольшими порциями, избегайте жирной пищи и пейте больше воды. Если тошнота сильная, обратитесь к врачу."
        : "Понимаю, что тошнота беспокоит. Попробуйте имбирь, мятный чай или сухарики. Если симптомы усиливаются, обязательно проконсультируйтесь с врачом.";
    } else if (query.includes('питани') || query.includes('еда')) {
      response = isFirstMessage
        ? "Во время беременности важно сбалансированное питание. Включите в рацион фолиевую кислоту, железо, кальций. Избегайте сырого мяса, рыбы с высоким содержанием ртути и непастеризованных продуктов."
        : "Продолжаем говорить о питании. Какие именно продукты вас интересуют? Могу дать более конкретные советы по вашему рациону.";
    } else if (query.includes('сон') || query.includes('спать')) {
      response = isFirstMessage
        ? "Сон во время беременности может быть нарушен. Попробуйте спать на боку, используйте подушки для поддержки. Избегайте кофеина во второй половине дня."
        : "Проблемы со сном продолжаются? Попробуйте расслабляющие техники перед сном или проконсультируйтесь с врачом о безопасных способах улучшения сна.";
    } else if (query.includes('боль') || query.includes('болит')) {
      response = isFirstMessage
        ? "Если у вас сильные боли, особенно внизу живота, немедленно обратитесь к врачу. Легкие тянущие ощущения могут быть нормальными, но лучше проконсультироваться со специалистом."
        : "Расскажите подробнее о характере боли. Это поможет дать более точный совет. При сильных болях обязательно обратитесь к врачу.";
    } else {
      response = isFirstMessage
        ? "Во время беременности важно регулярно посещать врача, следить за питанием и избегать стрессов. Каждый организм индивидуален, поэтому при любых сомнениях обращайтесь к специалистам."
        : "Что еще вас беспокоит? Я готов помочь с любыми вопросами о беременности.";
    }
  }
  // Ответы для послеродового периода
  else if (stage === 'postpartum') {
    if (query.includes('грудн') || query.includes('кормлени')) {
      response = "Грудное вскармливание может быть сложным в первые дни. Обратитесь к консультанту по грудному вскармливанию, если возникают проблемы. Помните: важно ваше здоровье и комфорт.";
    } else if (query.includes('депресси') || query.includes('грустн')) {
      response = "Послеродовая депрессия - это серьезное состояние. Не стесняйтесь обращаться за помощью к психологу или психиатру. Вы не одиноки, и помощь доступна.";
    } else if (query.includes('восстановлени') || query.includes('спорт')) {
      response = "Восстановление после родов требует времени. Начните с легких упражнений только после разрешения врача. Не торопитесь - ваше тело прошло через многое.";
    } else {
      response = "Послеродовой период - время восстановления. Не забывайте заботиться о себе, обращайтесь за помощью к близким и специалистам. Вы делаете отличную работу!";
    }
  }
  // Ответы для ухода за ребенком
  else if (stage === 'childcare') {
    if (query.includes('плач') || query.includes('кричит')) {
      response = "Плач - это способ общения малыша. Проверьте: голоден ли, нужна ли смена подгузника, не жарко ли. Если плач не прекращается, обратитесь к педиатру.";
    } else if (query.includes('сон') || query.includes('спать')) {
      response = "Сон новорожденного нерегулярный. Создайте спокойную обстановку, следите за температурой в комнате. Помните: каждый ребенок индивидуален.";
    } else if (query.includes('кормлени') || query.includes('еда')) {
      response = "Кормление по требованию - лучший подход для новорожденных. Следите за признаками голода и сытости. При проблемах с кормлением обратитесь к педиатру.";
    } else {
      response = "Уход за ребенком - это обучение. Не бойтесь задавать вопросы педиатру, обращайтесь за поддержкой к близким. Вы отличный родитель!";
    }
  }
  else {
    response = "Спасибо за ваш вопрос! Помните, что при любых сомнениях лучше обратиться к специалисту. Ваше здоровье и благополучие важны.";
  }
  
  return {
    success: true,
    response: response
  };
}
