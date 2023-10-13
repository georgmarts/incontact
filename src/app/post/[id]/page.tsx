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
import Header from '@/components/Header'
import { useRouter } from 'next/navigation'

type Props = {
  params: {
    id: string
  }
}

export default function Page({params}: Props) {
  const router = useRouter()
  const {data: session} = useSession()
  const postId = params.id
  const [post, setPost] = useState<TPost>()
  const [notification, setNotification] = useAtom(notificationMessage)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [session?.user])
  
  useEffect(() => {
    if(notification === 'Post is deleted') router.push('/home')
  }, [notification])  

  async function fetchPosts() {
      const {data, error} = await supabase.from('SNPosts').select(`*, SNUsers!SNPosts_user_fkey(*)`).eq('id', postId)
      if(data) {
        if(data.length == 0) router.push('/home')
        if(data.length > 0) {
          setPost(data[0])
          setIsLoading(false)
        }
      }
      if(error) {
        setNotification('Something went wrong. Try again')
        setIsLoading(false)
      }
  }

  if(isLoading) return (
   <Loading message='Post is loading'/>
  )

  if(!post || !session?.user.id) return (
    <div className='post-page'>
      <Notification/>
    </div>
  )

  return (
    <main className='post-page'>
        <Notification/>
        <ShareModal/>
        <Header>
          <h3>Post</h3>
        </Header>
        <Post post={post} user={post.SNUsers}/>
        <Comments postId={postId}/>
    </main>
  )
}