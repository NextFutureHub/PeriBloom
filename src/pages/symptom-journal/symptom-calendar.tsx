"use client";

import Calendar from 'react-calendar';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

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

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const symptomCount = getSymptomCountForDate(date);
      const severity = getSeverityForDate(date);
      
      if (symptomCount > 0) {
        return (
          <div className="absolute -bottom-1 -right-1 z-10">
            <Badge 
              variant={severity === 'high' ? 'destructive' : severity === 'medium' ? 'secondary' : 'default'}
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-xs flex items-center justify-center",
                severity === 'medium' && 'bg-yellow-200 text-yellow-800'
              )}
            >
              {symptomCount}
            </Badge>
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const isSelected = selectedDate && 
        date.getDate() === selectedDate.getDate() && 
        date.getMonth() === selectedDate.getMonth() && 
        date.getFullYear() === selectedDate.getFullYear();
      
      return cn(
        "relative",
        isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
      );
    }
    return null;
  };

  return (
    <div className="p-2 sm:p-4">
      <style>{`
        .react-calendar {
          width: 100%;
          max-width: 100%;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-family: inherit;
        }
        
        .react-calendar__navigation {
          display: flex;
          height: 44px;
          margin-bottom: 1em;
          align-items: center;
          justify-content: space-between;
        }
        
        .react-calendar__navigation button {
          min-width: 44px;
          background: none;
          border: none;
          font-size: 16px;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: #f1f5f9;
          border-radius: 0.375rem;
        }
        
        .react-calendar__navigation button[disabled] {
          background-color: #f0f0f0;
        }
        
        .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 0.75rem;
          padding: 0.5rem 0;
        }
        
        .react-calendar__month-view__weekdays__weekday {
          padding: 0.5rem;
          font-size: 0.75rem;
          color: #64748b;
        }
        
        .react-calendar__month-view__days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
        }
        
        .react-calendar__tile {
          max-width: 100%;
          padding: 0.5rem;
          background: none;
          border: none;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          min-height: 2.5rem;
          aspect-ratio: 1;
        }
        
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: #f1f5f9;
          border-radius: 0.375rem;
        }
        
        .react-calendar__tile--now {
          background-color: #f1f5f9;
          border-radius: 0.375rem;
        }
        
        .react-calendar__tile--active {
          background-color: #3b82f6;
          color: white;
          border-radius: 0.375rem;
        }
        
        .react-calendar__tile--active:enabled:hover,
        .react-calendar__tile--active:enabled:focus {
          background-color: #2563eb;
        }
        
        .react-calendar__tile--hasActive {
          background-color: #3b82f6;
          color: white;
          border-radius: 0.375rem;
        }
        
        .react-calendar__tile--hasActive:enabled:hover,
        .react-calendar__tile--hasActive:enabled:focus {
          background-color: #2563eb;
        }
        
        .react-calendar__tile--neighboringMonth {
          color: #94a3b8;
        }
        
        @media (max-width: 640px) {
          .react-calendar__tile {
            min-height: 2rem;
            font-size: 0.75rem;
            padding: 0.25rem;
          }
          
          .react-calendar__month-view__weekdays__weekday {
            font-size: 0.625rem;
            padding: 0.25rem;
          }
        }
      `}</style>
      
      <Calendar
        onChange={(value) => setSelectedDate(value as Date)}
        value={selectedDate}
        tileContent={tileContent}
        tileClassName={tileClassName}
        navigationLabel={({ date }) => {
          const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
          ];
          return `${months[date.getMonth()]} ${date.getFullYear()}`;
        }}
        formatShortWeekday={(_, date) => {
          const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
          return weekdays[date.getDay()];
        }}
        prevLabel={<ChevronLeft className="h-4 w-4" />}
        nextLabel={<ChevronRight className="h-4 w-4" />}
        prev2Label={null}
        next2Label={null}
        showNeighboringMonth={false}
      />
    </div>
  );
}