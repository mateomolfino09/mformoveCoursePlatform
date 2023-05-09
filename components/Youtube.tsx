import { Item, Playlist, Ricks, Snippet } from '../typings'
import React, { useState } from 'react'

interface Props {
  playlist: Item[]
}

function Youtube({ playlist }: Props) {
  return (
    <div className='w-full h-full'>
      {playlist?.map((item) => {
        const { id, snippet } = item
        const { title, thumbnails } = snippet
        const { medium } = thumbnails
        return (
          <li key={id}>
            <h3>{title}</h3>
            <p>
              <img
                width={medium.width}
                height={medium.height}
                src={medium.url}
                alt='icon youtube'
              />
            </p>
          </li>
        )
      })}
    </div>
  )
}

export default Youtube
