import '../friendsPage.scss'
import FriendPosts from "@/components/Friend/FriendPosts"
import FriendProfile from "@/components/Friend/FriendProfile"
import Header from '@/components/Header'
import Notification from "@/components/Notification"
import ShareModal from '@/components/ShareModal'

type Props = {
    params: {
        friendId: number
    }
}

export default function Page({params}: Props) {
    const {friendId} = params
  return (
    <main className="friend-page">
        <Notification/>
        <ShareModal/>
        <Header>
          <h3>Friend wall</h3>
        </Header>
        <FriendProfile friendId={friendId}/>
        <FriendPosts friendId={friendId}/>
    </main>
  )
}