"use client";

import { useState, useEffect, Suspense } from "react";
import { IoEye } from "react-icons/io5";
import { IoMdEyeOff } from "react-icons/io";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validators/auth.schema";
import {
  useZodForm,
  FormField,
  SubmitButton,
} from "@/components/forms/FormField";
import { useResetPassword } from "@/hooks/useAuth";

function ResetPasswordForm() {
  const [showPwd, setShowPwd] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useZodForm<ResetPasswordInput>(resetPasswordSchema, {
    token, // pass initial token
  });

  useEffect(() => {
    if (token) {
      setValue("token", token);
    }
  }, [token, setValue]);

  const resetMutation = useResetPassword();

  const onSubmit = (data: ResetPasswordInput) => {
    resetMutation.mutate(data);
  };

  return (
    <div className="relative z-10 flex flex-col justify-center items-center rounded-lg border border-[#222] bg-[#161616] h-fit max-w-sm w-[90vw] mx-auto px-6 py-8 text-white">
      <h1 className="text-white text-center mb-2 text-xl font-medium tracking-tight">
        Reset Password
      </h1>
      <p className="text-center text-zinc-400 mb-6 text-sm">
        Enter your new password below.
      </p>

      {!token && (
        <div className="w-full p-3 mb-6 text-sm text-red-400 bg-red-900/20 border border-red-500/50 rounded-xl text-center">
          Missing reset token. Please use the link from your email.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="w-full" noValidate>
        {/* Hidden input to ensure token is submitted properly */}
        <input type="hidden" {...register("token")} />

        <FormField
          label="New Password"
          name="newPassword"
          type={showPwd ? "text" : "password"}
          placeholder="Enter new password"
          register={register}
          error={errors.newPassword?.message}
          rightElement={
            showPwd ? (
              <IoEye onClick={() => setShowPwd(false)} className="text-xl" />
            ) : (
              <IoMdEyeOff
                onClick={() => setShowPwd(true)}
                className="text-xl"
              />
            )
          }
        />

        <SubmitButton
          label="Reset Password"
          loadingLabel="Resetting..."
          isLoading={resetMutation.isPending}
          disabled={!token}
        />
      </form>

      <div className="mt-6 text-sm text-zinc-400">
        <Link href="/login" className="text-[#3ECF8E] hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="page-grid relative min-h-screen w-full flex items-center justify-center bg-[#1C1C1C]">
      <Suspense
        fallback={
          <div className="flex justify-center items-center rounded-lg border border-[#222] bg-[#161616] h-[20rem] max-w-sm w-[90vw] mx-auto text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3ECF8E]" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
