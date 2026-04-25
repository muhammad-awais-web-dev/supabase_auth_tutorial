"use client";

import React from 'react'
import { useParams } from 'next/navigation'

const page = () => {
  const { id } = useParams()

  return (

    <div>
      <h1>Chat ID: {id}</h1>
      {/* Chat interface goes here */}
    </div>
  )
}

export default page
