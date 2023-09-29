'use client'
import { User } from '@/types'
import UserPhoto from './UserPhoto'
import './friend.scss'
import { useRouter } from 'next/navigation'
import { useAtom } from 'jotai'
import { isShareModalOpen } from '@/app/state/jotai'

type Props = {
  user: User
}

export default function Friend({user}: Props) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useAtom(isShareModalOpen)

  function handleOpenMessages() {
    router.push(`/messages/${user.id}`)
  }

  return (
    <div className="friend">
        {user.img && <UserPhoto image={user.img} height='100%'/>}
        <p>{user.firstName} {user.lastName}</p>
        {isDialogOpen ? null : <img src="icons/message.svg" alt="" className='friend-added__icon' onClick={handleOpenMessages}/>}
    </div>
  )
}