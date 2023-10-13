"use client";
import { User } from "@/types";
import "./profileHeader.scss";
import Button from "./Button";
import UserPhoto from "./UserPhoto";
import { supabase } from "@/lib/supabaseClient";
import { useSetAtom } from "jotai";
import { isNewPostDialog } from "@/app/state/jotai";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useRef } from "react";

type Props = {
  user: User;
  children: React.ReactNode;
};

export default function ProfileHeader({ user, children }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const baseImageUrl =
    "https://fsmlpmfunvdgvvoanhds.supabase.co/storage/v1/object/public/vk-images/";

  function logOut() {
    signOut({ callbackUrl: "/" });
  }

  return (
    <>
      <dialog className="profile-header__options" ref={dialogRef}>
        <Button
          label="Edit profile"
          color="#00dc7f"
          fn={() => router.push(`/profile/${user.id}`)}
        />
        <Button label="Log out" color="" fn={logOut} />

        <Button
          label="Close"
          color="grey"
          fn={() => dialogRef.current?.close()}
        />
      </dialog>
      <div className="profile-header">
        <div className="profile-header__body">
          {user.id === session?.user.id && (
            <img
              src="/icons/dots.svg"
              className="profile-header__dots"
              alt=""
              onClick={() => dialogRef.current?.showModal()}
            />
          )}
          <UserPhoto
            image={user.img}
            height="100px"
            fn={() =>
              router.push(`/image/${user.img?.replace(baseImageUrl, "")}`)
            }
          />
          <h2>
            {user.firstName} {user.lastName}
          </h2>
          <p>Some very smart quote noone cares about</p>
          <p>Studied at Very Good State University</p>
          {children}
        </div>
      </div>
    </>
  );
}
