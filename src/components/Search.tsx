'use client'
import './search.scss'

type Props = {
  searchInput: string,
  setSearchInput: (arg: string) => void
}

export default function Search({searchInput, setSearchInput}: Props) {

  return (
    <div className='search'>
        <img src="icons/search.svg" alt="" />
        <input type="text" placeholder='Enter first and last name' value={searchInput} onChange={(e) => setSearchInput(e.target.value)}/>
    </div>
  )
}