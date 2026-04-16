"use client";

import React, { useState } from "react";
import { IoEye } from "react-icons/io5";
import { IoMdEyeOff } from "react-icons/io";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validators/auth.schema";
import {
  useZodForm,
  FormField,
  SubmitButton,
} from "@/components/forms/FormField";
import { useChangePassword } from "@/hooks/useAuth";

// ─── ChangePasswordForm ───
// Renders an inline form for changing (or setting for the first time) the
// user's password. OAuth-only users have no existing password so the
// "Current Password" field is hidden and the action becomes "Set Password".

export default function ChangePasswordForm({
  hasPassword,
}: {
  hasPassword: boolean;
}) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useZodForm<ChangePasswordInput>(changePasswordSchema);

  const mutation = useChangePassword();

  const onSubmit = (data: ChangePasswordInput) => {
    mutation.mutate(data, {
      onSuccess: () => reset(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1" noValidate>
      {!hasPassword && (
        <p className="mb-3 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-xs text-blue-300">
          Your account uses social login and has no password yet. Set one below
          to enable password-based login, deactivation, and deletion.
        </p>
      )}

      {hasPassword && (
        <FormField
          label="Current Password"
          name="currentPassword"
          type={showCurrent ? "text" : "password"}
          placeholder="Enter current password"
          register={register}
          error={errors.currentPassword?.message}
          rightElement={
            showCurrent ? (
              <IoEye
                onClick={() => setShowCurrent(false)}
                className="text-xl"
              />
            ) : (
              <IoMdEyeOff
                onClick={() => setShowCurrent(true)}
                className="text-xl"
              />
            )
          }
        />
      )}

      <FormField
        label="New Password"
        name="newPassword"
        type={showNew ? "text" : "password"}
        placeholder={hasPassword ? "Enter new password" : "Set a password"}
        register={register}
        error={errors.newPassword?.message}
        rightElement={
          showNew ? (
            <IoEye onClick={() => setShowNew(false)} className="text-xl" />
          ) : (
            <IoMdEyeOff onClick={() => setShowNew(true)} className="text-xl" />
          )
        }
      />

      <SubmitButton
        label={hasPassword ? "Change Password" : "Set Password"}
        loadingLabel={hasPassword ? "Changing..." : "Setting..."}
        isLoading={mutation.isPending}
      />
    </form>
  );
}
