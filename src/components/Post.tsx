"use client";
import { Like, TPost, User } from "@/types";
import "./post.scss";
import UserPhoto from "./UserPhoto";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";
import { FormEvent, useEffect, useRef, useState } from "react";
import Comments from "./Comments";
import { useRouter } from "next/navigation";
import ShareModal from "./ShareModal";
import {
  isShareModalOpen,
  notificationMessage,
  shareInfo,
  updateCommentsCountAtom,
} from "@/app/state/jotai";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Button from "./Button";

type Props = {
  post: TPost;
  user: User;
};

export default function Post({ post, user }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const formatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
  // const formatter = new Intl.DateTimeFormat('en-US', {dateStyle: 'medium', timeStyle: 'medium'})
  const time = formatter.format(new Date(post.createdAt));
  const [isLiked, setIsLiked] = useState(false);
  const [areCommentsOpen, setAreCommentsOpen] = useState(false);
  const [likes, setLikes] = useState<Like[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useAtom(isShareModalOpen);
  const [shareInformation, setShareInformation] = useAtom(shareInfo);
  const [postModal, setPostModal] = useState(false);
  const postModalRef = useRef<HTMLDialogElement | null>(null);
  const setNotification = useSetAtom(notificationMessage);
  const [postBody, setPostBody] = useState<string>();
  const [editModal, setEditModal] = useState(false);
  const editModalRef = useRef<HTMLDialogElement | null>(null);
  const [commentsCount, setCommentsCount] = useState(0);
  const commentsCountUpdates = useAtomValue(updateCommentsCountAtom);
  const baseImageUrl =
    "https://fsmlpmfunvdgvvoanhds.supabase.co/storage/v1/object/public/vk-images/";
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLikes();

    const interval = setInterval(() => {
      fetchLikes();
      fetchCommentsCount();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchCommentsCount();
  }, [commentsCountUpdates]);

  useEffect(() => {
    checkLike();
  }, [likes, session?.user]);

  useEffect(() => {
    if (!postModalRef.current) return;
    postModal ? postModalRef.current.showModal() : postModalRef.current.close();
  }, [postModal]);

  useEffect(() => {
    if (!editModalRef.current) return;
    editModal ? editModalRef.current.showModal() : editModalRef.current.close();
  }, [editModal]);

  function checkLike() {
    if (!session?.user) return;
    const status = likes.some((like) => like.user == session.user.id);
    setIsLiked(status);
  }

  async function fetchLikes() {
    const { data, error } = await supabase
      .from("SNLikes")
      .select()
      .match({ post: post.id });
    if (data) {
      setLikes(data);
    }
  }

  async function fetchCommentsCount() {
    // const { count, error } = await supabase.from('SNComments').select('*', {count: 'exact'}).match({post: post.id})
    const { data, error } = await supabase
      .from("SNComments")
      .select()
      .match({ post: post.id });
    if (data) {
      setCommentsCount(data.length);
    }
    if (error) setNotification("Something went wrong.Try again");
  }

  async function handleLike() {
    if (!session?.user) return;
    const { error } = await supabase
      .from("SNLikes")
      .insert({ user: session.user.id, post: post.id });
    fetchLikes();
  }

  async function handleDislike() {
    if (!session?.user) return;
    const { error } = await supabase
      .from("SNLikes")
      .delete()
      .match({ user: session.user.id, post: post.id });
    fetchLikes();
  }

  function handleShare() {
    if (!session?.user) return;
    setIsDialogOpen(true);
    setShareInformation({
      userId: session?.user.id,
      postId: post.id,
    });
  }

  function openEditModal() {
    setEditModal(true);
    setPostModal(false);
    setPostBody(post.body);
  }

  async function handleDeletePost() {
    setIsLoading(true);
    const { error: deletePostError } = await supabase
      .from("SNPosts")
      .delete()
      .match({ id: post.id });
    const { error: deleteCommentsError } = await supabase
      .from("SNComments")
      .delete()
      .match({ post: post.id });
    setIsLoading(false);
    if (post.img) {
      setIsLoading(true);
      const imagePath = post.img.replace(baseImageUrl, "");
      const { error } = await supabase.storage
        .from("vk-images")
        .remove([imagePath]);
      if (error) setNotification("Something went wrong");
      setIsLoading(false);
    }
    if (!deletePostError && !deleteCommentsError) {
      setNotification("Post is deleted");
    }
    if (deletePostError || deleteCommentsError) {
      setNotification("Something went wrong. Try again");
    }
    setPostModal(false);
  }

  async function handleEditPost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase
      .from("SNPosts")
      .update({ body: postBody })
      .match({ id: post.id });
    if (!error) {
      setNotification("Post is updated");
      setEditModal(false);
    }
    if (error) {
      setNotification("Something went wrong. Try again");
    }
    setIsLoading(false);
    setPostModal(false);
  }

  return (
    <div className="post">
      <div className="post__user-card">
        <UserPhoto image={user.img} height="40px" />
        <div className="post__user-card--name">
          <p onClick={() => router.push(`/friends/${user.id}`)}>
            {user.firstName} {user.lastName}
          </p>
          <p className="post__date">{time}</p>
        </div>
        {user.id == session?.user.id && (
          <img
            src="/icons/dots.svg"
            alt=""
            width={30}
            className="post__user-card--dots"
            onClick={() => setPostModal(true)}
          />
        )}
        <dialog className="post__user-card--options-modal" ref={postModalRef}>
          {isLoading ? (
            <h4>Deleting post...</h4>
          ) : (
            <>
              <Button
                label="Edit post"
                width="100%"
                fn={openEditModal}
                loading={isLoading}
              />
              <Button
                label="Delete post"
                width="100%"
                color="#ff0084"
                fn={handleDeletePost}
                loading={isLoading}
              />
              <Button
                label="Cancel"
                color="#c1b9b0"
                fn={() => setPostModal(false)}
                width="100%"
                loading={isLoading}
              />
            </>
          )}
        </dialog>
      </div>
      <p className="post__body">{post.body}</p>
      <dialog className="post__edit-modal" ref={editModalRef}>
        {isLoading ? (
          <h4>Saving changes...</h4>
        ) : (
          <form onSubmit={handleEditPost}>
            <textarea
              value={postBody}
              rows={3}
              onChange={(e) => setPostBody(e.target.value)}
              disabled={isLoading}
            ></textarea>
            <Button label="Submit" width="80%" loading={isLoading} />
            <Button
              label="Cancel"
              width="80%"
              color="#c1b9b0"
              fn={() => setEditModal(false)}
              type="button"
              loading={isLoading}
            />
          </form>
        )}
      </dialog>
      <img
        src={post.img}
        alt=""
        className="post__img"
        onClick={() =>
          router.push(`/image/${post.img.replace(baseImageUrl, "")}`)
        }
      />
      <div className="post__icons">
        <img
          src={isLiked ? "/icons/like.svg" : "/icons/unlike.svg"}
          alt=""
          width="30px"
          onClick={isLiked ? handleDislike : handleLike}
        />
        {likes.length > 0 && <span>{likes.length}</span>}
        <img
          src="/icons/comment.svg"
          alt=""
          width="30px"
          onClick={() => router.push(`/post/${post.id}`)}
        />
        {commentsCount > 0 && <span>{commentsCount}</span>}
        <img
          src="/icons/share.svg"
          alt=""
          width="30px"
          onClick={() => handleShare()}
        />
      </div>
    </div>
  );
}
