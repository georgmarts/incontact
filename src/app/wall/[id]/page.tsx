'use client'
import './wall.scss'

import { isNewPostDialog, notificationMessage } from "@/app/state/jotai"
import Comments from '@/components/Comments'
import List from "@/components/List"
import NewPost from '@/components/NewPost'
import Notification from '@/components/Notification'
import Post from "@/components/Post"
import ProfileHeader from '@/components/ProfileHeader'
import ShareModal from '@/components/ShareModal'
import { supabase } from "@/lib/supabaseClient"
import { TPost, User } from "@/types"
import { useAtom } from "jotai"
import { useSession } from 'next-auth/react'
import { useEffect, useState } from "react"

type Props = {
    params: {
        id: number
    }
}

export default function page({params}: Props) {
    const {data: session} = useSession()
    const [isDialogOpen, setIsDialogOpen] = useAtom(isNewPostDialog)
    const [notification, setNotification] = useAtom(notificationMessage)
    const [posts, setPosts] = useState<TPost[]>()
    const [user, setUser] = useState<User>()
    const { id } = params

    useEffect(() => {
      fetchPosts()
      fetchUser()
    //   checkFriend()
    }, [isDialogOpen, session])

    async function fetchPosts() {
        if(!session?.user) return
        const {data, error} = await supabase.from('SNPosts').select().eq('user', session?.user.id).order('createdAt', {ascending: false})
        if(data) setPosts(data)
        if(error) setNotification('Something went wrong. Try again')
    }

    async function fetchUser() {
        const {data, error} = await supabase.from('SNUsers').select().eq('id', id)
        if(data) setUser(data[0])
        if(error) setNotification('Something went wrong. Try again')
    }

    
  return (
    <main className="wall">
        <Notification/>
        <ShareModal/>
        <NewPost/>
       { user && <>
       <ProfileHeader user={user}/>
       <List>
            {posts?.map((post, i) =>
                <Post post={post} user={user} key={i}/>
            )}
        </List>
        </>}
    </main>
  )
}