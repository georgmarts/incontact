'use client'

import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"

type Props = {}

export default function Test2({}: Props) {
    const [users, setUsers] = useState<any>()

    useEffect(() => {
      fetch()
      async function fetch() {
        const {data, error} = await supabase.from('testOne').select('friend, testTwo!inner(email)').eq('user', 1)
        // const formatted = data?.map(x => x.testTwo)
        if(data) setUsers(data)
      }
    }, [])
    

  return ( <>
      <p>{JSON.stringify(users)}</p>
    <div>Test2</div>
  </>

  )
}