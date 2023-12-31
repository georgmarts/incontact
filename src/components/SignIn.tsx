"use client";
import { User } from "@/types";
import Button from "./Button";
import "./signin.scss";
import { SubmitHandler, useForm } from "react-hook-form";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useAtom } from "jotai";
import { notificationMessage } from "@/app/state/jotai";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {};

export default function SignIn({}: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notification, setNotification] = useAtom(notificationMessage);
  const emailValidation = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<User>();
  const onSubmit: SubmitHandler<User> = async (data: User) => {
    const { email, password } = data;
    setSubmitLoading(true);
    const response = await signIn("credentials", {
      email: email,
      password: password,
      redirect: false,
    });
    if (response?.error) {
      setNotification(response.error);
      setSubmitLoading(false);
    }
    if (!response?.error) {
      setSubmitLoading(false);
      reset();
      router.push("/home");
    }
  };

  return (
    <form className="signin" onSubmit={handleSubmit(onSubmit)}>
      <h2>Log in</h2>
      <input
        type="email"
        placeholder="Email"
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: emailValidation,
            message: "Invalid email",
          },
        })}
      />
      <span>{errors.email?.message}</span>
      <input
        type="password"
        placeholder="Password"
        {...register("password", {
          required: "Password is required",
        })}
      />
      <span>{errors.password?.message}</span>
      <div className="signin__buttons">
        <Button
          label={submitLoading ? "Logging in..." : "Log in"}
          width="120px"
          loading={submitLoading}
        />
        {!submitLoading && (
          <Button
            label="Register"
            width="120px"
            loading={submitLoading}
            color="#00dc7f"
            fn={() => router.push("signup")}
            type="button"
          />
        )}
      </div>
    </form>
  );
}
