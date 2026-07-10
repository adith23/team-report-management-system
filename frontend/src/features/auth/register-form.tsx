// ──────────────────────────────────────────────────────────────────────────────
// RegisterForm — Component for creating a new user account
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { User as UserIcon, Mail, Lock } from "lucide-react";
import { useRegister } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/lib/constants";

// ── Zod Validation Schema ────────────────────────────────────────────────────
const registerSchema = zod
  .object({
    full_name: zod.string().min(1, "Full name is required"),
    email: zod
      .string()
      .min(1, "Email is required")
      .email("Invalid email format"),
    password: zod
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: zod.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = zod.infer<typeof registerSchema>;

/**
 * Client component displaying the register card and form.
 * Performs validation using react-hook-form and zod, then triggers useRegister mutation.
 */
export function RegisterForm() {
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    // Only send matching fields to register endpoint
    const { full_name, email, password } = data;
    registerMutation.mutate(
      { full_name, email, password },
      {
        onSuccess: () => {
          toast.success("Account created successfully! Please sign in.");
        },
        onError: (err) => {
          toast.error(err.message || "Failed to create account. Email might already be taken.");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-white">
          Create an Account
        </h2>
        <p className="text-sm text-slate-400">
          Enter your details below to set up a new account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Full Name input */}
        <Input
          type="text"
          label="Full Name"
          placeholder="John Doe"
          error={errors.full_name?.message}
          icon={<UserIcon className="h-4 w-4" />}
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-primary focus:ring-offset-0 focus:border-white/20"
          {...register("full_name")}
        />

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

        {/* Confirm Password input */}
        <Input
          type="password"
          label="Confirm Password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          icon={<Lock className="h-4 w-4" />}
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-primary focus:ring-offset-0 focus:border-white/20"
          {...register("confirmPassword")}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2 bg-blue-600 text-white hover:bg-blue-500 transition-colors py-2.5 rounded-lg font-medium shadow-lg shadow-blue-600/20"
          loading={registerMutation.isPending}
        >
          Register Account
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-slate-400">Already have an account? </span>
        <Link
          href={ROUTES.LOGIN}
          className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
