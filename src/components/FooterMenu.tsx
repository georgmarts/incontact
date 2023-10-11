'use client'
import Link from 'next/link'
import './footerMenu.scss'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

type Props = {}

export default function FooterMenu({}: Props) {
  const {data: session} = useSession()
  const pathname = usePathname()
  const [isNull, setIsNull] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if(!pathname) return
    console.log(pathname)
    if(pathname.includes('messages/') || pathname.includes('signin') || pathname.includes('signup') || pathname.length == 1) {
      setIsNull(true)
    } else {
      setIsNull(false)
      setIsLoading(false)
    }
  }, [pathname])

  if(isNull) return null
  
  return (<>
    {!isLoading && <div className='footer-menu'>
        <Link href='/home'><img src="/icons/home-modern.svg" alt=""/></Link>
        <Link href={`/wall/${session?.user.id}`}><img src="/icons/profile.svg" alt=""/></Link>
        <Link href='/messages'><img src="/icons/chat.svg" alt=""/></Link>
        <Link href='/friends'><img src="/icons/friends.svg" alt=""/></Link>
    </div>}
  </>)
}