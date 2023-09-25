'use client'
import { useAtom } from 'jotai'
import './newPost.scss'
import { isNewPostDialog, notificationMessage } from '@/app/state/jotai'
import { useEffect, useRef, useState } from 'react'
import Button from './Button'
import { supabase } from '@/lib/supabaseClient'
import { useSession } from 'next-auth/react'

type Props = {}

export default function NewPost({}: Props) {
    const [notification, setNotification] = useAtom(notificationMessage)
    const { data: session } = useSession()
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [isDialogOpen, setIsDialogOpen] = useAtom(isNewPostDialog)
    const [post, setPost] = useState('')

    useEffect(() => {
        isDialogOpen && dialogRef.current?.showModal()
    }, [isDialogOpen])

    function handleCloseDialog() {
        dialogRef.current?.close()
        setIsDialogOpen(false)
    }
    
    async function handleAddPost() {
        const {error} = await supabase.from('SNPosts').insert({user: session?.user.id, body: post})
        if(error) setNotification('Something went wrong. Try again')
        if(!error) {
            handleCloseDialog()
            setPost('')
        }
    }

  return (
    <dialog className='new-post' ref={dialogRef}>
        <img src="/icons/close.svg" alt="" onClick={handleCloseDialog}/>
        <p>Write a post</p>
        <textarea name="" id="" rows={5} value={post} onChange={(e) => setPost(e.target.value)}/>
        <Button label='Publish' width='90%' fn={handleAddPost}/>
    </dialog>
  )
}