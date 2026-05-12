import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type Country = { code: string; name: string; dial: string; flag: string };

// Curated list (most common); extend as needed.
export const COUNTRIES: Country[] = [
  { code: "MZ", name: "Moçambique", dial: "+258", flag: "🇲🇿" },
  { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { code: "BR", name: "Brasil", dial: "+55", flag: "🇧🇷" },
  { code: "AO", name: "Angola", dial: "+244", flag: "🇦🇴" },
  { code: "CV", name: "Cabo Verde", dial: "+238", flag: "🇨🇻" },
  { code: "GW", name: "Guiné-Bissau", dial: "+245", flag: "🇬🇼" },
  { code: "ST", name: "São Tomé e Príncipe", dial: "+239", flag: "🇸🇹" },
  { code: "TL", name: "Timor-Leste", dial: "+670", flag: "🇹🇱" },
  { code: "ZA", name: "África do Sul", dial: "+27", flag: "🇿🇦" },
  { code: "US", name: "Estados Unidos", dial: "+1", flag: "🇺🇸" },
  { code: "GB", name: "Reino Unido", dial: "+44", flag: "🇬🇧" },
  { code: "ES", name: "Espanha", dial: "+34", flag: "🇪🇸" },
  { code: "FR", name: "França", dial: "+33", flag: "🇫🇷" },
  { code: "DE", name: "Alemanha", dial: "+49", flag: "🇩🇪" },
  { code: "IT", name: "Itália", dial: "+39", flag: "🇮🇹" },
  { code: "NL", name: "Países Baixos", dial: "+31", flag: "🇳🇱" },
  { code: "BE", name: "Bélgica", dial: "+32", flag: "🇧🇪" },
  { code: "CH", name: "Suíça", dial: "+41", flag: "🇨🇭" },
  { code: "IE", name: "Irlanda", dial: "+353", flag: "🇮🇪" },
  { code: "CA", name: "Canadá", dial: "+1", flag: "🇨🇦" },
  { code: "MX", name: "México", dial: "+52", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { code: "CL", name: "Chile", dial: "+56", flag: "🇨🇱" },
  { code: "CO", name: "Colômbia", dial: "+57", flag: "🇨🇴" },
  { code: "PE", name: "Peru", dial: "+51", flag: "🇵🇪" },
  { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
  { code: "JP", name: "Japão", dial: "+81", flag: "🇯🇵" },
  { code: "IN", name: "Índia", dial: "+91", flag: "🇮🇳" },
  { code: "AE", name: "Emirados Árabes Unidos", dial: "+971", flag: "🇦🇪" },
  { code: "AU", name: "Austrália", dial: "+61", flag: "🇦🇺" },
  { code: "NZ", name: "Nova Zelândia", dial: "+64", flag: "🇳🇿" },
  { code: "KE", name: "Quénia", dial: "+254", flag: "🇰🇪" },
  { code: "NG", name: "Nigéria", dial: "+234", flag: "🇳🇬" },
  { code: "EG", name: "Egito", dial: "+20", flag: "🇪🇬" },
  { code: "MA", name: "Marrocos", dial: "+212", flag: "🇲🇦" },
];

const DEFAULT_DIAL = "+258";

function splitPhone(value: string): { dial: string; rest: string } {
  const v = (value || "").trim();
  if (!v.startsWith("+")) return { dial: DEFAULT_DIAL, rest: v };
  // Try to match longest dial code first
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (v.startsWith(c.dial)) {
      return { dial: c.dial, rest: v.slice(c.dial.length).trimStart() };
    }
  }
  return { dial: DEFAULT_DIAL, rest: v };
}

export interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  id,
  value,
  onChange,
  placeholder = "84 000 0000",
  disabled,
  maxLength = 40,
  className,
}) => {
  const { dial, rest } = splitPhone(value);
  const [open, setOpen] = React.useState(false);
  const country =
    COUNTRIES.find((c) => c.dial === dial) ?? COUNTRIES.find((c) => c.dial === DEFAULT_DIAL)!;

  const update = (newDial: string, newRest: string) => {
    const trimmed = newRest.trim();
    onChange(trimmed ? `${newDial} ${trimmed}` : newDial);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="h-9 shrink-0 gap-1 px-2"
          >
            <span className="text-base leading-none">{country.flag}</span>
            <span className="text-sm tabular-nums">{country.dial}</span>
            <ChevronsUpDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Procurar país..." />
            <CommandList>
              <CommandEmpty>Sem resultados.</CommandEmpty>
              <CommandGroup>
                {COUNTRIES.map((c) => (
                  <CommandItem
                    key={c.code}
                    value={`${c.name} ${c.dial} ${c.code}`}
                    onSelect={() => {
                      update(c.dial, rest);
                      setOpen(false);
                    }}
                  >
                    <span className="mr-2 text-base leading-none">{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="ml-2 text-muted-foreground tabular-nums">{c.dial}</span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        c.dial === country.dial ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        value={rest}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        onChange={(e) => update(country.dial, e.target.value)}
      />
    </div>
  );
};

export default PhoneInput;
