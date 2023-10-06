'use client'
import { TComment } from '@/types'
import './comments.scss'
import Comment from './Comment'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Button from './Button'

type Props = {
    postId: string
}

export default function Comments({postId}: Props) {
    const {data: session} = useSession()
    const [comments, setComments] = useState<TComment[]>()
    const [newComment, setNewComment] = useState('')

    useEffect(() => {
      fetchComments()
    }, [postId])
    

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
            <textarea name="" id="" rows={1} value={newComment} onChange={(e) => setNewComment(e.target.value)}></textarea>
            <Button label='Send' width='50px' fn={handleAddComment}/>
        </div>
    </div>
  )
}