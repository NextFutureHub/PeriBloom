import React, { useState } from 'react';
import { useAppData } from '@/hooks/use-app-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, BookHeart, HeartPulse, Eye, EyeOff } from 'lucide-react';
import { differenceInWeeks, differenceInMonths, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import PregnancySky from '@/components/PregnancySky';

export default function DashboardPage() {
  const { userData } = useAppData();
  const [showElements, setShowElements] = useState(true);
  const [showAllActions, setShowAllActions] = useState(false);
  const [isMeditationMode, setIsMeditationMode] = useState(false);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [showMeditationWarning, setShowMeditationWarning] = useState(false);
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null);

  const getStatus = () => {
    if (!userData) return { title: '', value: '' };

    const now = new Date();
    switch (userData.lifecycleStage) {
      case 'pregnancy':
        if (!userData.dueDate) return { title: '', value: '' };
        const dueDate = new Date(userData.dueDate);
        const lmpDate = new Date(dueDate.getTime() - 40 * 7 * 24 * 60 * 60 * 1000);
        const weeks = differenceInWeeks(now, lmpDate);
        return { title: 'Неделя беременности', value: `${weeks}` };
      case 'postpartum':
      case 'childcare':
        if (!userData.birthDate) return { title: '', value: '' };
        const birthDate = new Date(userData.birthDate);
        const months = differenceInMonths(now, birthDate);
        const days = differenceInDays(now, birthDate) % 30;
        if (months > 0) {
            return { title: 'Возраст ребенка', value: `${months} мес. ${days} д.` };
        }
        return { title: 'Возраст ребенка', value: `${days} д.` };
      default:
        return { title: '', value: '' };
    }
  };

  const { title, value } = getStatus();

  // Получаем текущую неделю беременности для фона
  const getCurrentWeek = () => {
    if (!userData || userData.lifecycleStage !== 'pregnancy' || !userData.dueDate) {
      return 1;
    }
    const now = new Date();
    const dueDate = new Date(userData.dueDate);
    const lmpDate = new Date(dueDate.getTime() - 40 * 7 * 24 * 60 * 60 * 1000);
    const weeks = differenceInWeeks(now, lmpDate);
    return Math.max(1, Math.min(40, weeks));
  };

  const currentWeek = getCurrentWeek();

  // Автоматический режим покоя через 5 минут неактивности
  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    if (warningTimer) {
      clearTimeout(warningTimer);
    }
    
    // Предупреждение за 30 секунд до перехода в режим покоя
    const newWarningTimer = setTimeout(() => {
      setShowMeditationWarning(true);
    }, 4.5 * 60 * 1000); // 4.5 минуты
    
    // Переход в режим покоя через 5 минут
    const newTimer = setTimeout(() => {
      setIsMeditationMode(true);
      setShowElements(false);
      setShowMeditationWarning(false);
    }, 5 * 60 * 1000); // 5 минут
    
    setWarningTimer(newWarningTimer);
    setInactivityTimer(newTimer);
  };

  const handleUserActivity = () => {
    if (isMeditationMode) {
      setIsMeditationMode(false);
      setShowElements(true);
    }
    if (showMeditationWarning) {
      setShowMeditationWarning(false);
    }
    resetInactivityTimer();
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Клик только на фон, не на элементы
    if (e.target === e.currentTarget) {
      setShowElements(!showElements);
    }
    handleUserActivity();
  };

  // Добавляем обработчики активности
  React.useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });
    
    resetInactivityTimer();
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      if (warningTimer) {
        clearTimeout(warningTimer);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen" onClick={handleBackgroundClick}>
      {/* 3D фон */}
      <PregnancySky 
        currentWeek={currentWeek} 
        maxStars={isMeditationMode ? 200 : 1000} 
        animate={!isMeditationMode} 
      />
      
      {/* Кнопка переключения видимости */}
      <div className="absolute top-4 right-4 z-30">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowElements(!showElements);
          }}
          className="bg-white/90 backdrop-blur-md border-white/20 hover:bg-white/95"
        >
          {showElements ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="ml-2">{showElements ? 'Скрыть' : 'Показать'}</span>
        </Button>
      </div>
      
      {/* Предупреждение о переходе в режим покоя */}
      {showMeditationWarning && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-orange-50 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-orange-200 text-center animate-pulse">
            <h3 className="text-lg font-bold text-orange-800 mb-1">⏰ Скоро режим покоя</h3>
            <p className="text-sm text-orange-600">
              Через 30 секунд интерфейс скроется для медитации. Коснитесь экрана, чтобы остаться активным.
            </p>
          </div>
        </div>
      )}

      {/* Подсказка когда элементы скрыты */}
      {!showElements && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {isMeditationMode ? "🧘 Режим покоя" : "🌟 Режим медитации"}
            </h3>
            <p className="text-sm text-gray-600">
              {isMeditationMode 
                ? "Коснитесь экрана для возврата к интерфейсу" 
                : "Наслаждайтесь звёздным небом и бьющимся сердцем"
              }
            </p>
          </div>
        </div>
      )}
      
      {/* Основной контент */}
      <div className={`relative z-10 min-h-screen transition-all duration-500 ${showElements ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        {/* Приветственная секция */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 m-6 shadow-2xl border border-white/20">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Добро пожаловать, {userData?.name}!
            </h1>
            <p className="text-lg text-muted-foreground">Готовы помочь вам на каждом шагу вашего пути</p>
          </div>
        </div>

        {/* Основные карточки */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-6">
          {/* Карточка недели беременности */}
          <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-purple-600">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {value}
              </div>
              <p className="text-sm text-muted-foreground">неделя беременности</p>
            </CardContent>
          </Card>
          
          {/* Карточка рекомендации */}
          <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-green-600">💡 Рекомендация дня</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Не забывайте пить достаточно воды в течение дня. Гидратация важна для вас и вашего малыша. 
                Попробуйте выпивать не менее 8 стаканов воды.
              </p>
              <Button variant="link" className="px-0 mt-4 text-green-600 hover:text-green-700">
                Узнать больше <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Быстрые действия */}
        <div className="px-6 mt-8">
          <h2 className="text-3xl font-bold font-headline text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Быстрые действия
          </h2>
          
          <div className="flex flex-col items-center space-y-4">
            {/* Основная карточка - всегда видна */}
            <Link to="/app/symptom-journal" className="w-full max-w-sm">
              <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                    <BookHeart className="h-8 w-8 text-pink-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">Добавить симптом</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">Запишите свое самочувствие, чтобы отслеживать изменения.</p>
                </CardContent>
              </Card>
            </Link>

            {/* Кнопка показать больше */}
            {!showAllActions && (
              <Button 
                variant="outline" 
                onClick={() => setShowAllActions(true)}
                className="bg-white/90 backdrop-blur-md border-white/20 hover:bg-white/95"
              >
                Показать больше действий
              </Button>
            )}

            {/* Дополнительные карточки */}
            {showAllActions && (
              <div className="grid gap-6 md:grid-cols-2 w-full max-w-4xl">
                <Link to="/app/ai-assistant">
                  <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Bot className="h-8 w-8 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-800">AI-ассистент</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground">Задайте вопрос и получите персональный совет.</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link to="/app/triage">
                  <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4 p-4 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <HeartPulse className="h-8 w-8 text-red-600" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-800">Triage-анализ</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground">Оцените свои симптомы с помощью AI.</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            )}

            {/* Кнопка скрыть */}
            {showAllActions && (
              <Button 
                variant="ghost" 
                onClick={() => setShowAllActions(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                Скрыть дополнительные действия
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
