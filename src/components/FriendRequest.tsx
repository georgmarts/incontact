'use client'
import { User } from '@/types'
import Button from './Button'
import UserPhoto from './UserPhoto'
import './friendRequest.scss'
import TotalFriends from './TotalFriends'
import { supabase } from '@/lib/supabaseClient'
import { useSession } from 'next-auth/react'
import { useAtom } from 'jotai'
import { notificationMessage, userId } from '@/app/state/jotai'
import { useEffect, useState } from 'react'

type TRequested = {
  id?: number,
  userId: number,
  friendId: number,
}

type Props = {
  friend: User
}

export default function FriendRequest({friend}: Props) {
    const [notification, setNotification] = useAtom(notificationMessage)
    const {data: session} = useSession()
    const totalFriends = 4

    async function handleAddFriend() {
        const  {error} = await supabase.from('SNFriends').update({status: 'accepted'}).eq('userId', friend.id).eq('friendId', session?.user.id)
        setNotification('Friend request is accepted')
  }

    async function handleRejectFriend() {
      await supabase.from('SNFriends').update({status: 'rejected'}).eq('userId', friend.id).eq('friendId', session?.user.id)
      setNotification(`Friendship with ${friend.firstName} ${friend.lastName} is rejected`)
    }

  return (
    <div className="friend-request">
        {friend.img && <UserPhoto image={friend.img} height='70px'/>}
        <div className='friend-request__info'>
            <p className='friend-request__info--name'>{friend.firstName} {friend.lastName}</p>
              <TotalFriends/>
              <div className='friend-request__buttons'>
                  <Button label='Add' fontSize='.875rem' fn={handleAddFriend}/>
                  <Button label='Reject' fontSize='.875rem' fn={handleRejectFriend}/>
              </div>
        </div>
    </div>
  )
}