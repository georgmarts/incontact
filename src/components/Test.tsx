'use client'
import './registration.css'
import { supabase } from '../lib/supabaseClient'
import { useEffect, useState } from 'react'
import { User } from '@/types'
var tus = require('tus-js-client')
import axios, { AxiosRequestConfig } from 'axios'

type Props = {}

export default function Test({}: Props) {
const [progress, setProgress] = useState<string>()
const projectId = 'fsmlpmfunvdgvvoanhds'
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbWxwbWZ1bnZkZ3Z2b2FuaGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQyMzc0MzksImV4cCI6MTk5OTgxMzQzOX0.i2Bn_RREm89pe-JXxj6ODl0_bi4bVTkfxFVwGTSYu0g'

function uploadFile(bucketName: string, fileName: string, file: File) {
  return new Promise((resolve, reject) => {
    var upload = new tus.Upload(file, {
      endpoint: `https://${projectId}.supabase.co/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${token}`,
        'x-upsert': 'true', // optionally set upsert to true to overwrite existing files
      },
      uploadDataDuringCreation: true,
      metadata: {
        bucketName: bucketName,
        objectName: fileName,
        contentType: 'image/png',
        cacheControl: 3600,
      },
      chunkSize: 6 * 1024 * 1024, // NOTE: it must be set to 6MB (for now) do not change it
      onError: function (error: any) {
        console.log('Failed because: ' + error)
        reject(error)
      },
      onProgress: function (bytesUploaded: number, bytesTotal: number) {
        var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
        console.log(bytesUploaded, bytesTotal, percentage + '%')
        setProgress(percentage)
      },
      onSuccess: function () {
        // console.log(upload)
        console.log('Download %s from %s', upload.file.name, upload.url)
        resolve()
      },
    })

    // Check if there are any previous uploads to continue.
    return upload.findPreviousUploads().then(function (previousUploads: File[]) {
      // Found previous uploads so we select the first one.
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0])
      }

      // Start the upload
      upload.start()
    })
  })
}
    const [email, setEmail] = useState('')
    const [img, setImg] = useState('')
    const [users, setUsers] = useState<User[] | null>([])

    async function fetchUser() {
            const { data } = await supabase.from('vk-users').select()
            setUsers(data)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const { error } = await supabase.from('vk-users').insert({
            id: Date.now(),
            email: email,
            img: img
        })
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if(!e.target.files) return
        const file = e.target.files[0]
        // const fileName = file.name.split(" ").join("")
        const fileName = String(Date.now())
        // var formData = new FormData();
        // formData.append("image", file);
        // axios.post('upload_file', formData, {
        //     headers: {
        //     'Content-Type': 'multipart/form-data'
        //     }
        // })
        // const options: AxiosRequestConfig = {
        //     headers: { "Content-Type": "multipart/form-data" },
        //     onUploadProgress: (progressEvent: any) => {
        //         const percentage = (progressEvent.loaded * 100) / progressEvent.total;
        //         setProgress(+percentage.toFixed(2));
        //   }
        // }
        // await axios.post('/api/upload', formData, options)
        uploadFile('images', fileName, file)
        // const { data, error } = await supabase.storage.from('images').upload(`${fileName + String(Math.random()).slice(2, 7)}`, file)
        // setImg(`https://fsmlpmfunvdgvvoanhds.supabase.co/storage/v1/object/public/images/${fileName}`)   
    }


  return (<div>
    <div style={{margin: '2rem auto'}}>
    </div>
    {progress}
    <form onSubmit={handleSubmit} className='registration'>
        <img src={img} alt="" />
        <input type="file" onChange={handleUpload}/>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
        <button>Submit</button>
        <button type='button' onClick={fetchUser}>Fetch user info</button>
    </form>
    <div className='users'>
    {users?.map((user, i) => 
        <div key={i}>
            <img src={user.img} alt="" />
            <img src={user.img} alt="" />
            <h3>ID: {user.id}</h3>
            <p>Email: {user.email}</p>
        </div>
    )}
    </div>
    </div>
  )
}