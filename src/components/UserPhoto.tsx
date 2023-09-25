'use client'
import './userPhoto.scss'

type Props = {
    image: string | undefined
    height: string
}

export default function UserPhoto({image, height}: Props) {
    const photoStyle = {
        height: height,
        aspectRatio: '1/1',
        borderRadius: '50%'
    }
  return (
    <img src={image} alt="" className='user-photo' style={photoStyle}/>
  )
}