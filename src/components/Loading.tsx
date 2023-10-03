'use client'
import { useEffect, useState } from 'react'
import './loading.scss'

type Props = {
  message: string
}

export default function Loading({message}: Props) {
  const [loadingDots, setLoadingDots] = useState('...')

  useEffect(() => {
    setTimeout(() => {
      loadingDots.length == 3 ? setLoadingDots('') : setLoadingDots(prev => prev + '.')
    }, 1000)
  }, [loadingDots])

  return (
    <div className='loading'>
      <img src='/gif/duck.gif'/>
      <h3>{message}{loadingDots}</h3>
    </div>
  )
}