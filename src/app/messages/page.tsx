'use client'
import './messages.scss'
import Notification from '@/components/Notification'
import { supabase } from '@/lib/supabaseClient'
import { useAtom } from 'jotai'
import { useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import { notificationMessage } from '../state/jotai'
import List from '@/components/List'
import MessageCard from '@/components/MessageCard'
import Header from '@/components/Header'
import Button from '@/components/Button'
import { useRouter } from 'next/navigation'

type Props = {}

type UserId = {
    userId?: number,
    friendId?: number
  }

export default function Page({}: Props) {
  const router = useRouter()
  const {data: session} = useSession()
  const [friends, setFriends] = useState<number[]>()
  const [notification, setNotification] = useAtom(notificationMessage)

  useEffect(() => {
    findFriends()
  }, [session?.user])

  function removeDuplicates(arr: number[]) {
    return arr.filter((item,
        index) => arr.indexOf(item) === index)
  }  
  
  async function findFriends() {
    if(!session?.user) return
    // Find friends who sent you a message
    const { data: from, error } = await supabase.from('SNMessages').select('userId').match({friendId: session.user.id})
    // Find friends you wrote to
    const { data: to } = await supabase.from('SNMessages').select('friendId').match({userId: session.user.id})
    if(from && to) {
      const fromFiltered = from.map(x => x.userId)
      const toFiltered = to.map(x => x.friendId)
      const friendsUnique = removeDuplicates([...fromFiltered, ...toFiltered])
      setFriends(friendsUnique)
    }
    if(error) {
      setNotification('Something went wrong')
    }
}

return (
    <main className='messages-pageX'>
      <Notification/>
        {/* <div className='messages-pageX__header'>
          <h2>Messages</h2>
        </div> */}
        <Header>
          <h3>Messages</h3>
        </Header>
        {friends?.length == 0 &&
        <div className='messages-pageX__no-messages'>
          <h4>No new messages</h4>
          <Button label='Send a message' fn={() => router.push('/friends')}/>
        </div>
        }
        <List>
          {friends?.map((friend, i) =>
            <div key={i}>
              <MessageCard friendId={friend}/>
            </div>
          )}
        </List>
    </main>
  )
}