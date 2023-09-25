'use client'
import { User } from '@/types'
import UserPhoto from './UserPhoto'
import './foundUser.scss'
import Button from './Button'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSession } from 'next-auth/react'
import { notificationMessage } from '@/app/state/jotai'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

type Props = {
  user: User
}

export default function FriendAdded({user: foundUser}: Props) {
    const router = useRouter() 
    const [notification, setNotification] = useAtom(notificationMessage)
    const {data: session} = useSession()
    const [isAdded, setIsAdded] = useState(false)
    const [isYou, setIsYou] = useState(false)
    const [isRequested, setIsRequested] = useState(false)

  useEffect(() => {
      checkFriend()
      checkIfItIsYou()
      checkIfRequested()

      async function checkFriend() {
        const {data: accepted} = await supabase.from('SNFriends').select().eq('userId', session?.user.id).eq('friendId', foundUser.id).eq('status', 'requested')
        const {data: requested} = await supabase.from('SNFriends').select().eq('userId', foundUser.id).eq('friendId', session?.user.id).eq('status', 'accepted')
        if(accepted && requested) {
          accepted.length == 0 && requested.length == 0 ? setIsAdded(false) : setIsAdded(true)
        }
      }

      function checkIfItIsYou() {
        session?.user.id === foundUser.id ? setIsYou(true) : setIsYou(false)
      }

      async function checkIfRequested() {
        const {data: requested} = await supabase.from('SNFriends').select().eq('userId', foundUser.id).eq('friendId', session?.user.id).eq('status', 'requested')
        if(requested) {
          if(requested.length > 0) setIsRequested(true)
          if(requested.length == 0) setIsRequested(false)
        }
      }

    }, [notification, foundUser])

    async function handleAddFriend() {
      await supabase.from('SNFriends').insert({userId: session?.user.id, friendId: foundUser.id, status: 'requested'})
      setNotification('Friend request is sent')
    }

    async function handleAcceptRequest() {
      const {data: requested} = await supabase.from('SNFriends').update({status: 'accepted'}).eq('userId', foundUser.id).eq('friendId', session?.user.id).eq('status', 'accepted')
          setNotification('Friend request is accepted')
    }

    async function handleViewProfile() {
      router.push('/')
    }

  return (
    <div className="found-user">
        {foundUser.img && <UserPhoto image={foundUser.img} height='100%'/>}
        <p>{foundUser.firstName} {foundUser.lastName}</p>
        {
          isRequested &&
          <Button label='Accept' width='max-content' fn={handleAcceptRequest}/>
        }
        {
          isAdded &&
          <Button label='View' width='max-content' fn={handleViewProfile}/>
        }
        {
          !isRequested && !isAdded && !isYou &&
          <Button label='Add' width='max-content' fn={handleAddFriend}/>
        }
    </div>
  )
}