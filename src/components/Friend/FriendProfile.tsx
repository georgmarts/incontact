'use client'
import { useEffect, useState } from 'react'
import './friend.scss'
import { User } from '@/types'
import { supabase } from '@/lib/supabaseClient'
import { useAtom } from 'jotai'
import { friendAtom, notificationMessage } from '@/app/state/jotai'
import ProfileHeader from '../ProfileHeader'
import Button from '../Button'
import Link from 'next/link'

type Props = {
    friendId: number
}

export default function FriendProfile(props: Props) {
    const [friend, setFriend] = useAtom(friendAtom)
    const [notification, setNotification] = useAtom(notificationMessage)

    useEffect(() => {
      fetchFriend()
    }, [props])

    async function fetchFriend() {
        const {data, error} = await supabase.from('SNUsers').select().match({id: props.friendId}).single()
        if(data) setFriend(data)
        if(error) setNotification('Something went wrong. Try again')
    }

    if(!friend) return (    
        <div className='friend-profile-skeleton'>
            <div className='friend-profile-skeleton__image'></div>
            <div className='friend-profile-skeleton__name'></div>
            <div className='friend-profile-skeleton__quote'></div>
            <div className='friend-profile-skeleton__education'></div>
            <div className='friend-profile-skeleton__button'></div>
        </div>

    )
    
  return (
    <div className='friend-profile'>
        <ProfileHeader user={friend}>
            <Link href={`/messages/${props.friendId}`} style={{all: 'unset'}}><Button label="Send a message"/></Link>
        </ProfileHeader>
    </div>
  )
}