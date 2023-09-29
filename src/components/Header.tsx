'use client'
import { usePathname, useRouter } from 'next/navigation'
import './header.scss'
import { useAtom } from 'jotai'
import { mobileMenuTranslateXAtom } from '@/app/state/jotai'
import { useEffect, useState } from 'react'

type Props = {}

export default function Header({}: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const [translateX, setTranslateX] = useAtom(mobileMenuTranslateXAtom)
    const [isNull, setIsNull] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
      if(!pathname) return
      if(pathname.includes('messages/')) {
        setIsNull(true)
      } else {
        setIsNull(false)
        setIsLoading(false)
      }
    }, [pathname])

  if(isNull) return null

  return (<>
    {!isLoading && <div className='header'>
        <img src="/icons/arrow-left.svg" alt="" className='header--arrow-left' onClick={() => router.back()}/>
        <img src="/icons/hamburger.svg" alt="" className='header--hamburger' onClick={() => setTranslateX(0)}/>
    </div>}
  </>)
}