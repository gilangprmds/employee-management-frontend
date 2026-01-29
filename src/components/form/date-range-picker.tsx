// DateRangePicker.tsx (VERSI FIXED TYPE)
import { useEffect, useRef, useState } from "react";
import flatpickr from "flatpickr";
import { Indonesian } from "flatpickr/dist/l10n/id"; // Import locale Indonesia
import "flatpickr/dist/flatpickr.css";
import { CalenderIcon } from "../../icons";
import Label from "./Label";
import { differenceInDays, format } from "date-fns";

type DateRangePickerProps = {
  id: string;
  label?: string;
  placeholder?: string;
  maxRange?: number;
  onChange: (startDate: string, endDate: string) => void;
  startDate?: string;
  endDate?: string;
};

export default function DateRangePicker({
  id,
  label,
  placeholder = "Pilih rentang tanggal",
  maxRange = 31,
  onChange,
  startDate,
  endDate,
}: DateRangePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const flatpickrInstanceRef = useRef<any>(null);
  const [internalValue, setInternalValue] = useState("");

  // Format untuk display (dd/MM/yyyy)
  const formatForDisplay = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Parse string ke Date
  const parseDateString = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    } catch {
      return null;
    }
  };

  // Update display value
  const updateDisplayValue = (start?: string, end?: string) => {
    if (!start || !end) {
      setInternalValue("");
      return;
    }

    const startDate = parseDateString(start);
    const endDate = parseDateString(end);

    if (startDate && endDate) {
      const formatted = `${formatForDisplay(startDate)} - ${formatForDisplay(endDate)}`;
      setInternalValue(formatted);
    }
  };

  // Inisialisasi flatpickr
  useEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement) return;

    // Siapkan default dates
    let defaultDates: Date[] = [];
    const start = parseDateString(startDate);
    const end = parseDateString(endDate);

    if (start && end) {
      defaultDates = [start, end];
    }

    // Gunakan locale Indonesia dari flatpickr
    const options: flatpickr.Options.Options = {
      mode: "range",
      dateFormat: "Y-m-d",
      maxDate: "today",
      defaultDate: defaultDates,
      locale: Indonesian, // Gunakan locale yang sudah ada
      onChange: (selectedDates: Date[]) => {
        if (selectedDates.length === 2) {
          const start = format(selectedDates[0], "yyyy-MM-dd");
          const end = format(selectedDates[1], "yyyy-MM-dd");

          // Validasi range
          const diff = differenceInDays(selectedDates[1], selectedDates[0]);
          if (diff > maxRange) {
            alert(`Rentang maksimal ${maxRange} hari`);
            return;
          }

          onChange(start, end);
          updateDisplayValue(start, end);
        }
      },
    };

    // Inisialisasi flatpickr
    flatpickrInstanceRef.current = flatpickr(inputElement, options);

    // Set initial display value
    updateDisplayValue(startDate, endDate);

    return () => {
      if (flatpickrInstanceRef.current) {
        flatpickrInstanceRef.current.destroy();
      }
    };
  }, []); // Hanya dijalankan sekali

  // Update ketika props berubah
  useEffect(() => {
    if (flatpickrInstanceRef.current && startDate && endDate) {
      const start = parseDateString(startDate);
      const end = parseDateString(endDate);

      if (start && end) {
        flatpickrInstanceRef.current.setDate([start, end], false);
        updateDisplayValue(startDate, endDate);
      }
    } else if (!startDate || !endDate) {
      setInternalValue("");
    }
  }, [startDate, endDate]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          placeholder={placeholder}
          value={internalValue}
          readOnly
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 pr-10 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-emerald-600/20 dark:border-gray-700 dark:focus:border-brand-800"
        />
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
