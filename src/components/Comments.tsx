'use client'
import { TComment } from '@/types'
import './comments.scss'
import Comment from './Comment'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Button from './Button'
import { useSetAtom } from 'jotai'
import { updateCommentsCountAtom } from '@/app/state/jotai'
import UserPhoto from './UserPhoto'
import { comment } from 'postcss'

type Props = {
    postId: string
}

export default function Comments({postId}: Props) {
    const {data: session} = useSession()
    const [comments, setComments] = useState<TComment[]>()
    const [newComment, setNewComment] = useState('')
    const updateCommentsCount = useSetAtom(updateCommentsCountAtom)
    const [userImage, setUserImage] = useState<string>()

    useEffect(() => {
      fetchComments()
      fetchUserPhoto()
    }, [postId])   
    
    useEffect(() => {
        fetchComments()

        const interval = setInterval(() => {
            fetchComments()
        }, 5000)

        return () => clearInterval(interval)
    }, []) 
    
    async function fetchUserPhoto() {
        if(!session?.user.id) return
        const {data: userImageUrl, error} = await supabase.from('SNUsers').select('img').match({id: session?.user.id}).single()
        if(userImageUrl) {
            setUserImage(userImageUrl.img)
        }
        if(error) {
            console.log(error)
        }
    }

    async function fetchComments() {
        const {data, error} = await supabase.from('SNComments').select('*, SNUsers!SNComments_user_fkey(*)').eq('post', postId).order('createdAt', { ascending: false })
        if(data) {
            setComments(data)
        }
        if(error) {
            console.log(error)
        }
    }

    async function handleAddComment() {
        const {error} = await supabase.from('SNComments').insert({user: session?.user.id, post: postId, comment: newComment}).eq('post', postId)
        fetchComments()
        setNewComment('')
        updateCommentsCount(prev => !prev)
    }
    // const comments  = [
    // {
    //     id: '1',
    //     user: 99,
    //     post: '99',
    //     parentComment: null,
    //     comment: 'Comment 1'
    // },
    // {
    //     id: '2',
    //     user: 99,
    //     post: '99',
    //     parentComment: '1',
    //     comment: 'Comment 1.1'
    // },
    // {
    //     id: '3',
    //     user: 99,
    //     post: '99',
    //     parentComment: '2',
    //     comment: 'Comment 1.1.1'
    // },    
    // {
    //     id: '4',
    //     user: 99,
    //     post: '99',
    //     parentComment: null,
    //     comment: 'Comment 2'
    // }       
    // ]
    
    const filterByParent = comments?.filter(comment => comment.parentComment == null)

    if(!comments) return

  return (
    <div className='comments'>
        {filterByParent?.length == 0 ? 
        <p>No comments</p> :        
        filterByParent?.map((comment, i) => 
            <Comment comments={comments} parentComment={comment} postId={postId} fetchComments={fetchComments} key={i}/>
        )}
        <div className='comments__form'>
            <UserPhoto image={userImage} height='40px'/>
            <textarea name="" id="" rows={1} value={newComment} onChange={(e) => setNewComment(e.target.value)}></textarea>
            <Button label='Send' width='50px' fn={handleAddComment}/>
        </div>
    </div>
  )
}