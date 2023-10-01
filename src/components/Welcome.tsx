'use client'
import Button from "@/components/Button"
import './welcome.scss'
import Notification from "./Notification"
import { useRouter } from "next/navigation"

type Props = {}

export default function Welcome({}: Props) {
  const router = useRouter()
  function handleLogin() {
    router.push('/signin')
  }
  function handleRegister() {
    router.push('/signup')
  }
  return (
      <div className="welcome-card">
        <Notification/>
        <h1>Social network</h1>
        <Button type='button' width="100px" label="Login" color="#00dc7f" fn={handleLogin}/> 
        <Button type='button' width="100px" label="Register" color="#0277fc" fn={handleRegister}/> 
      </div>
  )
}
