"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppData } from "@/hooks/use-app-data";
import { useTranslation } from "@/hooks/use-translation";

const symptomSchema = z.object({
  symptom: z.string()
    .min(1, "Опишите симптом")
    .max(500, "Описание симптома не должно превышать 500 символов"),
  severity: z.enum(["low", "medium", "high"], {
    required_error: "Выберите степень тяжести",
  }),
  time: z.string().min(1, "Укажите время"),
  comment: z.string()
    .max(1000, "Комментарий не должен превышать 1000 символов")
    .optional(),
});

interface SymptomFormProps {
  setFormOpen: (open: boolean) => void;
  selectedDate: Date;
}

export function SymptomForm({ setFormOpen, selectedDate }: SymptomFormProps) {
  const { addSymptom } = useAppData();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof symptomSchema>>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      symptom: "",
      severity: "low",
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      comment: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof symptomSchema>) => {
    setIsSubmitting(true);
    
    try {
      console.log('Form values:', values); // Отладочная информация
      
      // Валидация и очистка данных
      const cleanSymptom = {
        id: new Date().toISOString(),
        date: format(selectedDate, 'yyyy-MM-dd'),
        symptom: values.symptom.trim(),
        severity: values.severity,
        time: values.time.trim(),
        comment: (values.comment || "").trim(),
      };

      // Дополнительная валидация
      if (!cleanSymptom.symptom || cleanSymptom.symptom.length === 0) {
        console.error('Симптом не может быть пустым');
        setIsSubmitting(false);
        return;
      }

      if (cleanSymptom.symptom.length > 500) {
        console.error('Описание симптома слишком длинное');
        setIsSubmitting(false);
        return;
      }

      console.log('New symptom:', cleanSymptom); // Отладочная информация
      
      addSymptom(cleanSymptom);
      setFormOpen(false);
      form.reset();
    } catch (error) {
      console.error('Ошибка при добавлении симптома:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="symptom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('symptomForm.symptom')}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t('symptomForm.symptomPlaceholder')} 
                  {...field} 
                  maxLength={500}
                />
              </FormControl>
              <div className="text-sm text-muted-foreground">
                {field.value?.length || 0}/500 {t('symptomForm.characters')}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('symptomForm.severity')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('symptomForm.severity')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">{t('symptomForm.severityLow')}</SelectItem>
                  <SelectItem value="medium">{t('symptomForm.severityMedium')}</SelectItem>
                  <SelectItem value="high">{t('symptomForm.severityHigh')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('symptomForm.time')}</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('symptomForm.comment')}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t('symptomForm.commentPlaceholder')} 
                  {...field} 
                  className="min-h-[80px]"
                  maxLength={1000}
                />
              </FormControl>
              <div className="text-sm text-muted-foreground">
                {field.value?.length || 0}/1000 {t('symptomForm.characters')}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('common.loading') : t('symptomForm.submit')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
