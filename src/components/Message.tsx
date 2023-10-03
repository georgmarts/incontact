'use client'
import { TFriend, TMessage, User } from '@/types'
import './message.scss'
import { useSession } from 'next-auth/react'
import UserPhoto from './UserPhoto'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

type Props = {
    message: TMessage,
    user: User,
    friend: User
}

export default function Message({message, user, friend}: Props) {
  const { data: session } = useSession()
  const baseUrl = 'https://incontact.vercel.app/post/'

  function MessageCard() {
    return (
        <>
        {message.message.slice(0, 5) === baseUrl.slice(0, 5) ?
        <a href={message.message}>{message.message}</a> :
        <p>{message.message}</p>
        }
      </>
    )
  }

  if(message.userId === user.id) return (
      <div className='message-by-user'>
        <UserPhoto image={user.img} height='40px'/>
        <div>
          <h3>{user?.firstName} {user?.lastName}</h3>
          <MessageCard/>
        </div>
      </div>
  )

  if(message.userId === friend.id)
  return (
      <div className='message-by-friend'>
        <UserPhoto image={friend.img} height='40px'/>
        <div>
          <h3>{friend?.firstName} {friend?.lastName}</h3>
          <MessageCard/>
        </div>
      </div>
  )
}