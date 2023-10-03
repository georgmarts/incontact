'use client'
import './friendsPage.scss'
import Search from '@/components/Search'
import Notification from '@/components/Notification'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@/types'
import { useSession } from 'next-auth/react'
import { useAtom } from 'jotai'
import { notificationMessage } from '../state/jotai'
import List from '@/components/List'
import FoundUser from '@/components/FoundUser'
import FriendRequest from '@/components/FriendRequest'
import Friend from '@/components/Friend'
import { useRouter } from 'next/navigation'
import FriendSkeleton from '@/components/FriendSkeleton'

type Props = {}

export default function Page({}: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const [notification, setNotification] =useAtom(notificationMessage)
  const [friends, setFriends] = useState<User[]>()
  const [friendRequests, setFriendRequests] = useState<User[]>()
  const [foundUsers, setFoundUsers] = useState<User[]>()
  const [searchInput, setSearchInput] = useState('')
  const friendsListSkeleton = Array.from({length: 3}, (val, i) => {
    return 0
  })

  console.log(friendsListSkeleton)
  
  useEffect(() => {
    fetchFriends()
    async function fetchFriends() {
      if(!session?.user) return
      const { data: addedFriends } = await supabase.from('SNFriends').select(`*, SNUsers!SNFriends_friendId_fkey(*)`).eq('userId', session.user.id)
      const { data: accepted } = await supabase.from('SNFriends').select(`*, SNUsers!SNFriends_userId_fkey(*)`).eq('friendId', session.user.id).eq('status', 'accepted')
      const { data: requests } = await supabase.from('SNFriends').select(`*, SNUsers!SNFriends_userId_fkey(*)`).eq('friendId', session.user.id).eq('status', 'requested')
      if(addedFriends && requests && accepted) {
        const formattedOne = addedFriends.map(x => x.SNUsers)
        const formattedTwo = requests.map(x => x.SNUsers)
        const formattedThree = accepted.map(x => x.SNUsers)
        setFriends([...formattedOne, ...formattedThree])
        setFriendRequests(formattedTwo)
      }
    }
  }, [notification, session]) 

  useEffect(() => {
    fetchSearch()
    async function fetchSearch() {
      const { data, error } = await supabase.from('SNUsers').select().ilike('firstName', `%${searchInput}%`)
      if(error) setNotification('Something went wrong. Try again')
      if(data) setFoundUsers(data)
    }
  }, [searchInput])

  return (
    <main className='friends-page'>
      <Notification/>
      <div className='friends-page__header'>
        <h2 className='friends-page__header--title'>Friends</h2>
        {friends && <span className='friends-page__header--count'>({friends?.length})</span>}
      </div>
      <Search searchInput={searchInput} setSearchInput={setSearchInput}/>
      {
      foundUsers && foundUsers.length > 0 && searchInput.length > 0 && <>
      <p className='friends-page__tag'>Found users</p>
      <List>
        {foundUsers.map((user, i) =>
            <FoundUser user={user} key={i}/>    
        )}
      </List>
      </>
      }
      {foundUsers && foundUsers.length == 0 && searchInput.length > 0 &&
      <p className='friends-page__tag'>No users found</p>
      }
      {
      friendRequests && friendRequests.length > 0 && <>
        <p className='friends-page__tag'>Friend requests</p>
        <List>
          {friendRequests.map((user, i) => 
              <FriendRequest friend={user} key={i}/>
          )}
        </List>
      </>
      }
        {friends ? <p className='friends-page__tag'>{friends?.length > 0 ? 'Friends list' : 'You do not have friends'}</p> :
        <div style={{
          height: '1rem',
          width: '10ch',
          background: 'rgba(128, 128, 128, 0.4)',
          borderRadius: '.5rem'
        }}></div>
        }
        <List>
          {!friends ?
          friendsListSkeleton.map((friend, i) => 
            <FriendSkeleton/>
          ) : 
          friends.map((user, i) => 
              <Friend user={user} key={i}/>
          )
          }
          </List>
    </main>

)
}