"use client";
import "../friendsPage.scss";
import FriendPosts from "@/components/Friend/FriendPosts";
import FriendProfile from "@/components/Friend/FriendProfile";
import Header from "@/components/Header";
import Notification from "@/components/Notification";
import ShareModal from "@/components/ShareModal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  params: {
    friendId: number;
  };
};

export default function Page({ params }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const { friendId } = params;

  useEffect(() => {
    if (!session?.user) return;
    if (session.user.id == friendId) {
      router.push(`/home`);
    }
  }, [session?.user]);

  return (
    <main className="friend-page">
      <Notification />
      <ShareModal />
      <Header>
        <h3>Friend wall</h3>
      </Header>
      <FriendProfile friendId={friendId} />
      <FriendPosts friendId={friendId} />
    </main>
  );
}
