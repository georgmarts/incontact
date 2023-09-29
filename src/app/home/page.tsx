'use client'
import { useSession } from 'next-auth/react'
import './home.scss'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { TPost, User } from '@/types'
import { useAtom, useSetAtom } from 'jotai'
import { mobileMenuTranslateXAtom, notificationMessage } from '../state/jotai'
import List from '@/components/List'
import Post from '@/components/Post'
import MobileMenu from '@/components/MobileMenu'
import UserPhoto from '@/components/UserPhoto'
import { useRouter } from 'next/navigation'
import Notification from '@/components/Notification'
import Loading from '@/components/Loading'
import Header from '@/components/Header'
import ShareModal from '@/components/ShareModal'

type Props = {}

export default function Page({}: Props) {
  const router = useRouter()
  const {data: session} = useSession()
  const [friendIds, setFriendIds] = useState<number[]>([])
  const [friends, setFriends] = useState<User[]>([])
  const [posts, setPosts] = useState<TPost[]>()
  const [notification, setNotification] = useAtom(notificationMessage)
  const [translateX, setTranslateX] = useAtom(mobileMenuTranslateXAtom)

  useEffect(() => {
    checkFriends()
  }, [session])

  useEffect(() => {
    fetchPosts()
  }, [friendIds])

  async function fetchPosts() {
    const {data, error} = await supabase.from('SNPosts').select('*, SNUsers!SNPosts_user_fkey(*)').in('user', friendIds)
    if(data) setPosts(data)
    if(error) setNotification('Something went wrong. Try again')
  }
  
  async function checkFriends() {
    if(!session?.user) return
    const { data: added } = await supabase.from('SNFriends').select('*, SNUsers!SNFriends_friendId_fkey(*)').eq('userId', session.user.id)
    const { data: accepted } = await supabase.from('SNFriends').select('*, SNUsers!SNFriends_userId_fkey(*)').match({friendId: session.user.id, status: 'accepted'})
    if(added && accepted) {
      const addedFriends = added?.map(x => x.SNUsers)
      const acceptedFriends = accepted?.map(x => x.SNUsers)
      setFriends([...addedFriends, ...acceptedFriends])
    }
    const addedFriends = added?.map(x => x.friendId)
    const acceptedFriends = accepted?.map(x => x.userId)
    if(addedFriends && acceptedFriends) {
        setFriendIds([...addedFriends, ...acceptedFriends])
    }
  }

  function handleOpenMobileMenu() {
    setTranslateX(0)
  }

  // const menuBgStyle = {
  //   opacity: translateX == -100 ? '0' : '.7'
  // }

  if(!posts || !friends || !session?.user.id) return (
    <Loading message='Loading homepage'/>
  ) 

  return (<>
    <Notification/>
    <ShareModal/>
    <main className='home'>
      <div className='home__friend-avatars'>
          {friends.map((friend, i) => 
            <div key={i} onClick={() => router.push(`/messages/${friend.id}`)}>
              <UserPhoto image={friend.img} height='60px'/>
            </div>
          )}
        </div>
      <List>
        {posts?.map((post, i) =>
            <Post post={post} user={post.SNUsers} key={i}/>
        )}
      </List>
    </main>
  </>
  )
}