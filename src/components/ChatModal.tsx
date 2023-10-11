'use client'
import { useAtom } from 'jotai'
import './chatModal.scss'

import React, { useEffect, useRef } from 'react'
import { chatModalAtom } from '@/app/state/jotai'
import Button from './Button'
import { supabase } from '@/lib/supabaseClient'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Props = {
    friendId: number
}

export default function ChatModal(props: Props) {
    const router = useRouter()
    const {data: session} = useSession()
    const [isModalOpen, setIsModalOpen] = useAtom(chatModalAtom)
    const dialogRef = useRef<HTMLDialogElement | null>(null)

    useEffect(() => {
        if(!dialogRef.current) return
      isModalOpen ? dialogRef.current.showModal() : dialogRef.current.close()
    }, [isModalOpen])

    function closeChatModal() {
        if(!dialogRef.current) return
        dialogRef.current.close()
        setIsModalOpen(false)
    }

    async function deleteChat() {
        if(!session?.user) return
        const {error} = await supabase.from('SNMessages').delete().or(`and(userId.eq.${session.user.id},friendId.eq.${props.friendId}),and(userId.eq.${props.friendId},friendId.eq.${session.user.id})`)
        if(!error) {
            router.push('/messages')
            setIsModalOpen(false)
        }
        if(error) console.log(error)
    }

  return (
    <dialog open className='chat-modal' ref={dialogRef}>
        <Button label='Delete chat' fn={deleteChat} color='#ff0084' width='100%'/>
        <Button label='Close menu' fn={closeChatModal} width='100%'/>
    </dialog>
  )
}