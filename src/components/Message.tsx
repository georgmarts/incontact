"use client";
import { TFriend, TMessage, User } from "@/types";
import "./message.scss";
import { useSession } from "next-auth/react";
import UserPhoto from "./UserPhoto";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { notificationMessage } from "@/app/state/jotai";
import Button from "./Button";
import { useRouter } from "next/navigation";

type Props = {
  message: TMessage;
  user: User;
  friend: User;
};

export default function Message({ message, user, friend }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const baseUrl = "https://incontact.vercel.app/post/";
  const baseImageUrl =
    "https://fsmlpmfunvdgvvoanhds.supabase.co/storage/v1/object/public/vk-images/";
  const [notification, setNotification] = useAtom(notificationMessage);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [isLongPressed, setIsLongPressed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isValidUrl = (urlString: string) => {
    let url;
    try {
      url = new URL(urlString);
    } catch (e) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  };

  async function deleteMessage() {
    if (!dialogRef.current) return;
    const { error } = await supabase
      .from("SNMessages")
      .delete()
      .match({ id: message.id });
    if (error) setNotification("Something went wrong.Try again");
    if (message.img) {
      const imagePath = message.img.replace(baseImageUrl, "");
      const { error } = await supabase.storage
        .from("vk-images")
        .remove([imagePath]);
      if (error) setNotification("Something went wrong");
    }
    dialogRef.current.close();
  }

  function closeDialog() {
    if (!dialogRef.current) return;
    dialogRef.current.close();
  }

  function handlePointerDown() {
    timer();
  }
  function handlePointerUp() {
    if (!timerRef.current) return;
    clearTimeout(timerRef.current);
  }

  function timer() {
    timerRef.current = setTimeout(() => {
      dialogRef.current?.showModal();
    }, 500);
  }

  function MessageBody() {
    return (
      <div className="message-body">
        {message.img && (
          <img
            src={message.img}
            alt=""
            onClick={() =>
              router.push(`/image/${message.img?.replace(baseImageUrl, "")}`)
            }
          />
        )}
        {isValidUrl(message.message) ? (
          <a href={message.message}>{message.message}</a>
        ) : (
          <>
            <p>{message.message}</p>
          </>
        )}
      </div>
    );
  }

  if (message.userId === user.id)
    return (
      <>
        <dialog ref={dialogRef} className="message-by-user__options">
          <Button label="Delete" color="#00dc7f" fn={deleteMessage} />
          <Button label="Cancel" color="grey" fn={closeDialog} />
        </dialog>
        <div
          className="message-by-user"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <div className="message-by-user__header">
            <UserPhoto image={user.img} height="40px" />
            <div>
              <h3>
                {user?.firstName} {user?.lastName}
              </h3>
            </div>
          </div>
          <MessageBody />
        </div>
      </>
    );

  if (message.userId === friend.id)
    return (
      <div className="message-by-friend">
        <div className="message-by-friend__header">
          <UserPhoto image={friend.img} height="40px" />
          <div>
            <h3>
              {friend?.firstName} {friend?.lastName}
            </h3>
          </div>
        </div>
        <MessageBody />
      </div>
    );
}
