'use client'

import { supabase } from '@/lib/supabaseClient'
import { useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import TimeAgo from 'react-timeago'

type OnlineUser = {
  id: number,
  onlineAt: string
}

type Props = {}

export default function Page({}: Props) {
  const {data: session} = useSession()
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const formatter = new Intl.DateTimeFormat('en-US', {dateStyle: 'medium', timeStyle: 'medium'})

  useEffect(() => {
    const channel = supabase.channel('chat')

    channel
      .on('presence', { event: 'sync' }, () => {
          const presenceState = channel.presenceState()
          const users = Object.keys(presenceState)
          .map((presenceId) => {
            const presences = presenceState[presenceId] as unknown as OnlineUser[]
            return presences.map((presence) => {return {id: presence.id, onlineAt: presence.onlineAt}})
          })
          .flat()
          setOnlineUsers(users)
        })
      .subscribe(async (status) => {
        if(!session?.user) return
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: session.user.id,
            onlineAt: new Date()
          })
          await supabase.from('SNUsers').update({onlineAt: new Date()}).match({id: session?.user.id})
        }
      })

      return () => {
        channel.unsubscribe()
    }

  }, [session?.user])

  
  return (
    <main>
      {onlineUsers.map((user, i) =>
      <div key={i}>
        <p>{user.id}</p>
        <p>{formatter.format(new Date(user.onlineAt))}</p>
        <TimeAgo date={user.onlineAt}/>
      </div>
      )}
    </main>
  )
}