'use client'
import { signOut, useSession } from 'next-auth/react'
import './mobileMenu.scss'

import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@/types'
import { useAtom } from 'jotai'
import { mobileMenuTranslateXAtom, notificationMessage } from '@/app/state/jotai'
import UserPhoto from './UserPhoto'
import Button from './Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Props = {}

export default function MobileMenu({}: Props) {
  const router = useRouter()
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const [user, setUser] = useState<User>()
  const [notification, setNotification] = useAtom(notificationMessage)
  const [translateX, setTranslateX] = useAtom(mobileMenuTranslateXAtom)

  useEffect(() => {
    fetchUser()
  }, [session?.user])
  

  useEffect(() => {
    if(translateX == -100) return
    const handleClickOutside = (event: any) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        clickOutside()
      }
    }
    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [clickOutside])
  
  async function fetchUser() {
    if(!session?.user) return
    const {data, error} = await supabase.from('SNUsers').select().eq('id', session.user.id)
    if(data) setUser(data[0])
    if(error) setNotification('Something went wrong. Try again')
  }

  function clickOutside() {
    setTranslateX(-100)
  }

  function handleCloseMobileMenu() {
    setTranslateX(-100)
  }

  const mobileMenuStyle = {
    transform: `translateX(${translateX}%)`
  }

  return (
    <div className='mobile-menu' style={mobileMenuStyle} ref={mobileMenuRef}>
      <UserPhoto image={user?.img} height='100px'/>
      <h2>{user?.firstName} {user?.lastName}</h2>
      <div className='mobile-menu__nav'>
        <Link href={`/wall/${session?.user.id}`}>Wall</Link>
        <Link href={`/friends`}>Friends</Link>
        <Link href={`/messages`}>Messages</Link>
      </div>
      <div className='mobile-menu__buttons'>
        <Button label='Log out' width='60%' fn={() => signOut({callbackUrl: '/'})} color='#00dc7f'/>   
        <Button label='Close menu' width='60%' fn={handleCloseMobileMenu}/>
      </div>   
    </div>
  )
}