import './list.scss'
import { ReactNode } from 'react'

type Props = {
   children: ReactNode
}

export default function List({children}: Props) {
  return (
    <div className='list'>
        {children}
    </div>
  )
}