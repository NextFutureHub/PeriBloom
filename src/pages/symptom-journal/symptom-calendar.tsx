"use client";

import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { buttonVariants } from "@/components/ui/button";

interface SymptomCalendarProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  symptoms: Array<{
    id: string;
    date: string;
    symptom: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export default function SymptomCalendar({ selectedDate, setSelectedDate, symptoms }: SymptomCalendarProps) {
  const getSymptomCountForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = symptoms.filter(symptom => symptom.date === dateStr).length;
    if (count > 0) {
      console.log(`Date ${dateStr} has ${count} symptoms:`, symptoms.filter(symptom => symptom.date === dateStr));
    }
    return count;
  };

  const getSeverityForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const daySymptoms = symptoms.filter(symptom => symptom.date === dateStr);
    if (daySymptoms.length === 0) return null;
    
    const hasHigh = daySymptoms.some(s => s.severity === 'high');
    const hasMedium = daySymptoms.some(s => s.severity === 'medium');
    
    if (hasHigh) return 'high';
    if (hasMedium) return 'medium';
    return 'low';
  };

  const modifiers = {
    hasSymptoms: (date: Date) => getSymptomCountForDate(date) > 0,
    highSeverity: (date: Date) => getSeverityForDate(date) === 'high',
    mediumSeverity: (date: Date) => getSeverityForDate(date) === 'medium',
    lowSeverity: (date: Date) => getSeverityForDate(date) === 'low',
  };

  const modifiersClassNames = {
    hasSymptoms: 'relative after:content-[""] after:absolute after:-bottom-1 after:-right-1 after:h-4 after:w-4 after:bg-primary after:rounded-full after:z-10',
    highSeverity: 'border-l-4 border-l-red-500',
    mediumSeverity: 'border-l-4 border-l-yellow-500',
    lowSeverity: 'border-l-4 border-l-green-500',
  };

  return (
    <div className="p-2 sm:p-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => {
          console.log('Calendar onSelect called with:', date);
          console.log('Current selectedDate before update:', selectedDate);
          if (date) {
            setSelectedDate(date);
            console.log('Updated selectedDate to:', date);
          }
        }}
        locale={ru}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
          day_disabled: "text-muted-foreground opacity-50",
          day_hidden: "invisible",
        }}
      />
    </div>
  );
}