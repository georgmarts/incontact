import UserPhoto from './UserPhoto'
import './totalFriends.scss'

type Props = {}

export default function TotalFriends({}: Props) {
    const users = [{img: 'users/user1.jpg'}, {img: 'users/user1.jpg'}, {img: 'users/user1.jpg'}, {img: 'users/user1.jpg'}]
  return (
    <div className='total-friends'>
        <div className='total-friends__photos'>
            {users.map((user, i) => 
                <UserPhoto image={user.img} height='30px' key={i}/>
            )}
        </div>
        <p>{users.length} mutual friends</p>
    </div>
  )
}