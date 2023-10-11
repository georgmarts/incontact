export type Supabase<T> = {
  count: null
  data: T[],
  error: SupabaseError,
  status: number,
  statusText: string
}

export type SupabaseError = {
  code: string,
  message: string
}

export type ReactQueryPostUserParams = {
  user: User,
  birthDate: string
}

export type User = {
    id?: number,
    firstName?: string,
    lastName?: string,
    email?: string,
    phoneNumber?: string,
    password?: string,
    confirmPassword?: string,
    birthDate?: string,
    img?: string,
    onlineAt?: string
}

export type TFriend = {
    userId: number,
    friendId: number,
    SNUsers: User
}

export type Requested = {
    id?: number,
    userId: number,
    friendId: number,
    status: string
  }

export type TMessage = {
    id?: number,
    userId: number, 
    friendId: number,
    message: string,
    createdAt?: string,
    status?: string,
    img?: string,
    SNUsers: User
}

export type TPost = {
  id: string,
  user: number,
  body: string,
  img: string,
  createdAt: string,
  SNUsers: User
}

export type Like = {
  id?: number,
  user: number,
  post: number,
  createdAt: string
}

export type TComment = {
  id: string,
  createdAt: string,
  user: number,
  post: string,
  parentComment: string | null,
  comment: string,
  SNUsers?: User
}

export type TShare = {
  userId: number,
  postId: string 
}


export type OnlineUser = {
  id: number,
  onlineAt: string
}