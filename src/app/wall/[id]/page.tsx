'use client'
import Button from '@/components/Button'
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
import { useAtom, useSetAtom } from "jotai"
import { useSession } from 'next-auth/react'
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

type Props = {
    params: {
        id: number
    }
}

export default function Page({params}: Props) {
    const router = useRouter()
    const {data: session} = useSession()
    const [isDialogOpen, setIsDialogOpen] = useAtom(isNewPostDialog)
    const [notification, setNotification] = useAtom(notificationMessage)
    const [posts, setPosts] = useState<TPost[]>()
    const [user, setUser] = useState<User>()
    const { id } = params
    const skeletonArray = Array.from({length: 5}, (v, i) => i) 

    useEffect(() => {
        fetchPosts()
        fetchUser()
    }, [isDialogOpen, session, notification])

    useEffect(() => {
        const interval = setInterval(() => {
          fetchPosts()
        }, 5000)
    
        return () => clearInterval(interval)
      }, [])

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

    function handleOpenDialog() {
        setIsDialogOpen(true)
    }

    if(!posts) return (<main className='wall-skeleton-container'>
        <div className='wall-profile-skeleton'>
        <Header>
            <h3>Wall</h3>
        </Header>
            <div className='wall-profile-skeleton__image'></div>
            <div className='wall-profile-skeleton__name'></div>
            <div className='wall-profile-skeleton__quote'></div>
            <div className='wall-profile-skeleton__education'></div>
            <div className='wall-profile-skeleton__button'></div>
        </div>
        {skeletonArray.map((obj, i) => 
            <div className='wall-posts-skeleton' key={i}>
                <div className='wall-posts-skeleton__user-info'>
                    <div className='wall-posts-skeleton__user-info--image'></div>
                    <div className='wall-posts-skeleton__user-info--text'>
                        <div></div>
                        <div></div>
                    </div>
                </div>
                <div className='wall-posts-skeleton__post'>
                    <div></div>
                    <div></div>
                </div>
                <div className='wall-posts-skeleton__icons'>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        )}
        </main>
    )
    
  return (
    <main className="wall">
        <Notification/>
        <ShareModal/>
        <NewPost/>
        <Header>
            <h3>Wall</h3>
        </Header>
       { user && <>
       <ProfileHeader user={user}>
            <Button label='Write a post' width='90%' fn={handleOpenDialog}/>
       </ProfileHeader>
       {posts?.length == 0 ?
            <h4>You have not posted anything yet</h4> :
              <List>
              {posts?.map((post, i) =>
                  <div key={i}>
                      <Post post={post} user={user}/>
                  </div>
              )}
          </List>
        }

        </>}
    </main>
  )
}