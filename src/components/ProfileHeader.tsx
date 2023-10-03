'use client'
import { User } from '@/types'
import './profileHeader.scss'
import Button from './Button'
import UserPhoto from './UserPhoto'
import { supabase } from '@/lib/supabaseClient'
import { useSetAtom } from 'jotai'
import { isNewPostDialog } from '@/app/state/jotai'
import { useRouter } from 'next/navigation'

type Props = {
    user: User,
    children: React.ReactNode
}

export default function ProfileHeader({user, children}: Props) {
  return (
    <div className='profile-header'>
        <div className='profile-header__body'>
            <UserPhoto image={user.img} height='100px'/>
            <h2>{user.firstName} {user.lastName}</h2>
            <p>Some very smart quote noone cares about</p>
            <p>Studied at Very Good State University</p>
            {children}
        </div>
    </div>
  )
}