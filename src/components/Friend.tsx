'use client'
import { User } from '@/types'
import UserPhoto from './UserPhoto'
import './friend.scss'
import { useRouter } from 'next/navigation'

type Props = {
  user: User
}

export default function Friend({user}: Props) {
  const router = useRouter()

  function handleOpenMessages() {
    router.push(`/messages/${user.id}`)
  }

  return (
    <div className="friend">
        {user.img && <UserPhoto image={user.img} height='100%'/>}
        <p>{user.firstName} {user.lastName}</p>
        <img src="icons/message.svg" alt="" className='friend-added__icon' onClick={handleOpenMessages}/>
    </div>
  )
}