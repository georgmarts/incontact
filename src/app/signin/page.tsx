'use client'

import Notification from "@/components/Notification"
import SignIn from "@/components/SignIn"

type Props = {}

export default function Page({}: Props) {

  return (
    <main>
        <Notification/>
        <SignIn/>
    </main>
  )
}