'use client'
import { User } from '@/types'
import Button from './Button'
import './signin.scss'
import { SubmitHandler, useForm } from "react-hook-form"
import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'
import { useAtom } from 'jotai'
import { notificationMessage } from '@/app/state/jotai'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Props = {}

export default function SignIn({}: Props) {
    const router = useRouter()
    const { data: session } = useSession()
    const [modalMessage, setModalMessage] = useAtom(notificationMessage)
    const emailValidation = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/

    const { register,
            handleSubmit,
            formState: {errors},
            reset,
            watch
    } = useForm<User>()
    const onSubmit: SubmitHandler<User> = async (data: User) => {
        const {email, password} = data
        const response = await signIn('credentials', {email: email, password: password, redirect: false})
        if(response?.error) setModalMessage(response.error)
        if(!response?.error) {
            setModalMessage('You logged in successfully')
            reset()
            router.push('/home')
        }
    }

  return (
    <form className="registration" onSubmit={handleSubmit(onSubmit)}>
        <h2>Log in</h2>
        <input type="email" placeholder='Email' {...(register('email', {
                required: 'Email is required',
                pattern: {
                  value: emailValidation,
                  message: 'Invalid email'
                }
              }
        ))}/>
        <span>{ errors.email?.message }</span>
        <input type="password" placeholder='Password' {...(register('password', {
                required: 'Password is required'
        }))}/>
        <span>{ errors.password?.message }</span>
        <Button label='Submit' width='120px'/>
    </form>
  )
}