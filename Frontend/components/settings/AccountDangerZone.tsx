"use client";

import React, { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { IoEye } from "react-icons/io5";
import { IoMdEyeOff } from "react-icons/io";
import {
  deactivateAccountSchema,
  deleteAccountSchema,
  type DeactivateAccountInput,
  type DeleteAccountInput,
} from "@/lib/validators/auth.schema";
import {
  useZodForm,
  FormField,
  SubmitButton,
} from "@/components/forms/FormField";
import { useDeactivateAccount, useDeleteAccount } from "@/hooks/useAuth";

// ─── AccountDangerZone ───
// Houses both deactivation and permanent deletion flows.
// Each action is behind a confirmation toggle to prevent accidental clicks.
// Follows the same FormField + useZodForm + mutation pattern as other forms.

export default function AccountDangerZone({
  hasPassword,
}: {
  hasPassword: boolean;
}) {
  return (
    <div className="space-y-6">
      <DeactivateSection hasPassword={hasPassword} />
      <div className="border-t border-white/[0.06] pt-5">
        <DeleteSection hasPassword={hasPassword} />
      </div>
    </div>
  );
}

// ─── Deactivate Account ───

function DeactivateSection({ hasPassword }: { hasPassword: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useZodForm<DeactivateAccountInput>(deactivateAccountSchema);

  const mutation = useDeactivateAccount();

  const onSubmit = (data: DeactivateAccountInput) => {
    mutation.mutate(data, {
      onSuccess: () => reset(),
    });
  };

  if (!expanded) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-zinc-400">
          Temporarily disable your account. You can reactivate it later by
          logging in again.
        </p>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-sm font-medium transition-all duration-200 cursor-pointer"
        >
          <FiAlertTriangle className="text-base" />
          Deactivate Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
        <p className="text-sm text-amber-300">
          <strong>What happens when you deactivate:</strong>
        </p>
        <ul className="text-xs text-amber-300/80 list-disc list-inside mt-1 space-y-0.5">
          <li>Your account will be immediately disabled</li>
          <li>All active sessions will be revoked</li>
          <li>You won&apos;t be able to log in until you reactivate</li>
          <li>Your data is preserved — nothing is deleted</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1" noValidate>
        {hasPassword && (
          <FormField
            label="Confirm your password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            register={register}
            error={errors.password?.message}
            rightElement={
              showPassword ? (
                <IoEye
                  onClick={() => setShowPassword(false)}
                  className="text-xl"
                />
              ) : (
                <IoMdEyeOff
                  onClick={() => setShowPassword(true)}
                  className="text-xl"
                />
              )
            }
          />
        )}
        <div className="flex gap-2">
          <SubmitButton
            label="Deactivate Account"
            loadingLabel="Deactivating..."
            isLoading={mutation.isPending}
          />
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              reset();
            }}
            className="px-4 py-2 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] text-white text-sm font-medium transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Delete Account ───

function DeleteSection({ hasPassword }: { hasPassword: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useZodForm<DeleteAccountInput>(deleteAccountSchema);

  const mutation = useDeleteAccount();

  const onSubmit = (data: DeleteAccountInput) => {
    mutation.mutate(data, {
      onSuccess: () => reset(),
    });
  };

  if (!expanded) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-zinc-400">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all duration-200 cursor-pointer"
        >
          <FiAlertTriangle className="text-base" />
          Delete Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
        <p className="text-sm text-red-300">
          <strong>This action is permanent and irreversible:</strong>
        </p>
        <ul className="text-xs text-red-300/80 list-disc list-inside mt-1 space-y-0.5">
          <li>Your account will be permanently deleted</li>
          <li>All sessions, MFA settings, and OAuth links will be removed</li>
          <li>All your data will be purged and cannot be recovered</li>
          <li>You will not be able to reactivate this account</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1" noValidate>
        {hasPassword && (
          <FormField
            label="Confirm your password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            register={register}
            error={errors.password?.message}
            rightElement={
              showPassword ? (
                <IoEye
                  onClick={() => setShowPassword(false)}
                  className="text-xl"
                />
              ) : (
                <IoMdEyeOff
                  onClick={() => setShowPassword(true)}
                  className="text-xl"
                />
              )
            }
          />
        )}
        <FormField
          label='Type "DELETE MY ACCOUNT" to confirm'
          name="confirmation"
          type="text"
          placeholder="DELETE MY ACCOUNT"
          register={register}
          error={errors.confirmation?.message}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {mutation.isPending
              ? "Deleting..."
              : "Permanently Delete My Account"}
          </button>
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              reset();
            }}
            className="px-4 py-2 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] text-white text-sm font-medium transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
