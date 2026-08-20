"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { BirthRequest } from "@/lib/astro/types";
import { Sparkles, Loader2, MapPin, Check, AlertCircle } from "lucide-react";

interface BirthFormProps {
  onSubmit: (req: BirthRequest) => void;
  loading?: boolean;
  defaultName?: string;
  compact?: boolean;
  submitLabel?: string;
}

type LocationStatus = "idle" | "checking" | "valid" | "invalid";

interface CityOption {
  city: string;
  lat: number;
  lng: number;
  country: string;
  population?: number;
}

export function BirthForm({
  onSubmit,
  loading,
  defaultName,
  compact,
  submitLabel = "Reveal my chart",
}: BirthFormProps) {
  const today = new Date();
  const [year, setYear] = useState<string>(String(today.getFullYear() - 25));
  const [month, setMonth] = useState<string>("5");
  const [day, setDay] = useState<string>("15");
  const [timeKnown, setTimeKnown] = useState<boolean>(false);
  const [hour, setHour] = useState<string>("12");
  const [minute, setMinute] = useState<string>("0");
  const [city, setCity] = useState<string>("");
  const [name, setName] = useState<string>(defaultName || "");
  const [gender, setGender] = useState<"male" | "female" | "">("");

  // Location validation state
  const [locStatus, setLocStatus] = useState<LocationStatus>("idle");
  const [locError, setLocError] = useState<string>("");
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [didYouMean, setDidYouMean] = useState<CityOption[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced location search — shows a list of matching cities
  useEffect(() => {
    if (city.trim().length < 3) {
      const id = setTimeout(() => {
        setLocStatus("idle");
        setLocError("");
        setCityOptions([]);
        setDidYouMean([]);
        setSelectedCity(null);
      }, 0);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setLocStatus("checking");
      setLocError("");
    }, 0);
    const debounceId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(city.trim())}`);
        const data = await res.json();
        if (data.found && data.results && data.results.length > 0) {
          setLocStatus("valid");
          setCityOptions(data.results);
          setDidYouMean([]);
          // Auto-select the first (biggest) city
          if (data.results.length === 1) {
            setSelectedCity(data.results[0]);
          } else {
            setSelectedCity(null);
          }
        } else {
          setLocStatus("invalid");
          setLocError(data.error || "Location not found.");
          setCityOptions([]);
          setDidYouMean(data.didYouMean || []);
          setSelectedCity(null);
        }
      } catch {
        setLocStatus("invalid");
        setLocError("Could not verify that location.");
        setCityOptions([]);
        setSelectedCity(null);
      }
    }, 600);
    return () => {
      clearTimeout(id);
      clearTimeout(debounceId);
    };
  }, [city]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    if (!y || !m || !d) return;
    // Name is now required
    if (!name.trim()) {
      return;
    }
    // Gender is now required
    if (!gender) {
      return;
    }
    // Block submit if no city is selected
    if (!selectedCity) {
      setLocError(cityOptions.length > 1 ? "Please pick your city from the list." : "Please enter a real city.");
      return;
    }
    onSubmit({
      name: name.trim(),
      year: y,
      month: m,
      day: d,
      timeKnown,
      hour: timeKnown ? Number(hour) : undefined,
      minute: timeKnown ? Number(minute) : undefined,
      // Send "City, Country" so downstream consumers (like the data-collection
      // route) can split out the country. lat/lng/tz are already provided
      // separately, so the city string is purely informational.
      city: selectedCity.country
        ? `${selectedCity.city}, ${selectedCity.country}`
        : selectedCity.city,
      lat: selectedCity.lat,
      lng: selectedCity.lng,
      tzStr: "AUTO",
      gender: gender || undefined,
    });
  };

  const inputCls = "bg-white/5 border-white/15 text-white placeholder:text-white/40 focus-visible:ring-amber-300/40";

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`w-full ${compact ? "" : "max-w-xl"} mx-auto space-y-5`}
    >
      {!compact && (
        <div className="space-y-1.5">
          <Label htmlFor="bf-name" className="text-white/70">Your name <span className="text-rose-300/80">*</span></Label>
          <Input id="bf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" className={inputCls} required />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="bf-date" className="text-white/70">Birth date</Label>
        <div className="grid grid-cols-3 gap-2">
          <Input id="bf-month" type="number" min={1} max={12} value={month} onChange={(e) => setMonth(e.target.value)} className={inputCls} placeholder="MM" />
          <Input id="bf-day" type="number" min={1} max={31} value={day} onChange={(e) => setDay(e.target.value)} className={inputCls} placeholder="DD" />
          <Input id="bf-year" type="number" min={1900} max={today.getFullYear()} value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} placeholder="YYYY" />
        </div>
      </div>

      {/* Gender selection — required */}
      <div className="space-y-2">
        <Label className="text-white/70">Gender <span className="text-rose-300/80">*</span></Label>
        <RadioGroup
          value={gender}
          onValueChange={(v) => setGender(v as "male" | "female")}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="male" id="bf-gender-m" className="border-white/30 text-amber-300" />
            <Label htmlFor="bf-gender-m" className="text-white/70 cursor-pointer">Male</Label>
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="female" id="bf-gender-f" className="border-white/30 text-amber-300" />
            <Label htmlFor="bf-gender-f" className="text-white/70 cursor-pointer">Female</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bf-city" className="text-white/70">Birth city <span className="text-rose-300/80">*</span></Label>
        <div className="relative">
          <Input
            id="bf-city"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setSelectedCity(null);
            }}
            placeholder="Type a city or country, e.g. 'Morocco' or 'Paris, France'"
            className={`${inputCls} pr-10`}
            autoComplete="off"
          />
          {/* Status icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {locStatus === "checking" && <Loader2 className="h-4 w-4 text-white/40 animate-spin" />}
            {locStatus === "valid" && selectedCity && <Check className="h-4 w-4 text-emerald-400" />}
            {locStatus === "invalid" && <AlertCircle className="h-4 w-4 text-rose-400" />}
          </div>
        </div>
        {/* City picker dropdown — shows real city names, not coordinates */}
        <AnimatePresence>
          {locStatus === "valid" && cityOptions.length > 0 && !selectedCity && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-1.5"
            >
              <p className="text-xs text-white/40">Pick your city:</p>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.03] divide-y divide-white/5">
                {cityOptions.map((opt, i) => (
                  <button
                    key={`${opt.city}-${opt.country}-${i}`}
                    type="button"
                    onClick={() => {
                      setSelectedCity(opt);
                      setCity(`${opt.city}, ${opt.country}`);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <MapPin className="h-3.5 w-3.5 text-amber-300/60 flex-shrink-0" />
                    <span className="text-sm text-white/80">{opt.city}</span>
                    <span className="text-xs text-white/40">{opt.country}</span>
                    {opt.population && opt.population > 1000000 && (
                      <span className="text-[10px] text-amber-300/40 ml-auto">major city</span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {locStatus === "valid" && selectedCity && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-1.5 text-xs text-emerald-300/80"
            >
              <Check className="h-3 w-3" />
              {selectedCity.city}, {selectedCity.country}
            </motion.div>
          )}
          {locStatus === "invalid" && locError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-1.5 text-xs text-rose-300/90">
                <AlertCircle className="h-3 w-3" />
                {locError}
              </div>
              {didYouMean.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-white/40">Did you mean:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {didYouMean.map((opt, i) => (
                      <button
                        key={`${opt.city}-${i}`}
                        type="button"
                        onClick={() => {
                          setSelectedCity(opt);
                          setCity(`${opt.city}, ${opt.country}`);
                          setLocStatus("valid");
                          setLocError("");
                          setDidYouMean([]);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/30 bg-amber-300/[0.06] px-3 py-1.5 text-xs text-white/80 hover:bg-amber-300/[0.12] transition-colors"
                      >
                        <MapPin className="h-3 w-3 text-amber-300/60" />
                        {opt.city}
                        <span className="text-white/40">{opt.country}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {locStatus === "idle" && (
          <p className="text-xs text-white/40">
            Type a city or country name. For countries, you&apos;ll see a list of cities to pick from.
          </p>
        )}
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Checkbox
            id="bf-time"
            checked={timeKnown}
            onCheckedChange={(v) => setTimeKnown(v === true)}
            className="border-white/30 data-[state=checked]:bg-amber-300 data-[state=checked]:text-slate-900"
          />
          <Label htmlFor="bf-time" className="text-white/70 cursor-pointer">
            I know my birth time
          </Label>
        </div>

        {timeKnown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="grid grid-cols-2 gap-2 overflow-hidden"
          >
            <div className="space-y-1.5">
              <Label htmlFor="bf-hour" className="text-white/60 text-xs">Hour (0-23)</Label>
              <Input id="bf-hour" type="number" min={0} max={23} value={hour} onChange={(e) => setHour(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bf-minute" className="text-white/60 text-xs">Minute (0-59)</Label>
              <Input id="bf-minute" type="number" min={0} max={59} value={minute} onChange={(e) => setMinute(e.target.value)} className={inputCls} />
            </div>
          </motion.div>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading || locStatus === "checking" || locStatus === "invalid" || !selectedCity || !name.trim() || !gender}
        className="w-full bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 text-slate-900 hover:from-amber-200 hover:to-amber-200 font-medium shadow-lg shadow-amber-300/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Consulting the stars...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" /> {submitLabel}
          </>
        )}
      </Button>
    </motion.form>
  );
}
