"use client";
import { useAtom } from "jotai";
import "./newPost.scss";
import { isNewPostDialog, notificationMessage } from "@/app/state/jotai";
import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "next-auth/react";

type Props = {};

export default function NewPost({}: Props) {
  const [notification, setNotification] = useAtom(notificationMessage);
  const { data: session } = useSession();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useAtom(isNewPostDialog);
  const [post, setPost] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const randomValue = Date.now();
  const imageBaseUrl =
    "https://fsmlpmfunvdgvvoanhds.supabase.co/storage/v1/object/public/vk-images/";
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    isDialogOpen && dialogRef.current?.showModal();
  }, [isDialogOpen]);

  function handleCloseDialog() {
    dialogRef.current?.close();
    setIsDialogOpen(false);
  }

  async function handleAddPost() {
    if (!file) {
      setIsPosting(true);
      const { error } = await supabase
        .from("SNPosts")
        .insert({ user: session?.user.id, body: post });
      if (error) setNotification("Something went wrong. Try again");
      if (!error) {
        handleCloseDialog();
        setPost("");
      }
      setIsPosting(false);
    }
    if (file) {
      setIsPosting(true);
      await supabase.storage
        .from("vk-images")
        .upload(`post-${String(session?.user.id)}-${randomValue}`, file);
      const { error } = await supabase
        .from("SNPosts")
        .insert({
          user: session?.user.id,
          body: post,
          img: imageBaseUrl + `post-${String(session?.user.id)}-${randomValue}`,
        });
      if (error) setNotification("Something went wrong. Try again");
      if (!error) {
        handleCloseDialog();
        setFile(null);
        setPost("");
      }
      setIsPosting(false);
    }
  }

  function handleLocalUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setFile(file);
    e.target.value = "";
  }

  return (
    <dialog className="new-post" ref={dialogRef}>
      <img
        src="/icons/close.svg"
        alt=""
        onClick={handleCloseDialog}
        className="new-post__close-icon"
      />
      {isPosting ? <p>Posting...</p> : <p>Write a post</p>}
      <textarea
        name=""
        id=""
        rows={5}
        value={post}
        onChange={(e) => setPost(e.target.value)}
        disabled={isPosting}
      />
      {file && (
        <img
          src={URL.createObjectURL(file)}
          alt=""
          className="new-post__image"
        />
      )}
      <div className="new-post-buttons">
        <label htmlFor="file">
          {!file ? (
            <Button
              label="Add image"
              color="#00dc7f"
              fn={() => inputRef.current?.click()}
              loading={isPosting}
            />
          ) : (
            <Button
              label="Delete image"
              color="#ff0084"
              fn={() => setFile(null)}
              loading={isPosting}
            />
          )}
          <input
            type="file"
            id="file"
            onChange={handleLocalUpload}
            ref={inputRef}
            hidden
          />
        </label>
        <Button label="Publish" fn={handleAddPost} loading={isPosting} />
      </div>
    </dialog>
  );
}
