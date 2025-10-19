"use client";

import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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

  return (
    <div className="p-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && setSelectedDate(date)}
        className="rounded-md border"
        components={{
          Day: ({ date, displayMonth, ...props }) => {
            const symptomCount = getSymptomCountForDate(date);
            const severity = getSeverityForDate(date);
            const isSelected = selectedDate && 
              date.getDate() === selectedDate.getDate() && 
              date.getMonth() === selectedDate.getMonth() && 
              date.getFullYear() === selectedDate.getFullYear();
            
            return (
              <button
                {...props}
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center p-0 text-sm font-normal hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                )}
                onClick={() => setSelectedDate(date)}
              >
                {date.getDate()}
                {symptomCount > 0 && (
                  <div className="absolute -bottom-1 -right-1">
                    <Badge 
                      variant={severity === 'high' ? 'destructive' : severity === 'medium' ? 'secondary' : 'default'}
                      className={cn(
                        "h-5 w-5 rounded-full p-0 text-xs",
                        severity === 'medium' && 'bg-yellow-200 text-yellow-800'
                      )}
                    >
                      {symptomCount}
                    </Badge>
                  </div>
                )}
              </button>
            );
          }
        }}
      />
    </div>
  );
}