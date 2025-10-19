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

const symptomSchema = z.object({
  symptom: z.string().min(1, "Опишите симптом"),
  severity: z.enum(["low", "medium", "high"], {
    required_error: "Выберите степень тяжести",
  }),
  time: z.string().min(1, "Укажите время"),
  comment: z.string().optional(),
});

interface SymptomFormProps {
  setFormOpen: (open: boolean) => void;
  selectedDate: Date;
}

export function SymptomForm({ setFormOpen, selectedDate }: SymptomFormProps) {
  const { addSymptom } = useAppData();
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
    
    console.log('Form values:', values); // Отладочная информация
    
    const newSymptom = {
      id: new Date().toISOString(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      symptom: values.symptom,
      severity: values.severity,
      time: values.time,
      comment: values.comment || "",
    };

    console.log('New symptom:', newSymptom); // Отладочная информация
    
    addSymptom(newSymptom);
    setFormOpen(false);
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="symptom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Симптом</FormLabel>
              <FormControl>
                <Input placeholder="Опишите ваш симптом..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Степень тяжести</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите степень тяжести" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Низкая</SelectItem>
                  <SelectItem value="medium">Средняя</SelectItem>
                  <SelectItem value="high">Высокая</SelectItem>
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
              <FormLabel>Время</FormLabel>
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
              <FormLabel>Комментарий (необязательно)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Дополнительные детали..." 
                  {...field} 
                  className="min-h-[80px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
            Отмена
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Добавление..." : "Добавить запись"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
