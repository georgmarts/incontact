'use client'
import './signin.scss'

import Loading from "@/components/Loading"
import Notification from "@/components/Notification"
import SignIn from "@/components/SignIn"
import { useAtomValue } from 'jotai'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { notificationMessage } from '../state/jotai'

type Props = {}

export default function Page({}: Props) {
  const {status} = useSession()
  const router = useRouter()
  const notification = useAtomValue(notificationMessage)
  console.log(notification)

  useEffect(() => {
    if(status === 'authenticated') router.push('/home')
  }, [status])

  return (
    <main className="signin-page">
        {notification === 'Account does not exist. Try again' || notification === 'Something went wrong' ? <Notification/> : null}
        {status === 'loading' || status === 'authenticated' ? <Loading message="Logging in"/> : <SignIn/>}
    </main>
  )
}