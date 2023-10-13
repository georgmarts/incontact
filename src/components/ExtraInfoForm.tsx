"use client";
import { User } from "@/types";
import Button from "./Button";
import "./extraInfoForm.scss";
import { SubmitHandler, useForm } from "react-hook-form";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { notificationMessage, userAtom, userId } from "@/app/state/jotai";
import { useRouter } from "next/navigation";
import Header from "./Header";

type Props = {};

export default function ExtraInfoForm({}: Props) {
  const router = useRouter();
  const [user, setUser] = useAtom(userAtom);
  const email = "user1@email.com";
  const [modalMessage, setModalMessage] = useAtom(notificationMessage);
  const [image, setImage] = useState<File>();
  const [preview, setPreview] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState("1985-01-01");
  const imageBaseUrl =
    "https://fsmlpmfunvdgvvoanhds.supabase.co/storage/v1/object/public/vk-images/";
  const [loading, setLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState("");
  const inputDateRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setTimeout(() => {
      loadingDots.length == 3
        ? setLoadingDots("")
        : setLoadingDots((prev) => prev + ".");
    }, 1000);
  }, [loadingDots]);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!image || birthDate.length == 0) return;
    setLoading(true);
    const { error: uploadError } = await supabase.storage
      .from("vk-images")
      .upload(String(user.id), image);
    const { error } = await supabase
      .from("SNUsers")
      .insert({ ...user, birthDate: birthDate, img: imageBaseUrl + user.id });
    if (error?.code === "23505") {
      setModalMessage("User already exists");
    }
    if (error?.message === "TypeError: Failed to fetch") {
      setModalMessage("Network error. Try again");
    }
    if (!error) {
      // setModalMessage("User is added successfully");
      setUser({});
      router.push("/signin");
    }
    setLoading(false);
  }

  function removeImage() {
    setPreview(null);
  }

  return (
    <>
      <div className="extra-info-form__header">
        <img
          src="/icons/arrow-left.svg"
          alt=""
          className="header--arrow-left"
          onClick={() => setUser({})}
        />
        <h3>Go back</h3>
      </div>
      <form className="extra-info-form" onSubmit={handleSubmit}>
        {preview ? (
          <div className="extra-info-form__image-card">
            <img src={preview} alt="" />
            {!loading && (
              <Button
                label="Remove image"
                width="120px"
                fn={removeImage}
                color="#ff0084"
                loading={loading}
              />
            )}
          </div>
        ) : (
          <label htmlFor="file">
            {loading ? (
              <span>Your photo is uploading...</span>
            ) : (
              <>
                <img src="/icons/upload.svg" alt="" />
                <span>Upload your profile photo</span>
              </>
            )}
            <input
              type="file"
              onChange={handleUpload}
              id="file"
              hidden
              required
            />
          </label>
        )}
        {!loading && (
          <input
            type="date"
            onChange={(e) => setBirthDate(e.target.value)}
            value={birthDate}
            required
            ref={inputDateRef}
            // hidden={birthDate.length == 0}
          />
        )}

        <div className="extra-info-form__buttons">
          {!loading && (
            <Button
              label="Set birthdate"
              width="120px"
              loading={loading}
              color="#00dc7f"
              type="button"
              fn={() => inputDateRef.current?.showPicker()}
            />
          )}
          <Button
            label={loading ? "Loading..." : "Create account"}
            width="120px"
            loading={loading}
          />
        </div>
      </form>
    </>
  );
}
