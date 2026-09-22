"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { currentUser, fmtDate } from "@/lib/mock/data";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function ProfilePage() {
  const emp = currentUser;
  const initials = emp.name.split("").map((s) => s[0]).slice(0, 2).join("");
  const [form, setForm] = useState({
    name: emp.name,
    email: emp.email,
    phone: emp.phone,
    location: emp.workLocation,
    bio: "HR leader focused on people operations, culture and compliance.",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const save = () => toast.success("Profile updated");

  return (
    <>
      <PageHeader title="My Profile" description="Manage your personal information and preferences." />

      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
          <Avatar className="size-16 ring-2 ring-blue-500/20">
            <AvatarFallback className="text-xl font-semibold text-white" style={{ backgroundColor: emp.avatarColor }}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{emp.name}</h2>
              <StatusBadge status={emp.status} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {emp.designation} · {emp.department} · <span className="font-mono text-xs">{emp.employeeId}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="h-10 rounded-xl bg-slate-100 p-1 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <TabsTrigger value="personal" className="rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white">Personal</TabsTrigger>
          <TabsTrigger value="employment" className="rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white">Employment</TabsTrigger>
          <TabsTrigger value="password" className="rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
              <CardDescription>This is how your details appear across the portal.</CardDescription>
            </CardHeader>
            <CardContent className="max-w-2xl">
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); save(); }}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-semibold">Full Name</Label>
                    <Input id="name" value={form.name} onChange={set("name")} className="rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={set("email")} className="rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-semibold">Phone</Label>
                    <Input id="phone" value={form.phone} onChange={set("phone")} className="rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-xs font-semibold">Work Location</Label>
                    <Input id="location" value={form.location} onChange={set("location")} className="rounded-lg" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-xs font-semibold">Bio</Label>
                  <Textarea id="bio" rows={3} value={form.bio} onChange={set("bio")} className="rounded-lg" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="h-10 rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500">
                    <Save className="size-4" /> Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employment">
          <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
            <CardHeader><CardTitle className="text-base">Employment Details</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
                {[
                  ["Employee ID", emp.employeeId],
                  ["Department", emp.department],
                  ["Designation", emp.designation],
                  ["Reports To", emp.reportsTo],
                  ["Date of Joining", fmtDate(emp.joinDate)],
                  ["Work Location", emp.workLocation],
                ].map(([label, value]) => (
                  <div key={label} className="space-y-0.5">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</dd>
                  </div>
                ))}
              </dl>
              <Separator className="my-5 border-slate-100 dark:border-slate-800" />
              <p className="text-xs text-muted-foreground">Employment records are managed by HR and cannot be edited here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>Use a strong, unique password.</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md">
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); toast.success("Password changed"); }}>
                <div className="space-y-2">
                  <Label htmlFor="current" className="text-xs font-semibold">Current Password</Label>
                  <Input id="current" type="password" className="rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new" className="text-xs font-semibold">New Password</Label>
                  <Input id="new" type="password" className="rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-xs font-semibold">Confirm New Password</Label>
                  <Input id="confirm" type="password" className="rounded-lg" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="h-10 rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500">
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
