import React, { useState } from 'react';
import { useAppData } from '@/hooks/use-app-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Baby, 
  Stethoscope, 
  CheckCircle, 
  Circle, 
  Play, 
  Clock,
  Star,
  Award,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface EducationalModule {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  lessons: Lesson[];
  prerequisites?: string[];
}

export default function EducationPage() {
  const { educationProgress, toggleLessonComplete } = useAppData();
  const [selectedModule, setSelectedModule] = useState<EducationalModule | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const educationalModules: EducationalModule[] = [
    {
      id: 'pregnancy-basics',
      title: 'Основы беременности',
      description: 'Все о беременности: от зачатия до родов',
      icon: Heart,
      color: 'text-pink-600',
      lessons: [
        {
          id: 'pregnancy-nutrition',
          title: 'Питание во время беременности',
          description: 'Правильное питание для здоровой беременности',
          duration: '15 мин',
          difficulty: 'easy',
          content: 'Узнайте о важности сбалансированного питания, необходимых витаминах и минералах, а также о продуктах, которых следует избегать во время беременности.'
        },
        {
          id: 'pregnancy-exercise',
          title: 'Физические упражнения',
          description: 'Безопасные упражнения для беременных',
          duration: '20 мин',
          difficulty: 'medium',
          content: 'Изучите безопасные виды физической активности, упражнения для укрепления мышц таза и спины, а также техники дыхания.'
        },
        {
          id: 'pregnancy-preparation',
          title: 'Подготовка к родам',
          description: 'Как подготовиться к родам',
          duration: '25 мин',
          difficulty: 'medium',
          content: 'Подготовка к родам включает в себя физическую и психологическую подготовку, выбор роддома, сбор сумки в роддом и изучение техник дыхания.'
        },
        {
          id: 'pregnancy-emotional',
          title: 'Эмоциональное здоровье',
          description: 'Поддержание эмоционального благополучия',
          duration: '18 мин',
          difficulty: 'easy',
          content: 'Важность эмоционального здоровья во время беременности, способы управления стрессом и тревогой, поддержка близких.'
        }
      ]
    },
    {
      id: 'postpartum-care',
      title: 'Послеродовой период',
      description: 'Восстановление после родов и уход за собой',
      icon: Stethoscope,
      color: 'text-blue-600',
      lessons: [
        {
          id: 'postpartum-recovery',
          title: 'Восстановление организма',
          description: 'Физическое восстановление после родов',
          duration: '22 мин',
          difficulty: 'medium',
          content: 'Процесс восстановления организма после родов, изменения в теле, уход за швами и восстановление тонуса мышц.'
        },
        {
          id: 'breastfeeding',
          title: 'Грудное вскармливание',
          description: 'Основы успешного грудного вскармливания',
          duration: '30 мин',
          difficulty: 'hard',
          content: 'Техники правильного прикладывания, решение проблем с лактацией, режим кормления и уход за грудью.'
        },
        {
          id: 'postpartum-depression',
          title: 'Послеродовая депрессия',
          description: 'Понимание и преодоление послеродовой депрессии',
          duration: '25 мин',
          difficulty: 'hard',
          content: 'Признаки послеродовой депрессии, факторы риска, способы получения помощи и поддержки близких.'
        },
        {
          id: 'postpartum-activity',
          title: 'Физическая активность',
          description: 'Возвращение к физической активности',
          duration: '20 мин',
          difficulty: 'medium',
          content: 'Безопасное возвращение к физическим упражнениям после родов, укрепление мышц тазового дна и общее восстановление.'
        }
      ]
    },
    {
      id: 'baby-care',
      title: 'Уход за ребенком',
      description: 'Основы ухода за новорожденным',
      icon: Baby,
      color: 'text-green-600',
      lessons: [
        {
          id: 'baby-feeding',
          title: 'Кормление ребенка',
          description: 'Основы кормления новорожденного',
          duration: '20 мин',
          difficulty: 'medium',
          content: 'Режимы кормления, признаки голода и сытости, техники кормления и решение проблем с кормлением.'
        },
        {
          id: 'baby-sleep',
          title: 'Сон новорожденного',
          description: 'Организация здорового сна',
          duration: '25 мин',
          difficulty: 'hard',
          content: 'Режимы сна новорожденного, создание комфортных условий для сна, решение проблем со сном.'
        },
        {
          id: 'baby-hygiene',
          title: 'Гигиена ребенка',
          description: 'Ежедневный уход за новорожденным',
          duration: '18 мин',
          difficulty: 'easy',
          content: 'Купание, уход за пуповиной, смена подгузников, уход за кожей и ногтями.'
        },
        {
          id: 'baby-development',
          title: 'Развитие ребенка',
          description: 'Этапы развития в первый год',
          duration: '30 мин',
          difficulty: 'medium',
          content: 'Основные этапы физического и эмоционального развития, стимулирование развития и когда обращаться к врачу.'
        }
      ]
    }
  ];

  const getModuleProgress = (module: EducationalModule) => {
    const completedLessons = module.lessons.filter(lesson => educationProgress[lesson.id]);
    return (completedLessons.length / module.lessons.length) * 100;
  };

  const getOverallProgress = () => {
    const allLessons = educationalModules.flatMap(module => module.lessons);
    const completedLessons = allLessons.filter(lesson => educationProgress[lesson.id]);
    return (completedLessons.length / allLessons.length) * 100;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легко';
      case 'medium': return 'Средне';
      case 'hard': return 'Сложно';
      default: return 'Неизвестно';
    }
  };

  const handleLessonComplete = (lessonId: string) => {
    toggleLessonComplete(lessonId);
  };

  const nextLesson = () => {
    if (selectedModule && currentLessonIndex < selectedModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const prevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const backToModules = () => {
    setSelectedModule(null);
    setCurrentLessonIndex(0);
  };

  if (selectedModule) {
    const currentLesson = selectedModule.lessons[currentLessonIndex];
    const isCompleted = educationProgress[currentLesson.id];
    const progress = ((currentLessonIndex + 1) / selectedModule.lessons.length) * 100;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={backToModules} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад к модулям
          </Button>
          <div>
            <h2 className="text-2xl font-semibold font-headline">{selectedModule.title}</h2>
            <p className="text-muted-foreground">{selectedModule.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <selectedModule.icon className={cn("h-8 w-8", selectedModule.color)} />
              <div>
                <h3 className="text-lg font-semibold">Урок {currentLessonIndex + 1} из {selectedModule.lessons.length}</h3>
                <p className="text-sm text-muted-foreground">Прогресс модуля: {Math.round(progress)}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isCompleted ? "default" : "secondary"}>
                {isCompleted ? "Завершено" : "Не завершено"}
              </Badge>
              <Button
                onClick={() => handleLessonComplete(currentLesson.id)}
                variant={isCompleted ? "outline" : "default"}
                className="flex items-center gap-2"
              >
                {isCompleted ? <Circle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                {isCompleted ? "Отметить как незавершенное" : "Завершить урок"}
              </Button>
            </div>
          </div>

          <Progress value={progress} className="w-full" />

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{currentLesson.title}</CardTitle>
                  <CardDescription className="text-base mt-2">{currentLesson.description}</CardDescription>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {currentLesson.duration}
                  </div>
                  <Badge className={getDifficultyColor(currentLesson.difficulty)}>
                    {getDifficultyText(currentLesson.difficulty)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-base leading-relaxed">{currentLesson.content}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevLesson}
              disabled={currentLessonIndex === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Предыдущий урок
            </Button>
            <Button
              onClick={nextLesson}
              disabled={currentLessonIndex === selectedModule.lessons.length - 1}
              className="flex items-center gap-2"
            >
              Следующий урок
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold font-headline">Образовательные материалы</h2>
          <p className="text-muted-foreground">Изучайте важную информацию о беременности, родах и уходе за ребенком</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">Общий прогресс: {Math.round(getOverallProgress())}%</span>
            </div>
            <Progress value={getOverallProgress()} className="w-32 mt-1" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {educationalModules.map((module) => {
          const progress = getModuleProgress(module);
          const completedLessons = module.lessons.filter(lesson => educationProgress[lesson.id]).length;
          
          return (
            <Card 
              key={module.id} 
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedModule(module)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <module.icon className={cn("h-8 w-8", module.color)} />
                    <div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {module.title}
                      </CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{completedLessons}/{module.lessons.length}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Прогресс</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {module.lessons.length} уроков
                      </span>
                    </div>
                    <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                      Начать обучение
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Рекомендуемые ресурсы</CardTitle>
          <CardDescription>Полезные источники информации</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Официальные источники</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Министерство здравоохранения</li>
                <li>• Всемирная организация здравоохранения</li>
                <li>• Научные медицинские журналы</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Поддержка</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Консультации с врачом</li>
                <li>• Группы поддержки</li>
                <li>• Семейные консультанты</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
