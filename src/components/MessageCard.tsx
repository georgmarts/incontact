'use client'
import { supabase } from '@/lib/supabaseClient'
import './messageCard.scss'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useAtom } from 'jotai'
import { notificationMessage } from '@/app/state/jotai'
import { TMessage, User } from '@/types'
import UserPhoto from './UserPhoto'
import { useRouter } from 'next/navigation'

type Props = {
    friendId: number
}

export default function MessageCard({friendId}: Props) {
    const router = useRouter()
    const {data: session} = useSession()
    const [lastMessage, setLastMessage] = useState<TMessage>()
    const [notification, setNotification] = useAtom(notificationMessage)
    const [friend, setFriend] = useState<User>()
    const formatter = new Intl.DateTimeFormat('en-US', {dateStyle: 'medium'})
    const [time, setTime] = useState<any>()

    useEffect(() => {
      fetchLastMessage()
      fetchFriend()
    }, [session?.user])    

    async function fetchFriend() {
      if(!session?.user.id) return
      const { data, error } = await supabase.from('SNUsers').select().match({id: friendId}).single()
      if(error) setNotification('Something went wrong. Try again')
      if(data) setFriend(data)
    }
        
    async function fetchLastMessage() {
        if(!session?.user) return
        const {data, error} = await supabase.from('SNMessages').select().or(`and(userId.eq.${session.user.id},friendId.eq.${friendId}),and(userId.eq.${friendId},friendId.eq.${session.user.id})`).order('createdAt', {ascending: false}).limit(1).single()
        // const {data, error} = await supabase.from('SNMessages').select('message').or(`userId.eq.${session?.user.id},and(friendId.eq.${friendId}),userId.eq.${friendId},and(friendId.eq.${session.user.id})`).order('createdAt', {ascending: false}).limit(1)
        if(data) {
          setLastMessage(data)
         setTime(formatter.format(new Date(data.createdAt)))
        }
        if(error) setNotification('Something went wrong')

    }

  if(!lastMessage || !friend) return (
    <div className='message-card'>
        <p>Skeleton</p>
    </div>
  )

  return (
    <div className='message-card' onClick={() => router.push(`/messages/${friendId}`)}>
        <UserPhoto image={friend.img} height='50px'/>
        <div>
          <p className='message-card__username'>{friend?.firstName} {friend?.lastName}</p>
          <p className='message-card__message'>{lastMessage.message}</p>
        </div>
    </div>
  )
}