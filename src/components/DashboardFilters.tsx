import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, SlidersHorizontal, RefreshCw } from 'lucide-react';

import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LANGUAGES = ['English', 'Hindi', 'Urdu', 'Telugu', 'Tamil', 'Spanish', 'French'];
const INDUSTRIES = ['Hollywood', 'Bollywood', 'Tollywood', 'Lollywood', 'Kollywood'];

interface DashboardFiltersProps {
  initialFilters: {
    languages: string[];
    industries: string[];
    dateRange: string;
  };
  onApplyFilters: (filters: { languages: string[]; industries: string[]; dateRange: string; }) => void;
  loading: boolean;
}

const MultiSelectFilter = ({ title, options, selected, onSelectedChange }: { title: string, options: string[], selected: string[], onSelectedChange: (selected: string[]) => void }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between w-full sm:w-auto">
          <span>{title}</span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => {
                    const newSelected = selected.includes(option)
                      ? selected.filter((item) => item !== option)
                      : [...selected, option];
                    onSelectedChange(newSelected);
                  }}
                >
                  <Checkbox
                    className="mr-2"
                    checked={selected.includes(option)}
                  />
                  <span>{option}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({ initialFilters, onApplyFilters, loading }) => {
  const [filters, setFilters] = useState(initialFilters);
  const currentYear = new Date().getFullYear();

  const handleFilterChange = (type: 'languages' | 'industries' | 'dateRange', value: string[] | string) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const totalFilters = filters.languages.length + filters.industries.length;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <SlidersHorizontal className="w-5 h-5" />
          Filter Your Radar
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4">
        <MultiSelectFilter
          title="Languages"
          options={LANGUAGES}
          selected={filters.languages}
          onSelectedChange={(val) => handleFilterChange('languages', val)}
        />
        <MultiSelectFilter
          title="Industries"
          options={INDUSTRIES}
          selected={filters.industries}
          onSelectedChange={(val) => handleFilterChange('industries', val)}
        />
        <Select
          value={filters.dateRange}
          onValueChange={(val) => handleFilterChange('dateRange', val)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select release date..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Upcoming</SelectItem>
            <SelectItem value="today">Releasing Today</SelectItem>
            <SelectItem value={String(currentYear)}>This Year ({currentYear})</SelectItem>
            <SelectItem value={String(currentYear + 1)}>Next Year ({currentYear + 1})</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => onApplyFilters(filters)} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Resync
        </Button>
      </CardContent>
      {totalFilters > 0 && (
         <CardFooter className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
            {filters.languages.map(f => <Badge key={f} variant="secondary">{f}</Badge>)}
            {filters.industries.map(f => <Badge key={f} variant="secondary">{f}</Badge>)}
            
         </CardFooter>
      )}
    </Card>
  );
};
