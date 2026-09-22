"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WEEK_DAYS } from "@/lib/holidays";
import { Plus, Repeat, Trash2 } from "lucide-react";
import {
  holidayList,
  totalHolidays,
  getWeeklyOff,
  setWeeklyOff as applyWeeklyOff,
  nextWeeklyOffDates,
  holidayOccasions,
  addHolidayOccasion,
  removeHolidayOccasion,
} from "@/lib/working-hours";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-10-17" → "17 Oct 2026" (manual, locale-stable for SSR). */
function fmt(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return m && d ? `${d} ${MONTHS[m - 1]} ${y}` : iso;
}

const CARD =
  "rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]";

export default function HolidaysPage() {
  const list = holidayList();
  const today = new Date().toISOString().slice(0, 10);
  const [weekly, setWeekly] = useState<string[]>(() => getWeeklyOff());
  const [occasions, setOccasions] = useState(() => holidayOccasions());
  const [form, setForm] = useState({ name: "", from: "", to: "", half: false });

  const refresh = () => setOccasions(holidayOccasions());

  const toggleDay = (day: string) => {
    // Keep Sunday→Saturday order regardless of click order.
    const next = weekly.includes(day)
      ? weekly.filter((d) => d !== day)
      : WEEK_DAYS.filter((d) => [...weekly, day].includes(d));
    setWeekly(next);
    applyWeeklyOff(next);
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name || !form.from) {
      toast.error("Enter an occasion name and a start date.");
      return;
    }
    if (form.to && form.to < form.from) {
      toast.error("End date cannot be before the start date.");
      return;
    }
    if (list && (form.from < list.from || form.from > list.to)) {
      toast.error(`Pick a date within ${fmt(list.from)} and ${fmt(list.to)}.`);
      return;
    }
    if (addHolidayOccasion(name, form.from, form.to || form.from, form.half)) {
      refresh();
      setForm({ name: "", from: "", to: "", half: false });
      toast.success(`${name} added to the calendar`);
    }
  };

  const remove = (name: string) => {
    removeHolidayOccasion(name);
    refresh();
    toast.success(`${name} removed`);
  };

  const nonWorking = list ? totalHolidays(list.holidays) : 0;

  return (
    <>
      <PageHeader
        title="Holidays"
        description="Set the weekly off days and manage government / public holidays for your company calendar."
      />

      <div className="space-y-6">
        {/* Which calendar this screen edits */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-900/40">
          <p className="text-sm text-muted-foreground">
            Editing <span className="font-semibold text-foreground">{list?.name ?? "—"}</span>
            {list && (
              <>
                {" "}
                · {fmt(list.from)} – {fmt(list.to)} · {occasions.length} occasions ·{" "}
                <span className="font-medium text-foreground">{nonWorking}</span> non-working days
              </>
            )}
          </p>
          <Link href="/leave/holiday-list-assignment" className="text-sm font-medium text-primary hover:underline">
            Assign calendars to employees →
          </Link>
        </div>

        {/* 1. Weekly off */}
        <Card className={CARD}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Repeat className="size-4 text-primary" /> Weekly Off
            </CardTitle>
            <CardDescription>
              The days your company is closed every week. Pick one or more (e.g. Friday &amp; Saturday for a
              5-day working week) — they repeat across the whole year automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => {
                const on = weekly.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      on
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground">
              {weekly.length > 0 ? (
                <>
                  Closed every{" "}
                  <span className="font-medium text-foreground">{weekly.join(", ")}</span>. Next off:{" "}
                  <span className="font-medium text-foreground">
                    {nextWeeklyOffDates(weekly, today, 3).join(" · ") || "—"}
                  </span>
                </>
              ) : (
                "No weekly off selected — every day is a working day."
              )}
            </p>
          </CardContent>
        </Card>

        {/* 2. Public / government holidays */}
        <Card className={CARD}>
          <CardHeader>
            <CardTitle className="text-base">Government &amp; Public Holidays</CardTitle>
            <CardDescription>
              Add an occasion once — a festival spanning several days (e.g. Durga Puja, 17→20 Oct) is filed
              as a single entry instead of typing each date.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={add} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="occ-name" className="text-xs font-semibold">
                  Occasion
                </Label>
                <Input
                  id="occ-name"
                  placeholder="e.g. Durga Puja"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occ-from" className="text-xs font-semibold">
                  From
                </Label>
                <Input
                  id="occ-from"
                  type="date"
                  value={form.from}
                  onChange={(e) => setForm((p) => ({ ...p, from: e.target.value }))}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occ-to" className="text-xs font-semibold">
                  To <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="occ-to"
                  type="date"
                  value={form.to}
                  onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))}
                  className="rounded-lg"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold">Half day?</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.half}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, half: v }))}
                  />
                  <Button type="submit" className="h-9 rounded-lg bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500">
                    <Plus className="size-4" /> Add
                  </Button>
                </div>
              </div>
            </form>

            <Separator />

            {occasions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No public holidays added yet.</p>
            ) : (
              <div className="space-y-2">
                {occasions.map((o) => {
                  const first = o.dates[0];
                  const last = o.dates[o.dates.length - 1];
                  return (
                    <div
                      key={o.description}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {o.description}
                          {o.halfDay && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                              Half day
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {o.dates.length === 1
                            ? fmt(first)
                            : `${fmt(first)} – ${fmt(last)} · ${o.dates.length} days`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(o.description)}
                        aria-label={`Remove ${o.description}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
