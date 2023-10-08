import Header from '@/components/Header'
import './profile.scss'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@/types'

type Props = {
  params: {
    userId: number
  }
}

export default async function Page({params}: Props) {
  const {userId} = params
  const {data} = await supabase.from('SNUsers').select().match({id: userId}).single()
  const user: User = data
  return (
    <main className='profile-page'>
        <Header>
            <h3>Profile</h3>
        </Header>
        <div>
          <h3>{user.firstName}</h3>
        </div>
    </main>
  )
}