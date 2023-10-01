'use client'
import { TFriend, User } from '@/types'
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
    const [added, setAdded] = useState<TFriend[]>()
    const [isYou, setIsYou] = useState(false)
    const [requested, setRequested] = useState<TFriend[]>()

  useEffect(() => {
      checkIfAdded()
      checkIfItIsYou()
      checkIfRequested()

      async function checkIfAdded() {
        if(!session?.user) return
        const {data} = await supabase.from('SNFriends').select().or(`and(userId.eq.${session.user.id},friendId.eq.${foundUser.id}),and(userId.eq.${foundUser.id},friendId.eq.${session.user.id},status.eq.accepted)`)
        if(data) {
          setAdded(data)
        }
      }

      console.log(added)

      function checkIfItIsYou() {
        if(!session?.user) return
        if (session?.user.id === foundUser.id) {
          setIsYou(true)
        } else {
          setIsYou(false)
        }
      }

      async function checkIfRequested() {
        if(!session?.user.id) return
        const {data: requested} = await supabase.from('SNFriends').select().eq('userId', foundUser.id).eq('friendId', session.user.id).eq('status', 'requested')
        if(requested) {
          setRequested(requested)
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

    async function viewProfile() {
      router.push(`/friends/${foundUser.id}`)
    }

  return (
    <div className="found-user">
        {foundUser.img && <UserPhoto image={foundUser.img} height='100%'/>}
        <p>{foundUser.firstName} {foundUser.lastName}</p>
        {added && requested && <>
        {
          requested.length > 0 &&
          <Button label='Accept' width='max-content' fn={handleAcceptRequest}/>
        }
        {
          added.length > 0 && !isYou &&
          <Button label='View' width='max-content' fn={viewProfile}/>
        }
        {
          isYou &&
          <Button label='Home' width='max-content' fn={() => router.push('/home')}/>
        }
        {
          requested.length == 0 && added.length == 0 && !isYou &&
          <Button label='Add' width='max-content' fn={handleAddFriend}/>
        }
        </>}
    </div>
  )
}