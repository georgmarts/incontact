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
import { useRouter } from 'next/navigation'

type Props = {
  params: {
    id: string
  }
}

export default function PostModal({params}: Props) {
  const router = useRouter()
  const {data: session} = useSession()
  const postId = params.id
  const [post, setPost] = useState<TPost>()
  const [user, setUser] = useState<User>()
  const [notification, setNotification] = useAtom(notificationMessage)

  useEffect(() => {
    fetchPosts()
    fetchUser()
  }, [session?.user])

  async function fetchPosts() {
      const {data, error} = await supabase.from('SNPosts').select().eq('id', postId)
      if(data) setPost(data[0])
      if(error) setNotification('Something went wrong. Try again')
  }

  async function fetchUser() {
      if(!session?.user) return
      const {data, error} = await supabase.from('SNUsers').select().eq('id', session?.user.id)
      if(data) setUser(data[0])
      if(error) setNotification('Something went wrong. Try again')
  }

  if(!post || !user || !session?.user) return (
    <h1>Loading...</h1>
  )

  return (
    <main className='post-page'>
        <div className='post-page__header'>
          <img src="/icons/arrow-left.svg" alt="" onClick={() => router.push(`/wall/${session.user.id}`)}/>
        </div>
        <Notification/>
        <Post post={post} user={user}/>
        <Comments postId={postId}/>
    </main>
  )
}