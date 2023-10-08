'use client'
import { User } from '@/types'
import './profileHeader.scss'
import Button from './Button'
import UserPhoto from './UserPhoto'
import { supabase } from '@/lib/supabaseClient'
import { useSetAtom } from 'jotai'
import { isNewPostDialog } from '@/app/state/jotai'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useRef } from 'react'

type Props = {
    user: User,
    children: React.ReactNode
}

export default function ProfileHeader({user, children}: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  function logOut() {
      signOut({callbackUrl: '/'})
  }

  return (<>
    <dialog className='profile-header__options' ref={dialogRef}>
      <Button label='Log out' color='' fn={logOut}/>
      <Button label='Close' color='#ff0084' fn={() => dialogRef.current?.close()}/>
    </dialog>
    <div className='profile-header'>
        <div className='profile-header__body'>
          <img src="/icons/dots.svg" className='profile-header__dots' alt="" onClick={() => dialogRef.current?.showModal()}/>
            <UserPhoto image={user.img} height='100px'/>
            <h2>{user.firstName} {user.lastName}</h2>
            <p>Some very smart quote noone cares about</p>
            <p>Studied at Very Good State University</p>
            {children}
        </div>
    </div>
    </>
  )
}