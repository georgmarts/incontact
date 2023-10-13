"use client";

import { User } from "@/types";
import UserPhoto from "./UserPhoto";
import "./profileCard.scss";
import Button from "./Button";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAtom } from "jotai";
import { notificationMessage } from "@/app/state/jotai";
import { revalidatePath } from "next/cache";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

type Props = {
  userId: number;
};

export default function ProfileCard({ userId }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<User>();
  const [editMode, setEditMode] = useState(false);
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [notification, setNotification] = useAtom(notificationMessage);
  const [image, setImage] = useState<File | null>(null);
  const baseImageUrl =
    "https://fsmlpmfunvdgvvoanhds.supabase.co/storage/v1/object/public/vk-images/";
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  async function deleteUser() {
    setIsLoading(true);
    const { error } = await supabase
      .from("SNUsers")
      .delete()
      .match({ id: userId });
    if (!profile?.img) return;
    const imagePath = profile.img.replace(baseImageUrl, "");
    await supabase.storage.from("vk-images").remove([imagePath]);
    setIsLoading(false);
    signOut({ callbackUrl: "/" });
  }

  async function fetchUser() {
    const { data, error } = await supabase
      .from("SNUsers")
      .select()
      .match({ id: userId })
      .single();
    if (data) {
      setProfile(data);
    }
    if (error) {
      setNotification("Something went wrong");
    }
  }

  async function updateProfile(e: FormEvent<HTMLFormElement>) {
    if (!profile) return;
    e.preventDefault();
    setIsLoading(true);
    if (image) {
      const { error } = await supabase.storage
        .from("vk-images")
        .update(`${userId}`, image, {
          cacheControl: "3600",
          upsert: true,
        });
    }
    const { error } = await supabase
      .from("SNUsers")
      .update({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
      })
      .match({ id: userId });
    if (error) {
      setNotification("Something went wrong. Try again");
    } else {
      setEditMode(false);
      setImage(null);
    }
    setIsLoading(false);
  }

  function handleLocalUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setProfile({ ...profile, img: URL.createObjectURL(file) });
    setImage(file);
    e.target.value = ""; // when attaching the same file onChange doesnt work without this code
  }

  function cancelEditing() {
    if (!profile) return;
    setEditMode(false);
    setImage(null);
    setProfile({ ...profile, img: profile.img });
  }

  if (!profile) return;
  return (
    <div className="profile-card">
      {editMode ? (
        <form onSubmit={updateProfile}>
          <UserPhoto image={profile.img} height={"200px"} />
          <label htmlFor="photo" className="profile-card__photo-upload-label">
            <Button
              label="Change photo"
              width="100%"
              type="button"
              fn={() => inputFileRef.current?.click()}
            />
            <input
              type="file"
              id="photo"
              ref={inputFileRef}
              onChange={handleLocalUpload}
              hidden
            />
          </label>
          <label htmlFor="first-name">First name</label>
          <input
            type="text"
            id="first-name"
            value={profile.firstName}
            onChange={(e) =>
              setProfile({ ...profile, firstName: e.target.value })
            }
            required
            disabled={isLoading}
          />
          <label htmlFor="last-name">Last name</label>
          <input
            type="text"
            id="last-name"
            value={profile.lastName}
            onChange={(e) =>
              setProfile({ ...profile, lastName: e.target.value })
            }
            required
            disabled={isLoading}
          />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            disabled={isLoading}
          />
          <label htmlFor="phone-number">Phone number</label>
          <input
            type="text"
            id="phone-number"
            value={profile.phoneNumber}
            onChange={(e) =>
              setProfile({ ...profile, phoneNumber: e.target.value })
            }
            required
            disabled={isLoading}
          />
          <div>
            <Button
              label="Save changes"
              width="100%"
              color="#00dc7f"
              loading={isLoading}
            />
            <Button
              label="Cancel"
              width="100%"
              color="grey"
              type="button"
              fn={cancelEditing}
              loading={isLoading}
            />
          </div>
        </form>
      ) : (
        <>
          <UserPhoto image={profile.img} height={"200px"} />
          <p>
            Name:{" "}
            <span>
              {profile.firstName} {profile.lastName}
            </span>
          </p>
          <p>
            Email: <span>{profile.email}</span>
          </p>
          <p>
            Phone: <span>{profile.phoneNumber}</span>
          </p>
          <div className="profile-card__buttons">
            <Button
              label="Edit"
              width="100%"
              fn={() => setEditMode(true)}
              loading={isLoading}
            />
            <Button
              label="Delete"
              width="100%"
              color="#ff0084"
              fn={deleteUser}
              loading={isLoading}
            />
            <Button
              label="Log out"
              width="100%"
              color="grey"
              fn={() => signOut({ callbackUrl: "/" })}
              loading={isLoading}
            />
          </div>
        </>
      )}
    </div>
  );
}
