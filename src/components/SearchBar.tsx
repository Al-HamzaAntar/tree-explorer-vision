import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface SearchBarProps {
  onSearch: (term: string) => void;
  searchTerm: string;
}

export function SearchBar({ onSearch, searchTerm }: SearchBarProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const clearSearch = () => {
    setLocalSearch("");
    onSearch("");
  };

  return (
    <Card className="p-4 bg-gradient-surface border-border/50">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search nodes by name..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="bg-background/50 border-border/50 pr-8"
          />
          {localSearch && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button 
          type="submit" 
          className="bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          Search
        </Button>
      </form>
      
      {searchTerm && (
        <div className="mt-2 text-sm text-muted-foreground">
          Searching for: <span className="text-foreground font-medium">"{searchTerm}"</span>
        </div>
      )}
    </Card>
  );
}