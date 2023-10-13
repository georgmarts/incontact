"use client";
import { User } from "@/types";
import Button from "./Button";
import "./signup.scss";
import { SubmitHandler, useForm } from "react-hook-form";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useAtom } from "jotai";
import { notificationMessage, userAtom, userId } from "@/app/state/jotai";

type Props = {};

export default function SignUp({}: Props) {
  const [modalMessage, setModalMessage] = useAtom(notificationMessage);
  const [user, setUser] = useAtom(userAtom);
  const emailValidation = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
  const passwordValidation =
    /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
  const phoneValidation =
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<User>();
  const onSubmit: SubmitHandler<User> = async (data: User) => {
    const { firstName, lastName, email, phoneNumber, password } = data;
    const userData = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    };
    setUser(userData);
  };

  return (
    <form className="registration" onSubmit={handleSubmit(onSubmit)}>
      <h2>Sign up</h2>
      <input
        type="text"
        placeholder="First name"
        {...register("firstName", {
          required: "First name is required",
        })}
      />
      <span>{errors.firstName?.message}</span>
      <input
        type="text"
        placeholder="Last name"
        {...register("lastName", {
          required: "Last name is required",
        })}
      />
      <span>{errors.lastName?.message}</span>
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
        type="text"
        placeholder="Phone number"
        {...register("phoneNumber", {
          required: "Phone number is required",
          //   pattern: {
          //     value: phoneValidation,
          //     message: 'Invalid phone number'
          //   }
        })}
      />
      <span>{errors.phoneNumber?.message}</span>
      <input
        type="password"
        placeholder="Password"
        {...register("password", {
          required: "Password is required",
          // pattern: {
          //   value: passwordValidation,
          //   message: 'Ivalid password',
          // }
        })}
      />
      <span>{errors.password?.message}</span>
      <input
        type="password"
        placeholder="Confirm password"
        {...register("confirmPassword", {
          required: "Confirm password",
          validate: (value) =>
            watch("password") === value || "Your passwords do no match",
        })}
      />
      <span>{errors.confirmPassword?.message}</span>
      <Button label="Next" width="120px" />
      <a href="/signin">Login</a>
    </form>
  );
}
