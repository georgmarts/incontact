'use client'
import { Like, TPost, User } from '@/types'
import './post.scss'
import UserPhoto from './UserPhoto'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabaseClient'
import { FormEvent, useEffect, useRef, useState } from 'react'
import Comments from './Comments'
import { useRouter } from 'next/navigation'
import ShareModal from './ShareModal'
import { isShareModalOpen, notificationMessage, shareInfo } from '@/app/state/jotai'
import { useAtom, useSetAtom } from 'jotai'
import Button from './Button'

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
  const [likes, setLikes] = useState<Like[]>([])
  const [isDialogOpen, setIsDialogOpen] = useAtom(isShareModalOpen)
  const [shareInformation, setShareInformation] = useAtom(shareInfo)
  const [postModal, setPostModal] = useState(false)
  const postModalRef = useRef<HTMLDialogElement | null>(null)
  const setNotification = useSetAtom(notificationMessage)
  const [postBody, setPostBody] = useState<string>()
  const [editModal, setEditModal] = useState(false)
  const editModalRef = useRef<HTMLDialogElement | null>(null)


  useEffect(() => {
    checkLike()
    likeCount()
  }, [session?.user, user, likes])

  useEffect(() => {
    if(!postModalRef.current) return
    postModal ? postModalRef.current.showModal() : postModalRef.current.close()
  }, [postModal])

  useEffect(() => {
    if(!editModalRef.current) return
    editModal ? editModalRef.current.showModal() : editModalRef.current.close()
  }, [editModal])
  
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
      setLikes(data)
      // data.length == 0 && setLikes(null)
      // data.length > 0 && setLikes(data.length)
    }
  }

  const realTime = supabase.channel('likes').on('postgres_changes', 
  {event: '*', schema: 'public', table: 'SNLikes'},
  (payload) => {
    if(!likes) return
    setLikes([...likes, payload.new as Like])
  }
  ).subscribe()

  async function handleLike() {
    const { error } = await supabase.from('SNLikes').insert({user: session?.user.id, post: post.id})
    checkLike()
    likeCount()
  }

  async function handleDislike() {
    const { error } = await supabase.from('SNLikes').delete().eq('user', session?.user.id).eq('post', post.id)
    checkLike()
    likeCount()
  }

  function handleShare() {
    if(!session?.user) return
    setIsDialogOpen(true)
    setShareInformation({
      userId: session?.user.id,
      postId: post.id
    })
  }

  function openEditModal() {
    setEditModal(true)
    setPostModal(false)
    setPostBody(post.body)
  }

  async function handleDeletePost() {
    const { error } = await supabase.from('SNPosts').delete().match({id: post.id})
    if(!error) {
      setNotification('Post is deleted')
    }
    if(error) {
      setNotification('Something went wrong. Try again')
    }
    setPostModal(false)
  }

  async function handleEditPost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const { error } = await supabase.from('SNPosts').update({body: postBody}).match({id: post.id})
    if(!error) {
      setNotification('Post is updated')
      setEditModal(false)
    }
    if(error) {
      setNotification('Something went wrong. Try again')
    }
    setPostModal(false)
  }

  return (
    <div className='post'>
        <div className='post__user-card'>
          <UserPhoto image={user.img} height='40px'/>
          <div className='post__user-card--name'>
            <p onClick={() => router.push(`/friends/${user.id}`)}>{user.firstName} {user.lastName}</p>
            <p className='post__date'>{time}</p>
          </div>
          <img src="/icons/dots.svg" alt="" width={30} className='post__user-card--dots' onClick={() => setPostModal(true)}/>
          <dialog className='post__user-card--options-modal' ref={postModalRef}>
            <Button label='Edit post' width='100%' fn={openEditModal}/>
            <Button label='Delete post' width='100%' color='#ff0084' fn={handleDeletePost}/>
            <Button label='Cancel' color='#c1b9b0' fn={() => setPostModal(false)} width='100%'/>
          </dialog>
          {/* <div className='post__user-card--options'>
            <p>Edit post</p>
            <p>Delete post</p>
          </div> */}
        </div>
        <p className='post__body'>{post.body}</p>
        <dialog className='post__edit-modal' ref={editModalRef}>
          <form onSubmit={handleEditPost}>
            <textarea value={postBody} rows={3} onChange={(e) => setPostBody(e.target.value)}></textarea>
            <Button label='Submit' width='80%'/>
            <Button label='Cancel' width='80%' color='#c1b9b0' fn={() => setEditModal(false)} type='button'/>
          </form>
        </dialog>
        <img src={post.img} alt="" className='post__img'/>
        <div className='post__icons'>
          {likes.length == 0 ?
            <img src="/icons/unlike.svg" alt="" width='30px' onClick={isLiked ? handleDislike : handleLike}/> :
            <>
              <img src="/icons/like.svg" alt="" width='30px' onClick={isLiked ? handleDislike : handleLike}/>
              <span>{likes?.length}</span>
            </>
          }
          <img src="/icons/comment.svg" alt="" width='30px' onClick={() => router.push(`/post/${post.id}`)}/>
          <img src="/icons/share.svg" alt="" width='30px' onClick={() => handleShare()}/>         
        </div>
    </div>
  )
}