import React, { useState } from 'react';
import { useAppData } from '@/hooks/use-app-data';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, BookHeart, Eye, EyeOff } from 'lucide-react';
import { differenceInWeeks, differenceInMonths, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import PregnancySky from '@/components/PregnancySky';

export default function DashboardPage() {
  const { userData } = useAppData();
  const { t } = useTranslation();
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

  const { value } = getStatus();

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
      <div className="absolute top-6 right-6 z-30">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowElements(!showElements);
          }}
          className="bg-gradient-to-r from-slate-50/95 to-slate-100/95 backdrop-blur-xl border-slate-200/50 hover:from-slate-100/95 hover:to-slate-200/95 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {showElements ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="ml-2 font-medium">{showElements ? t('dashboard.hide') : t('dashboard.show')}</span>
        </Button>
      </div>
      
      {/* Предупреждение о переходе в режим покоя */}
      {showMeditationWarning && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-gradient-to-r from-amber-50/95 to-orange-50/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-amber-200/50 text-center animate-pulse">
            <div className="w-3 h-3 bg-amber-400 rounded-full mx-auto mb-3 animate-ping"></div>
            <h3 className="text-xl font-bold text-amber-800 mb-2">{t('dashboard.meditationWarning')}</h3>
            <p className="text-sm text-amber-700 font-medium">
              {t('dashboard.meditationWarningDesc')}
            </p>
          </div>
        </div>
      )}

      {/* Подсказка когда элементы скрыты */}
      {!showElements && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-slate-50/95 to-gray-50/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-slate-200/50 text-center">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 animate-pulse"></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {isMeditationMode ? t('dashboard.meditationMode') : t('dashboard.meditationModeActive')}
            </h3>
            <p className="text-sm text-slate-600 font-medium">
              {isMeditationMode
                ? t('dashboard.meditationModeDesc')
                : t('dashboard.meditationModeActiveDesc')
              }
            </p>
          </div>
        </div>
      )}
      
      {/* Основной контент */}
      <div className={`relative z-10 min-h-screen p-6 transition-all duration-500 ${showElements ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        {/* Приветственная секция */}
        <div className="bg-gradient-to-br from-slate-50/95 to-white/95 backdrop-blur-xl rounded-3xl p-10 mb-6 shadow-2xl border border-slate-200/50">
          <div className="text-center space-y-6">
            <div className="relative">
              <h1 className="text-5xl font-bold font-headline bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('dashboard.welcome', { name: userData?.name })}
              </h1>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse"></div>
            </div>
            <p className="text-xl text-slate-600 font-medium">{t('dashboard.subtitle')}</p>
          </div>
        </div>

        {/* Основные карточки */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Карточка недели беременности */}
          <Card className="bg-gradient-to-br from-indigo-50/95 to-purple-50/95 backdrop-blur-xl border border-indigo-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:from-indigo-100/95 hover:to-purple-100/95">
            <CardHeader className="text-center pb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-7xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                {value}
              </div>
              <p className="text-sm text-indigo-600 font-medium">{t('dashboard.weekOfPregnancy')}</p>
            </CardContent>
          </Card>
          
          {/* Карточка рекомендации */}
          <Card className="bg-gradient-to-br from-emerald-50/95 to-teal-50/95 backdrop-blur-xl border border-emerald-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:from-emerald-100/95 hover:to-teal-100/95 md:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <div className="w-5 h-5 bg-white rounded-full"></div>
                </div>
                <CardTitle className="text-2xl font-bold text-emerald-700">{t('dashboard.recommendation')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-lg leading-relaxed font-medium mb-6">
                {t('dashboard.recommendationText')}
              </p>
              <Button variant="link" className="px-0 text-emerald-600 hover:text-emerald-700 font-semibold group">
                {t('dashboard.learnMore')} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Быстрые действия */}
        <div className="mt-8">
        <h2 className="text-4xl font-bold font-headline text-center mb-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {t('dashboard.quickActions')}
        </h2>
          
          <div className="flex flex-col items-center space-y-4">
            {/* Основная карточка - всегда видна */}
            <Link to="/app/symptom-journal" className="w-full max-w-sm">
              <Card className="bg-gradient-to-br from-rose-50/95 to-pink-50/95 backdrop-blur-xl border border-rose-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:from-rose-100/95 hover:to-pink-100/95 group">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto mb-6 p-5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl w-20 h-20 flex items-center justify-center group-hover:from-rose-600 group-hover:to-pink-600 transition-all duration-300 shadow-lg">
                    <BookHeart className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-rose-700">{t('dashboard.addSymptom')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 font-medium">{t('dashboard.addSymptomDesc')}</p>
                </CardContent>
              </Card>
            </Link>

            {/* Кнопка показать больше */}
            {!showAllActions && (
              <Button
                variant="outline"
                onClick={() => setShowAllActions(true)}
                className="bg-gradient-to-r from-slate-50/95 to-gray-50/95 backdrop-blur-xl border-slate-200/50 hover:from-slate-100/95 hover:to-gray-100/95 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                {t('dashboard.showMore')}
              </Button>
            )}

            {/* Дополнительные карточки */}
            {showAllActions && (
              <div className="grid gap-6 md:grid-cols-2 w-full max-w-4xl">
            <Link to="/app/ai-health">
              <Card className="bg-gradient-to-br from-blue-50/95 to-indigo-50/95 backdrop-blur-xl border border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:from-blue-100/95 hover:to-indigo-100/95 group">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto mb-6 p-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl w-20 h-20 flex items-center justify-center group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300 shadow-lg">
                    <Bot className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-blue-700">{t('dashboard.aiAssistant')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 font-medium">{t('dashboard.aiAssistantDesc')}</p>
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
                className="text-slate-500 hover:text-slate-700 font-semibold hover:bg-slate-50/50 rounded-xl px-6 py-2 transition-all duration-300"
              >
                {t('dashboard.showLess')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
