import { ReactNode, useRef, useState } from 'react'
import './messages.scss'

type Props = {
    children: ReactNode
}

export default function Messages({children}: Props) {

  return (
    <div className='messages'>
        {children}
    </div>
  )
}
