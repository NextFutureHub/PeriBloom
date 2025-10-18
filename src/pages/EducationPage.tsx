import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Heart, Baby, Stethoscope } from 'lucide-react';

export default function EducationPage() {
  const educationTopics = [
    {
      title: 'Беременность',
      description: 'Все о беременности: от зачатия до родов',
      icon: Heart,
      topics: ['Питание во время беременности', 'Физические упражнения', 'Подготовка к родам', 'Эмоциональное здоровье']
    },
    {
      title: 'Послеродовой период',
      description: 'Восстановление после родов и уход за собой',
      icon: Stethoscope,
      topics: ['Восстановление организма', 'Грудное вскармливание', 'Послеродовая депрессия', 'Физическая активность']
    },
    {
      title: 'Уход за ребенком',
      description: 'Основы ухода за новорожденным',
      icon: Baby,
      topics: ['Кормление', 'Сон новорожденного', 'Гигиена', 'Развитие ребенка']
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold font-headline">Образовательные материалы</h2>
        <p className="text-muted-foreground">Изучайте важную информацию о беременности, родах и уходе за ребенком</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {educationTopics.map((topic, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <topic.icon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>{topic.title}</CardTitle>
                  <CardDescription>{topic.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {topic.topics.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
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
