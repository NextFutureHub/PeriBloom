"use client";

import Image from 'next/image';

import { useAppData } from '@/hooks/use-app-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/componentsin/ui/progress';

export default function EducationPage() {
  const { getEducationalModules, educationProgress, toggleLessonComplete } = useAppData();
  const educationalModules = getEducationalModules();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold font-headline">Образовательные модули</h2>
        <p className="text-muted-foreground">Знания, которые помогут вам чувствовать себя увереннее.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {educationalModules.map((module) => {
          const completedLessons = module.lessons.filter(lesson => educationProgress[lesson.id]).length;
          const progress = (completedLessons / module.lessons.length) * 100;

          return (
            <Card key={module.id}>
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <Image
                    src={module.image}
                    alt={module.title}
                    fill
                    className="object-cover rounded-t-lg"
                    data-ai-hint="healthy food"
                  />
                </div>
                <div className="p-6">
                    <CardTitle>{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="lessons">
                    <AccordionTrigger>Уроки</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-3">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center">
                            <Checkbox
                              id={`lesson-${lesson.id}`}
                              checked={!!educationProgress[lesson.id]}
                              onCheckedChange={() => toggleLessonComplete(lesson.id)}
                              className="mr-3"
                            />
                            <label
                              htmlFor={`lesson-${lesson.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {lesson.title}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              <CardFooter className="flex-col items-start">
                <p className="text-sm text-muted-foreground mb-2">Прогресс: {completedLessons} из {module.lessons.length}</p>
                <Progress value={progress} className="w-full h-2" />
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
