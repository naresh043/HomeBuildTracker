import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { DayPicker, type Matcher } from "react-day-picker";

import "react-day-picker/style.css";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  disabled = false,
  placeholder = "Select date",
  minDate,
  maxDate,
}: DatePickerProps) {
  const parsedDate = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;

  const selectedDate =
    parsedDate && isValid(parsedDate) ? parsedDate : undefined;

  /*
   * Build the disabled matcher safely.
   *
   * We only add `before` when minDate exists
   * and only add `after` when maxDate exists.
   */
  const disabledDates: Matcher[] = [];

  if (minDate) {
    disabledDates.push({ before: minDate });
  }

  if (maxDate) {
    disabledDates.push({ after: maxDate });
  }

  return (
    <div className="relative w-full">
      <details className="group">
        <summary
          className={[
            "flex h-11 w-full list-none items-center gap-3 rounded-xl border",
            "bg-background px-3 text-sm outline-none transition-colors",
            "hover:border-primary/50",
            "focus-within:border-primary",
            "focus-within:ring-2 focus-within:ring-primary/10",
            disabled
              ? "pointer-events-none cursor-not-allowed opacity-60"
              : "cursor-pointer",
          ].join(" ")}
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />

          <span
            className={
              selectedDate ? "text-foreground" : "text-muted-foreground"
            }
          >
            {selectedDate ? format(selectedDate, "dd MMM yyyy") : placeholder}
          </span>
        </summary>

        <div className="absolute left-0 top-full z-[100] mt-2 w-fit rounded-2xl border bg-background p-3 shadow-xl">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) {
                onChange("");
                return;
              }

              onChange(format(date, "yyyy-MM-dd"));

              const details = document.activeElement?.closest("details");

              if (details instanceof HTMLDetailsElement) {
                details.open = false;
              }
            }}
            disabled={
              disabled
                ? true
                : disabledDates.length > 0
                  ? disabledDates
                  : undefined
            }
            showOutsideDays
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left" ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                ),
            }}
          />
        </div>
      </details>
    </div>
  );
}
