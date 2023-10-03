'use client'
import Messages from '@/components/Messages'
import './messagesPage.scss'

import { useEffect, useRef, useState } from "react"
import Message from '@/components/Message'
import { useAtom } from 'jotai'
import { chatModalAtom, notificationMessage } from '@/app/state/jotai'
import { supabase } from '@/lib/supabaseClient'
import { useSession } from 'next-auth/react'
import { TMessage, User } from '@/types'
import Button from '@/components/Button'
import Notification from '@/components/Notification'
import UserPhoto from '@/components/UserPhoto'
import { useRouter } from 'next/navigation'
import Loading from '@/components/Loading'
import ChatModal from '@/components/ChatModal'

export default function Page({params} : {params: {friendId: number}}) {
    const router = useRouter()
    const { data: session } = useSession()
    const [notification, setNotification] = useAtom(notificationMessage)
    const {friendId} = params
    const [messages, setMessages] = useState<TMessage[]>([])
    const [message, setMessage] = useState('')
    const [friend, setFriend] = useState<User>()
    const lastMessage = useRef<HTMLDivElement>(null)
    const [user, setUser] = useState<User>()
    const [isChatModalOpen, setIsChatModalOpen] = useAtom(chatModalAtom)

    // useEffect(() => {
    //   lastMessage.current?.scrollIntoView({behavior: 'smooth'})
    // }, [messages?.length])    

    useEffect(() => {
      fetchMessages()
      fetchFriend()
      fetchUser()
    }, [session, messages])
    

    async function fetchMessages() {
      if(!session?.user.id) return
      const {data, error} = await supabase.from('SNMessages').select().or(`and(userId.eq.${session.user.id},friendId.eq.${friendId}),and(userId.eq.${friendId},friendId.eq.${session.user.id})`).order('createdAt', {ascending: false})
      if(data) setMessages(data)
      if(error) setNotification('Something went wrong. Try again')
    }

      const realTime = supabase.channel('custom-channel').on('postgres_changes', 
      {event: '*', schema: 'public', table: 'SNMessages'},
      (payload) => {
        setMessages([...messages, payload.new as TMessage])
      }
      ).subscribe()

    async function fetchUser () {
      if(!session?.user) return
      const {data, error} = await supabase.from('SNUsers').select().eq('id', session.user.id)
      if(data) setUser(data[0])
      if(error) setNotification('Something went wrong. Try again')
    }

    async function fetchFriend() {
      const {data, error} = await supabase.from('SNUsers').select().eq('id', friendId)
      if(data) {
        data.length > 0 && setFriend(data[0])
      }
      if(error) {
        setNotification('Something went wrong. Try again')
      }
    }

    async function handleSend(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      const {error} = await supabase.from('SNMessages').insert({userId: session?.user.id, friendId: friendId, message: message, status: 'sent'})
        if(error) {
          setNotification('Something went wrong')
        }
        if(!error) {
          fetchMessages()
          setMessage('')
        }
    }

    function openFriendWall() {
      router.push(`/friends/${friend?.id}`)
    }

  if(!user || !messages || !friend) return (
    <div className='message-page__loading'>
        <Loading message='Messages are loading'/>
    </div>
  )

  return (
    <main className="message-page">
      <Notification/>
      <ChatModal friendId={friendId}/>
      <div className="message-page__header">
        <img src="/icons/arrow-left.svg" onClick={() => router.back()}/>
        <div className='message-page__header--friend-info' onClick={openFriendWall}>
          <UserPhoto image={friend?.img} height='50px'/>
        <div>
          <p onClick={() => router.push(`/friends/${friend.id}`)}>{friend?.firstName} {friend?.lastName}</p>
          <p className='message-page__header--status'>last seen 2 hours ago</p>
        </div>
        </div>
        <img src="/icons/dots.svg" alt="" onClick={() => setIsChatModalOpen(true)}/>
      </div>
      {
        messages && user && friend &&
          <Messages>
            {messages.map((message, i) => 
                <Message message={message} user={user} friend={friend} key={i}/>
            )}
          </Messages>
      }
      <form onSubmit={handleSend} className='message-page__input-card'>
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}/>
        <Button label='Send' />
      </form>
    </main>
  )
}