'use client'
import { TPost, User } from '@/types'
import './post.scss'
import UserPhoto from './UserPhoto'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import Comments from './Comments'
import { useRouter } from 'next/navigation'
import ShareModal from './ShareModal'
import { isShareModalOpen, shareInfo } from '@/app/state/jotai'
import { useAtom } from 'jotai'

type Props = {
  post: TPost,
  user: User
}

export default function Post({post, user}: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const formatter = new Intl.DateTimeFormat('en-US', {dateStyle: 'medium'})
  // const formatter = new Intl.DateTimeFormat('en-US', {dateStyle: 'medium', timeStyle: 'medium'})
  const time = formatter.format(new Date(post.createdAt))
  const [isLiked, setIsLiked] = useState(false)
  const [areCommentsOpen, setAreCommentsOpen] = useState(false)
  const [likes, setLikes] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useAtom(isShareModalOpen)
  const [shareInformation, setShareInformation] = useAtom(shareInfo)

  useEffect(() => {
    checkLike()
    likeCount()
  }, [])
  

  async function checkLike() {
    const { data, error } = await supabase.from('SNLikes').select().eq('user', session?.user.id).eq('post', post.id)
    if(data) {
      if(data.length > 0) setIsLiked(true)
      if(data.length == 0) setIsLiked(false)
    }
  if(error) {
    console.log('Something went wrong')
  }
  }

  async function likeCount() {
    const { data, error } = await supabase.from('SNLikes').select().eq('post', post.id)
    if(data) {
      data.length == 0 && setLikes(null)
      data.length > 0 && setLikes(data.length)
    }
  }

  async function handleLike() {
    const { error } = await supabase.from('SNLikes').insert({user: session?.user.id, post: post.id})
    checkLike()
    likeCount()
  }

  async function handleDislike() {
    const { error } = await supabase.from('SNLikes').delete().eq('user', session?.user.id).eq('post', post.id)
    checkLike()
  }

  function handleShare() {
    if(!session?.user) return
    setIsDialogOpen(true)
    setShareInformation({
      userId: session?.user.id,
      postId: post.id
    })
  }

  return (
    <div className='post'>
        <div className='post__user-card'>
          <UserPhoto image={user.img} height='40px'/>
          <div>
            <p>{user.firstName} {user.lastName}</p>
            <p className='post__date'>{time}</p>
          </div>
        </div>
        <p className='post__body'>{post.body}</p>
        <img src={post.img} alt="" className='post__img'/>
        <div className='post__icons'>
          {!isLiked ?
             <img src="/icons/unlike.svg" alt="" width='30px' onClick={handleLike}/> :
            <>
            <img src="/icons/like.svg" alt="" width='30px' onClick={handleDislike}/>
            {likes && <span>{likes}</span>}
            </>
          }
          <img src="/icons/comment.svg" alt="" width='30px' onClick={() => router.push(`/post/${post.id}`)}/>
          <img src="/icons/share.svg" alt="" width='30px' onClick={() => handleShare()}/>         
        </div>
    </div>
  )
}