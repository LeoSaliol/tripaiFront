"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (lat: number, lng: number) => void;
  placeholder?: string;
}

export default function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    try {
      const res = await fetch(
        `/api/geocode/search?q=${encodeURIComponent(query)}`,
        { credentials: "include" }
      );
      if (!res.ok) return;
      const data: Suggestion[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
      setActiveIdx(-1);
    } catch {
      // silently fail
    }
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 400);
  }

  function selectSuggestion(s: Suggestion) {
    onChange(s.display_name);
    setOpen(false);
    setSuggestions([]);
    if (onSelect) onSelect(parseFloat(s.lat), parseFloat(s.lon));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        required
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        className="mt-1 block w-full rounded-lg border border-brand-muted/30 bg-brand-dark px-4 py-2.5 text-brand-light placeholder-brand-muted/50 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold transition-colors"
        placeholder={placeholder || "Ej: Buenos Aires, Argentina"}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-white/5 bg-brand-surface py-1 shadow-xl"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.display_name}
              onClick={() => selectSuggestion(s)}
              onMouseEnter={() => setActiveIdx(i)}
              className={`cursor-pointer px-4 py-2 text-sm transition-colors ${
                i === activeIdx
                  ? "bg-brand-gold/20 text-brand-gold"
                  : "text-brand-muted hover:bg-brand-dark hover:text-brand-light"
              }`}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
