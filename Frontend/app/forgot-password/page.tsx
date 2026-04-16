"use client";
import Link from "next/link";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validators/auth.schema";
import {
  useZodForm,
  FormField,
  SubmitButton,
} from "@/components/forms/FormField";
import { useForgotPassword } from "@/hooks/useAuth";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm<ForgotPasswordInput>(forgotPasswordSchema);

  const forgotMutation = useForgotPassword();

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotMutation.mutate(data);
  };

  return (
    <div className="page-grid relative min-h-screen w-full flex items-center justify-center bg-[#1C1C1C]">
      <div className="relative z-10 flex flex-col justify-center items-center rounded-lg border border-[#222] bg-[#161616] h-fit max-w-sm w-[90vw] mx-auto px-6 py-8 text-white">
        <h1 className="text-white text-center mb-2 text-xl font-medium tracking-tight">
          Reset Password
        </h1>
        <p className="text-center text-zinc-400 mb-6 text-sm">
          Enter your email and we&apos;ll send you a link to reset your
          password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full" noValidate>
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            register={register}
            error={errors.email?.message}
          />

          <SubmitButton
            label="Send Reset Link"
            loadingLabel="Sending..."
            isLoading={forgotMutation.isPending}
          />
        </form>

        <div className="mt-6 text-sm text-zinc-400">
          <Link href="/login" className="text-[#3ECF8E] hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
