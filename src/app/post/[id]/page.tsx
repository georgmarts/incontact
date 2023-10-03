'use client'
import Post from '@/components/Post'
import './post.scss'
import { TPost, User } from '@/types'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAtom } from 'jotai'
import { notificationMessage } from '@/app/state/jotai'
import Notification from '@/components/Notification'
import { useSession } from 'next-auth/react'
import Comments from '@/components/Comments'
import Loading from '@/components/Loading'
import ShareModal from '@/components/ShareModal'

type Props = {
  params: {
    id: string
  }
}

export default function Page({params}: Props) {
  const {data: session} = useSession()
  const postId = params.id
  const [post, setPost] = useState<TPost>()
  const [notification, setNotification] = useAtom(notificationMessage)

  useEffect(() => {
    fetchPosts()
  }, [session?.user])

  async function fetchPosts() {
      const {data, error} = await supabase.from('SNPosts').select(`*, SNUsers!SNPosts_user_fkey(*)`).eq('id', postId)
      if(data) setPost(data[0])
      if(error) setNotification('Something went wrong. Try again')
  }

  if(!post || !session?.user) return (
   <Loading message='Post is loading'/>
  )

  return (
    <main className='post-page'>
        <Notification/>
        <ShareModal/>
        <Post post={post} user={post.SNUsers}/>
        <Comments postId={postId}/>
    </main>
  )
}