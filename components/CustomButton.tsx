import React from 'react'

interface Props {
  title: string
  customStyles: string
  handleClick: any
}

const CustomButton = ({ title, customStyles, handleClick }: Props) => {
  return (
    <button
      onClick={handleClick}
      className={`rounded-md border border-white mt-10 hover:scale-105 transition duration-500 ${customStyles}`}
    >
      {title}
    </button>
  )
}

export default CustomButton
