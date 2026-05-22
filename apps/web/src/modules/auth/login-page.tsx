"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoUsers, loginDemo } from "@/services/auth.service";
import { setRoute, setUser } from "@/stores/app-store";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  remember: z.boolean().optional()
});

export function LoginPage() {
  const dispatch = useDispatch();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@abhasetu.com", password: "Admin@123", remember: true }
  });

  function submit(values: z.infer<typeof schema>) {
    const user = loginDemo(values.email, values.password);
    dispatch(setUser(user));
    dispatch(setRoute("dashboard"));
  }

  return (
    <section className="col-span-full mt-6 grid gap-4 lg:grid-cols-[1fr_380px]">
      <Card>
        <h1 className="text-3xl font-extrabold">Premium healthcare login</h1>
        <p className="mt-2 text-text-secondary">Static demo credentials are used for showcase. Architecture is JWT and refresh-token ready.</p>
        <form className="mt-5 grid gap-4" onSubmit={form.handleSubmit(submit)}>
          <label className="grid gap-2 text-sm font-bold text-text-secondary">Email<input className="rounded-xl border border-border bg-bg-secondary p-3 text-text-primary" {...form.register("email")} /></label>
          <label className="grid gap-2 text-sm font-bold text-text-secondary">Password<input type="password" className="rounded-xl border border-border bg-bg-secondary p-3 text-text-primary" {...form.register("password")} /></label>
          <label className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" {...form.register("remember")} /> Remember me</label>
          <Button type="submit"><LockKeyhole className="h-4 w-4" />Sign in</Button>
        </form>
      </Card>
      <Card>
        <h2 className="text-xl font-extrabold">Demo credentials</h2>
        <div className="mt-4 grid gap-2">
          {demoUsers.map((user) => <button key={user.email} onClick={() => form.reset({ email: user.email, password: user.password, remember: true })} className="rounded-xl border border-border bg-bg-secondary p-3 text-left"><strong className="capitalize">{user.role}</strong><span className="block text-sm text-text-secondary">{user.email}</span><code className="text-xs text-accent-teal">{user.password}</code></button>)}
        </div>
      </Card>
    </section>
  );
}
