'use client'
import { TFriend, TMessage, User } from '@/types'
import './message.scss'
import { useSession } from 'next-auth/react'
import UserPhoto from './UserPhoto'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { notificationMessage } from '@/app/state/jotai'
import Button from './Button'

type Props = {
    message: TMessage,
    user: User,
    friend: User
}

export default function Message({message, user, friend}: Props) {
  const { data: session } = useSession()
  const baseUrl = 'https://incontact.vercel.app/post/'
  const baseImageUrl = 'https://fsmlpmfunvdgvvoanhds.supabase.co/storage/v1/object/public/vk-images/'
  const [notification, setNotification] = useAtom(notificationMessage)
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  async function deleteMessage() {
    if(!dialogRef.current) return
    const {error} = await supabase.from('SNMessages').delete().match({id: message.id})
    if(error) setNotification('Something went wrong.Try again')
    if(message.img) {
      const imagePath = message.img.replace(baseImageUrl, '')
      const {error} = await supabase.storage.from('vk-images').remove([imagePath])
      if(error) setNotification('Something went wrong')
    }
    dialogRef.current.close()
  }

  function closeDialog() {
    if(!dialogRef.current) return
    dialogRef.current.close()
  }

  function MessageBody() {
    return (
        <div className='message-body'>
        {message.message.slice(0, 5) === baseUrl.slice(0, 5) ?
        <a href={message.message}>{message.message}</a> :
        <>
        {message.img && <img src={message.img} alt=""/>}
        <p>{message.message}</p>
        </>
        }
      </div>
    )
  }

  if(message.userId === user.id) return (<>
      <dialog ref={dialogRef} className='message-by-user__options'>
        <Button label='Delete' color='#00dc7f' fn={deleteMessage}/>
        <Button label='Cancel' color='grey' fn={closeDialog}/>
      </dialog>
      <div className='message-by-user' onClick={() => dialogRef.current?.showModal()}>

        <div className='message-by-user__header'>
          <UserPhoto image={user.img} height='40px'/>
          <div>
            <h3>{user?.firstName} {user?.lastName}</h3>
          </div>
        </div>
        <MessageBody/>
      </div>
      </>
  )

  if(message.userId === friend.id)
  return (
      <div className='message-by-friend'>
        <div className='message-by-friend__header'>
          <UserPhoto image={friend.img} height='40px'/>
          <div>
            <h3>{friend?.firstName} {friend?.lastName}</h3>
          </div>
        </div>
        <MessageBody/>
      </div>
  )
}