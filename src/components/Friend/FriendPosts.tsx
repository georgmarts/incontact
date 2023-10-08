'use client'
import { useEffect, useState } from 'react'
import './friend.scss'
import { TPost } from '@/types'
import { supabase } from '@/lib/supabaseClient'
import { friendAtom, notificationMessage } from '@/app/state/jotai'
import { useAtom } from 'jotai'
import List from '../List'
import Post from '../Post'

type Props = {
    friendId: number
}

export default function FriendPosts(props: Props) {
    const [friend, setFriend] = useAtom(friendAtom)
    const [posts, setPosts] = useState<TPost[]>()
    const [notification, setNotification] = useAtom(notificationMessage)
    const skeletonArray = Array.from({length: 5}, (v, i) => i)    

    useEffect(() => {
        fetchPosts()
        const interval = setInterval(() => {
            fetchPosts()
        }, 5000)
        
        return () => clearInterval(interval)
    }, [props, posts])

    async function fetchPosts() {
        const {data, error} = await supabase.from('SNPosts').select().match({user: props.friendId}).order('createdAt', {ascending: false})
        if(data) setPosts(data)
        if(error) setNotification('Something went wrong. Try again')
    }    

    if(posts?.length == 0) return (
        <div className='friend-posts__no-posts'>
            <h3>No posts</h3>
        </div>
    )

    if(!posts || !friend) return (<>
    {skeletonArray.map((obj, i) => 
        <div className='friend-posts-skeleton' key={i}>
            <div className='friend-posts-skeleton__user-info'>
                <div className='friend-posts-skeleton__user-info--image'></div>
                <div className='friend-posts-skeleton__user-info--text'>
                    <div></div>
                    <div></div>
                </div>
            </div>
            <div className='friend-posts-skeleton__post'>
                <div></div>
                <div></div>
            </div>
            <div className='friend-posts-skeleton__icons'>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    )}
    </>
    )

  return (<>
    <div className='friend-posts'>
        <List>
            {posts?.map((post, i) =>
                <div key={i}>
                    <Post post={post} user={friend}/>
                </div>
            )}
        </List>
    </div>
    </>
  )
}