"use client";

import { useState } from "react";
import { IoEye } from "react-icons/io5";
import { IoMdEyeOff } from "react-icons/io";
import Link from "next/link";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validators/auth.schema";
import {
  useZodForm,
  FormField,
  SubmitButton,
} from "@/components/forms/FormField";
import { SocialButtons } from "@/components/forms/SocialButtons";
import { useRegister } from "@/hooks/useAuth";

export default function RegisterPage() {
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm<RegisterInput>(registerSchema);

  const registerMutation = useRegister();

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="page-grid relative min-h-screen w-full flex items-center justify-center bg-[#1C1C1C] overflow-y-auto pt-12 pb-5">
      <div className="relative z-10 flex flex-col justify-center items-center rounded-lg border border-[#222] bg-[#161616] h-fit max-w-sm w-[90vw] mx-auto px-4 py-6 text-white my-auto">
        <h1 className="text-white text-center mb-6 text-xl font-medium tracking-tight">
          Signup
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full" noValidate>
          <FormField
            label="Fullname"
            name="fullname"
            type="text"
            placeholder="Enter your fullname"
            register={register}
            error={errors.fullname?.message}
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            register={register}
            error={errors.email?.message}
          />

          <FormField
            label="Password"
            name="password"
            type={showPwd ? "text" : "password"}
            placeholder="Enter your password"
            register={register}
            error={errors.password?.message}
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
            label="Signup"
            loadingLabel="Creating account..."
            isLoading={registerMutation.isPending}
          />
        </form>

        <div className="flex items-center w-full my-6">
          <div className="grow h-px bg-white/[0.06]"></div>
          <span className="px-3 text-sm text-zinc-400 font-medium">
            Or continue with
          </span>
          <div className="grow h-px bg-white/[0.06]"></div>
        </div>

        <SocialButtons />

        <div className="mt-6 text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="text-[#3ECF8E] hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
