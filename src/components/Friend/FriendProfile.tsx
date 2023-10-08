'use client'
import { useEffect, useRef, useState } from 'react'
import './friend.scss'
import { User } from '@/types'
import { supabase } from '@/lib/supabaseClient'
import { useAtom } from 'jotai'
import { friendAtom, notificationMessage } from '@/app/state/jotai'
import ProfileHeader from '../ProfileHeader'
import Button from '../Button'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Props = {
    friendId: number
}

export default function FriendProfile(props: Props) {
    const router = useRouter()
    const {data: session} = useSession()
    const [friend, setFriend] = useAtom(friendAtom)
    const [notification, setNotification] = useAtom(notificationMessage)
    const optionsModalRef = useRef<HTMLDialogElement | null>(null)

    useEffect(() => {
      fetchFriend()
    }, [props])

    async function fetchFriend() {
        const {data, error} = await supabase.from('SNUsers').select().match({id: props.friendId}).single()
        if(data) setFriend(data)
        if(error) setNotification('Something went wrong. Try again')
    }

    async function deleteFriend() {
        if(!session?.user) return
        const {error} = await supabase.from('SNFriends').delete().or(`and(userId.eq.${session.user.id},friendId.eq.${props.friendId}),and(userId.eq.${props.friendId},friendId.eq.${session.user.id})`)
        if(!error) {
            router.push('/friends')
            setNotification(`${friend?.firstName} ${friend?.lastName} is deleted from your friends list`)
            closeOptionsModal()
        }
        if(error) {
            setNotification('Something went wrong. Try again')
            closeOptionsModal()
        }
    }

    function openOptionsModal() {
        if(!optionsModalRef.current) return
        optionsModalRef.current.showModal()
    }

    function closeOptionsModal() {
        if(!optionsModalRef.current) return
        optionsModalRef.current.close()
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
        <dialog ref={optionsModalRef} className='friend-profile__options'>
            <Button label={`Delete ${friend.firstName}`} color='#ff0084' fn={deleteFriend}/>
            <Button label='Cancel' color='#c1b9b0' fn={closeOptionsModal}/>
        </dialog>
        <img src="/icons/dots.svg" alt="" className='friend-profile__dots' onClick={openOptionsModal}/>
        <ProfileHeader user={friend}>
            <Link href={`/messages/${props.friendId}`} style={{all: 'unset'}}><Button label="Send a message"/></Link>
        </ProfileHeader>
    </div>
  )
}