'use client'

import ExtraInfoForm from "@/components/ExtraInfoForm"
import Notification from "@/components/Notification"
import SignUp from "@/components/SignUp"
import { useAtom } from "jotai"
import { useState } from "react"
import { userAtom, userId } from "../state/jotai"

type Props = {}

export default function page({}: Props) {
  const [user, setUser] = useAtom(userAtom)
  return (
    <main>
        <Notification/>
        {Object.keys(user).length == 0 ? <SignUp/> : <ExtraInfoForm/>}
    </main>
  )
}