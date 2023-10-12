"use client";
import { signOut, useSession } from "next-auth/react";
import "./home.scss";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { OnlineUser, TPost, User } from "@/types";
import { useAtom, useSetAtom } from "jotai";
import { mobileMenuTranslateXAtom, notificationMessage } from "../state/jotai";
import List from "@/components/List";
import Post from "@/components/Post";
import MobileMenu from "@/components/MobileMenu";
import UserPhoto from "@/components/UserPhoto";
import { useRouter } from "next/navigation";
import Notification from "@/components/Notification";
import Loading from "@/components/Loading";
import Header from "@/components/Header";
import ShareModal from "@/components/ShareModal";
import Link from "next/link";
import Button from "@/components/Button";

type Props = {};

export default function Page({}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [friendIds, setFriendIds] = useState<number[]>();
  const [friends, setFriends] = useState<User[]>();
  const [posts, setPosts] = useState<TPost[]>();
  const [notification, setNotification] = useAtom(notificationMessage);
  const [translateX, setTranslateX] = useAtom(mobileMenuTranslateXAtom);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

  useEffect(() => {
    checkFriends();
  }, [session?.user]);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(() => {
      fetchPosts();
    }, 5000);

    return () => clearInterval(interval);
  }, [friendIds]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPosts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const channel = supabase.channel("chat");

    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();
        const users = Object.keys(presenceState)
          .map((presenceId) => {
            const presences = presenceState[
              presenceId
            ] as unknown as OnlineUser[];
            return presences.map((presence) => {
              return presence.id;
            });
          })
          .flat();
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (!session?.user) return;
        if (status === "SUBSCRIBED") {
          await channel.track({
            id: session.user.id,
          });
          await supabase
            .from("SNUsers")
            .update({ onlineAt: new Date() })
            .match({ id: session?.user.id });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [session?.user]);

  async function fetchPosts() {
    if (!friendIds) return;
    const { data, error } = await supabase
      .from("SNPosts")
      .select("*, SNUsers!SNPosts_user_fkey(*)")
      .in("user", friendIds)
      .order("createdAt", { ascending: false });
    if (data) {
      setPosts(data);
    }
    if (error) setNotification("Something went wrong. Try again");
  }

  async function checkFriends() {
    if (!session?.user) return;
    const { data: added } = await supabase
      .from("SNFriends")
      .select("*, SNUsers!SNFriends_friendId_fkey(*)")
      .eq("userId", session.user.id);
    const { data: accepted } = await supabase
      .from("SNFriends")
      .select("*, SNUsers!SNFriends_userId_fkey(*)")
      .match({ friendId: session.user.id, status: "accepted" });
    if (added && accepted) {
      const addedFriends = added?.map((x) => x.SNUsers);
      const acceptedFriends = accepted?.map((x) => x.SNUsers);
      setFriends([...addedFriends, ...acceptedFriends]);
    }
    const addedFriends = added?.map((x) => x.friendId);
    const acceptedFriends = accepted?.map((x) => x.userId);
    if (addedFriends && acceptedFriends) {
      setFriendIds([...addedFriends, ...acceptedFriends]);
    }
  }

  function handleOpenMobileMenu() {
    setTranslateX(0);
  }

  if (!posts || !friends || !session?.user.id)
    return <Loading message="Loading homepage" />;

  if (friends.length == 0)
    return (
      <div className="home__no-friends">
        <h3>Sorry! You have no friends.</h3>
        <Button label="Find friends" fn={() => router.push("friends")} />
      </div>
    );

  return (
    <>
      <Notification />
      <ShareModal />
      <Header>
        <h3>Home</h3>
      </Header>
      <main className="home">
        <div className="home__friend-avatars">
          {friends.map((friend, i) => (
            <div key={i} onClick={() => router.push(`/messages/${friend.id}`)}>
              <UserPhoto
                image={friend.img}
                height="60px"
                isOnline={
                  onlineUsers.find((userId) => userId == friend.id)
                    ? true
                    : false
                }
              />
            </div>
          ))}
        </div>
        {posts.length == 0 ? (
          <h3 className="home__no-posts">No posts from friends</h3>
        ) : (
          <List>
            {posts?.map((post, i) => (
              <Post post={post} user={post.SNUsers} key={i} />
            ))}
          </List>
        )}
      </main>
    </>
  );
}
