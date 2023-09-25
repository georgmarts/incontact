'use client'
import Button from "@/components/Button"
import MobileMenu from "@/components/MobileMenu"
import Test2 from "@/components/Test2"
import Welcome from "@/components/Welcome"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

type Props = {}

export default function page({}: Props) {
  const {data: session} = useSession()
  const router = useRouter()

  useEffect(() => {
    if(!session?.user) return
    router.push('/home')
  }, [session?.user])
  
  return (
    <main className="homepage">
      <Welcome/>
    </main>
  )
}
