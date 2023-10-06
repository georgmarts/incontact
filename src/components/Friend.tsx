'use client'
import { User } from '@/types'
import UserPhoto from './UserPhoto'
import './friend.scss'
import { useRouter } from 'next/navigation'
import { useAtom } from 'jotai'
import { isShareModalOpen } from '@/app/state/jotai'
import Link from 'next/link'

type Props = {
  user: User
}

export default function Friend({user}: Props) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useAtom(isShareModalOpen)

  function handleOpenMessages() {
    router.push(`/messages/${user.id}`)
  }

  function openWallPage() {
    router.push(`/friends/${user.id}`)
  }
  
  return (
    <div className="friend">
        <div onClick={openWallPage}>
          <UserPhoto image={user.img} height='50px'/>
        </div>
        <p onClick={openWallPage}>{user.firstName} {user.lastName}</p>
        {isDialogOpen ? null : <img src="icons/message.svg" alt="" className='friend-added__icon' onClick={handleOpenMessages}/>}
    </div>
  )
}