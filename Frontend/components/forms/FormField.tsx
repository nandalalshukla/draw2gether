"use client";

import {
  useForm,
  UseFormRegister,
  FieldValues,
  DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import React from "react";

// ─── FormField ───
// A reusable, accessible input that auto-wires to react-hook-form's register().
// Displays validation errors inline.
// Uses `UseFormRegister<any>` intentionally — this is the standard pattern for
// reusable form components. Type safety is enforced at the `useZodForm` level.

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  rightElement?: React.ReactNode;
}

export function FormField({
  label,
  name,
  error,
  register,
  rightElement,
  ...inputProps
}: FormFieldProps) {
  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="block mb-2 text-left text-sm font-medium text-zinc-300"
      >
        {label}
      </label>
      <div className="relative mb-1">
        <input
          id={name}
          {...register(name)}
          {...inputProps}
          className="w-full bg-transparent border border-white/[0.06] rounded-lg px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-[#3ECF8E]/50 focus:ring-1 focus:ring-[#3ECF8E]/50 transition-all duration-300 pr-10"
        />
        {rightElement && (
          <div className="absolute right-3 top-3 text-gray-400 hover:text-white cursor-pointer transition-colors">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1 mb-2">{error}</p>}
      {!error && <div className="mb-4" />}
    </div>
  );
}

// ─── useZodForm ───
// A tiny wrapper that pre-configures useForm with zodResolver.
// Every form in the app uses this instead of bare useForm.

export function useZodForm<T extends FieldValues>(
  schema: ZodType<T>,
  defaultValues?: DefaultValues<T>,
) {
  return useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues,
    mode: "onBlur", // validate on blur, not on every keystroke (better UX)
  });
}

// ─── SubmitButton ───
// Shows loading state during mutation. Disabled when form is invalid or submitting.

interface SubmitButtonProps {
  label: string;
  loadingLabel?: string;
  isLoading: boolean;
  disabled?: boolean;
}

export function SubmitButton({
  label,
  loadingLabel = "Please wait...",
  isLoading,
  disabled,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className="w-full py-2 rounded-lg bg-[#3ECF8E] text-[#1C1C1C] font-semibold text-md transition-all duration-200 hover:bg-[#4EEEA0] hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? loadingLabel : label}
    </button>
  );
}
