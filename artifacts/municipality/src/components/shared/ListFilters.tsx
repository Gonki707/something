import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useLocation } from "wouter";

interface YearCount {
  year: number;
  count: number;
}

interface ListFiltersProps {
  q?: string;
  year?: number;
  category?: string;
  status?: string;
  availableYears?: YearCount[];
  availableCategories?: string[];
  availableStatuses?: string[];
  onFilterChange: (key: string, value: any) => void;
}

export function ListFilters({
  q,
  year,
  category,
  status,
  availableYears,
  availableCategories,
  availableStatuses,
  onFilterChange
}: ListFiltersProps) {
  const [searchValue, setSearchValue] = useState(q || "");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== q) {
        onFilterChange("q", searchValue || undefined);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, q, onFilterChange]);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 bg-card p-4 rounded-lg border shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Пребарувај..."
          className="pl-9"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      {availableYears && availableYears.length > 0 && (
        <Select 
          value={year ? year.toString() : "all"} 
          onValueChange={(val) => onFilterChange("year", val === "all" ? undefined : parseInt(val))}
        >
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="Сите години" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Сите години</SelectItem>
            {availableYears.map(y => (
              <SelectItem key={y.year} value={y.year.toString()}>
                {y.year} ({y.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {availableCategories && availableCategories.length > 0 && (
        <Select 
          value={category || "all"} 
          onValueChange={(val) => onFilterChange("category", val === "all" ? undefined : val)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Сите категории" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Сите категории</SelectItem>
            {availableCategories.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {availableStatuses && availableStatuses.length > 0 && (
        <Select 
          value={status || "all"} 
          onValueChange={(val) => onFilterChange("status", val === "all" ? undefined : val)}
        >
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="Сите статуси" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Сите статуси</SelectItem>
            {availableStatuses.map(s => (
              <SelectItem key={s} value={s}>
                {s === "open" ? "Отворени" : s === "closed" ? "Затворени" : s === "ongoing" ? "Во тек" : s === "completed" ? "Завршени" : s === "planned" ? "Планирани" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
