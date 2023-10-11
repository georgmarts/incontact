import { supabase } from '@/lib/supabaseClient'
import { TShare, User } from '@/types'
import { atom } from 'jotai'

export const notificationMessage = atom('')
export const userId = atom(0)
export const userAtom = atom<User>({})
export const isNewPostDialog = atom<boolean>(false)
export const isShareModalOpen = atom<boolean>(false)
export const shareInfo = atom<TShare | null>(null)
export const mobileMenuTranslateXAtom = atom(-100)
export const friendAtom = atom<User | null>(null)
export const chatModalAtom = atom(false)
export const updateCommentsCountAtom = atom(false)
