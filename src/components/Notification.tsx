'use client'
import { useEffect, useRef } from 'react'
import Button from './Button'
import './notification.scss'
import { PrimitiveAtom, useAtom } from 'jotai'
import { notificationMessage } from '@/app/state/jotai'

type Props = {
}

export default function Notification({}: Props) {
    const [notification, setNotification] = useAtom(notificationMessage)
    const dialogRef = useRef<HTMLDialogElement | null>(null)

    useEffect(() => {
        if(!dialogRef.current) return
        notification.length > 0 && dialogRef.current.showModal()
    }, [notification])    

    function closeNotification() {
        if(!dialogRef.current) return
        setNotification('')
        dialogRef.current.close()
    }

  return (
    <div>
        <dialog className='notification' ref={dialogRef}>
            <p>{notification}</p>
            <Button type='button' width="100px" label="Close" color="#00dc7f" fn={closeNotification}/> 
        </dialog>
    </div>
  )
}