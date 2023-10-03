'use client'
import { TComment } from '@/types'
import './comment.scss'
import { supabase } from '@/lib/supabaseClient'
import { useSession } from 'next-auth/react'
import Button from './Button'
import { useState } from 'react'
import UserPhoto from './UserPhoto'
import { useRouter } from 'next/navigation'

type Props = {
    postId: string,
    comments: TComment[],
    parentComment: TComment,
    fetchComments: () => void
}

export default function Comment({postId, comments, parentComment, fetchComments}: Props) {
    const router = useRouter()
    const { data:session } = useSession()
    const [isReply, setIsReply] = useState(false)
    const [reply, setReply] = useState('')
    const formatter = new Intl.DateTimeFormat('en-US', {dateStyle: 'medium'})
    // const formatter = new Intl.DateTimeFormat('en-US', {dateStyle: 'medium', timeStyle: 'medium'})
    const time = formatter.format(new Date(parentComment.createdAt))
    
    async function handleAddComment() {
        const {error} = await supabase.from('SNComments').insert({user: session?.user.id, post: postId, parentComment: parentComment.id,  comment: reply}).eq('post', postId)
        fetchComments()
        setIsReply(false)
        setReply('')
    }

    function handleCancelReply() {
        setIsReply(false)
        setReply('')
    }

    async function handleDelete() {
        const {error} = await supabase.from('SNComments').delete().eq('user', session?.user.id).eq('post', postId).eq('id', parentComment.id)
        fetchComments()
        console.log(error)
    }
    // const comments  = [
    //     {
    //         id: '1',
    //         user: 99,
    //         post: '99',
    //         parentComment: null,
    //         comment: 'Comment 1'
    //     },
    //     {
    //         id: '2',
    //         user: 99,
    //         post: '99',
    //         parentComment: '1',
    //         comment: 'Comment 1.1'
    //     },
    //     {
    //         id: '3',
    //         user: 99,
    //         post: '99',
    //         parentComment: '2',
    //         comment: 'Comment 1.1.1'
    //     },    
    //     {
    //         id: '4',
    //         user: 99,
    //         post: '99',
    //         parentComment: null,
    //         comment: 'Comment 2'
    //     }       
    //     ]

    const childrenComments:TComment[] = comments.filter(comment => comment.parentComment === parentComment.id)
    return (
    <div className='comment'>
        <div className='comment__user'>
          <UserPhoto image={parentComment.SNUsers?.img} height='40px'/>
          <div>
            <p onClick={() => router.push(`/friends/${parentComment.SNUsers?.id}`)}>{parentComment.SNUsers?.firstName} {parentComment.SNUsers?.lastName}</p>
            <p className='post__date'>{time}</p>
          </div>
        </div>
        <p>{parentComment.comment}</p>
        {!isReply && <div className='comment__reply-delete-card'>
            <Button label='Reply' width='50px' fn={() => setIsReply(prev => !prev)}/>
            {session?.user.id === parentComment.SNUsers?.id && <Button label='Delete' width='50px' fn={handleDelete}/>}
        </div>}
        {isReply && <div className='comment__reply'>
            <textarea name="" id="" rows={1} value={reply} onChange={(e) => setReply(e.target.value)}/>
            <Button label='Send' width='50px' fn={handleAddComment}/>
            <Button label='X' width='50px' fn={handleCancelReply}/>
        </div>}
        {childrenComments.length > 0 &&
        <div className='comment__children'>
            {childrenComments.map((comment, i) => <div key={i}>
                <Comment parentComment={comment} comments={comments} postId={postId} fetchComments={fetchComments}/>
            </div>)}
        </div>}
    </div>
  )
}