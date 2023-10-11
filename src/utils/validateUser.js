import { supabase } from "../lib/supabaseClient"


export async function validateUser(email, password) {
        const data = supabase.from('SNUsers').select().eq('email', email).eq('password', password)
        return data
}