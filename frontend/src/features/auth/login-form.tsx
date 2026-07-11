// LoginForm — Component for signing in to the system

"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Mail, Lock } from "lucide-react";
import { useLogin } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/lib/constants";

// Zod Validation Schema
const loginSchema = zod.object({
  email: zod
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: zod
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

/**
 * Client component displaying the login card and form.
 * Performs validation using react-hook-form and zod, then triggers useLogin mutation.
 */
export function LoginForm() {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onError: (err) => {
        toast.error(err.message || "Failed to login. Please check your credentials.");
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-white">
          Sign In
        </h2>
        <p className="text-sm text-slate-400">
          Enter your details below to log in to your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email input */}
        <Input
          type="email"
          label="Email Address"
          placeholder="name@example.com"
          error={errors.email?.message}
          icon={<Mail className="h-4 w-4" />}
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-primary focus:ring-offset-0 focus:border-white/20"
          {...register("email")}
        />

        {/* Password input */}
        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          error={errors.password?.message}
          icon={<Lock className="h-4 w-4" />}
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-primary focus:ring-offset-0 focus:border-white/20"
          {...register("password")}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2 bg-blue-600 text-white hover:bg-blue-500 transition-colors py-2.5 rounded-lg font-medium shadow-lg shadow-blue-600/20"
          loading={loginMutation.isPending}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-slate-400">Don't have an account? </span>
        <Link
          href={ROUTES.REGISTER}
          className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
