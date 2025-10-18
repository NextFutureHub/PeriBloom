"use client";

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { Calendar } from '@/components/ui/calendar';
import type { Symptom } from '@/lib/types';
import { cn } from '@/lib/utils';

type SymptomCalendarProps = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  symptoms: Symptom[];
};

export default function SymptomCalendar({
  selectedDate,
  setSelectedDate,
  symptoms,
}: SymptomCalendarProps) {
  const symptomDates = symptoms.map((symptom) => new Date(symptom.date));

  const modifiers = {
    hasSymptom: symptomDates,
  };

  const modifiersStyles = {
    hasSymptom: {
      position: 'relative' as const,
    },
  };
  
  const SymptomDot = () => <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />;

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={(date) => date && setSelectedDate(date)}
      className="p-3"
      locale={ru}
      modifiers={modifiers}
      modifiersStyles={modifiersStyles}
      components={{
        DayContent: (props) => {
            const isSymptomDay = props.date && symptomDates.some(d => format(d, 'yyyy-MM-dd') === format(props.date, 'yyyy-MM-dd'));
            return (
                <div className="relative">
                    <span>{format(props.date, 'd')}</span>
                    {isSymptomDay && <SymptomDot />}
                </div>
            )
        }
      }}
    />
  );
}
