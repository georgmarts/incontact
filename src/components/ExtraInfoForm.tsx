'use client'
import { User } from '@/types'
import Button from './Button'
import './extraInfoForm.scss'
import { SubmitHandler, useForm } from "react-hook-form"
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { notificationMessage, userAtom, userId } from '@/app/state/jotai'
import { useRouter } from 'next/navigation'

type Props = {}

export default function ExtraInfoForm({}: Props) {
    const router = useRouter()
    const [user, setUser] = useAtom(userAtom)
    const email = 'user1@email.com'
    const [modalMessage, setModalMessage] = useAtom(notificationMessage)
    const [image, setImage] = useState<File>()
    const [preview, setPreview] = useState<string | null>(null)
    const [birthDate, setBirthDate] = useState('')  
    const imageBaseUrl = 'https://fsmlpmfunvdgvvoanhds.supabase.co/storage/v1/object/public/vk-images/' 
    const [loading, setLoading] = useState(false)
    const [loadingDots, setLoadingDots] = useState('')

    useEffect(() => {
      setTimeout(() => {
        loadingDots.length == 3 ? setLoadingDots('') : setLoadingDots(prev => prev + '.')
      }, 1000)
    }, [loadingDots])
    

    function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if(!e.target.files) return
        const file = e.target.files[0]
        setImage(file)
        setPreview(URL.createObjectURL(file))
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      if(!image || birthDate.length == 0) return 
      setLoading(true)
      const { error: uploadError } = await supabase.storage.from('vk-images').upload(String(user.id), image)
      const { error } = await supabase.from('SNUsers').insert({...user, birthDate: birthDate, img: imageBaseUrl + user.id})
      if(error?.code === '23505') {
        setModalMessage('User already exists')
        setLoading(false)
      }
      if(error?.message === 'TypeError: Failed to fetch') {
        setModalMessage('Network error. Try again')
        setLoading(false)
      }
      if(!error) {
        setLoading(false)
          setModalMessage('User is added successfully')
          setTimeout(() => {
            setModalMessage('')
            router.push('/signin')
            setUser({})
          }, 3000)
      }  
    }

    function removeImage() {
      setPreview(null)
    }

  return (<>
    { loading ? <div className='signup-loading'>
      <img src='/gif/duck.gif'/> 
      <h1>Loading{loadingDots}</h1>
    </div>
: 
    <form className="extra-info-form" onSubmit={handleSubmit}>
        {preview ? <div className='extra-info-form__image-card'>
          <img src={preview} alt="" />
          <Button label='Remove image' width='120px' fn={removeImage} color='#ff0084'/>
        </div>
        :
        <label htmlFor="file">
          <img src="/icons/upload.svg" alt=""/>
          <span>Upload your profile photo</span>
          <input type="file" onChange={handleUpload} id='file' hidden/>
        </label>
        }
        <input type="date" onChange={e => setBirthDate(e.target.value)}/>
        <span>Set your birthdate: </span>
        <Button label='Create account' width='120px'/>
    </form>
    }
  </>)
}