'use client'
import Button from "@/components/Button"
import Loading from "@/components/Loading"
import MobileMenu from "@/components/MobileMenu"
import Welcome from "@/components/Welcome"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

type Props = {}

export default function Page({}: Props) {
  const {data: session, status} = useSession()
  const router = useRouter()

  useEffect(() => {
    if(!session?.user) return
    if(status === 'authenticated') router.push('/home')
  }, [session?.user])
  
  return (
    <main className="homepage">
      {status === 'loading' || status === 'authenticated' ? <Loading message="Checking if you are logged in"/> : <Welcome/>}
    </main>
  )
}
