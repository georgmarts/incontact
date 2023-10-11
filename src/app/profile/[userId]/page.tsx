"use client";
import Header from "@/components/Header";
import "./profile.scss";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@/types";
import UserPhoto from "@/components/UserPhoto";
import Button from "@/components/Button";
import ProfileCard from "@/components/ProfileCard";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  params: {
    userId: number;
  };
};

export default function Page({ params }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const { userId } = params;

  useEffect(() => {
    if (!session?.user) return;
    if (session.user.id != userId) router.push(`/wall/${userId}`);
  }, [session?.user]);

  return (
    <main className="profile-page">
      <Header>
        <h3>Profile</h3>
      </Header>
      <ProfileCard userId={params.userId} />
    </main>
  );
}
