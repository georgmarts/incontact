'use client'
import { useEffect, useRef, useState } from 'react'
import List from './List'
import Search from './Search'
import './shareModal.scss'
import { TFriend, User } from '@/types'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabaseClient'
import Friend from './Friend'
import { useAtom, useAtomValue } from 'jotai'
import { isShareModalOpen, notificationMessage, shareInfo } from '@/app/state/jotai'
import Button from './Button'

type Props = {}

export default function ShareModal({}: Props) {
    const baseUrl = 'http://localhost:3000/post/'
    const {data: session} = useSession()
    const [friends, setFriends] = useState<User[]>()
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [isDialogOpen, setIsDialogOpen] = useAtom(isShareModalOpen)
    const shareInformation = useAtomValue(shareInfo)
    const [notification, setNotification] = useAtom(notificationMessage)

    useEffect(() => {
        fetchFriends()
    }, [session])

    useEffect(() => {
        if(!dialogRef.current) return
        isDialogOpen && dialogRef.current.showModal()
        !isDialogOpen && dialogRef.current.close()
    }, [isDialogOpen])

    async function fetchFriends() {
        if(!session?.user) return
        const { data: addedFriends } = await supabase.from('SNFriends').select(`*, SNUsers!SNFriends_friendId_fkey(*)`).eq('userId', session.user.id)
        const { data: accepted } = await supabase.from('SNFriends').select(`*, SNUsers!SNFriends_userId_fkey(*)`).eq('friendId', session.user.id).eq('status', 'accepted')
        if(addedFriends && accepted) {
            const formattedOne = addedFriends.map(x => x.SNUsers)
            const formattedThree = accepted.map(x => x.SNUsers)
            setFriends([...formattedOne, ...formattedThree])
        }
    }

    async function handleSharePost(friendId: number | undefined) {
      const {error} = await supabase.from('SNMessages').insert({userId: shareInformation?.userId, friendId: friendId, message: `${baseUrl}${shareInformation?.postId}`})
      if(!error) {
        setIsDialogOpen(false)
        setNotification('Post is shared successfully')        
      }
      if(error) {
        setNotification('Something went wrong')
      }
    }

  return (
    <dialog ref={dialogRef} className='share-modal'>
        {/* <img src="/icons/close.svg" alt="" onClick={() => setIsDialogOpen(false)}/> */}
        <List>
            {friends?.map((friend, i) =>
            <div key={i} onClick={() => handleSharePost(friend.id)}>
              <Friend user={friend}/>     
            </div> 
            )}
        </List>
        <Button label='Close' width='90%' fn={() => setIsDialogOpen(false)}/>
    </dialog>
  )
}