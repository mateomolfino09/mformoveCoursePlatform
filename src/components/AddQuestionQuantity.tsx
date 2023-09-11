import React, { useState } from 'react'

interface Props {
    setQuantity: any
    quantity: number
}

const AddQuestionQuantity = ({ setQuantity, quantity }: Props) => {
  return (
    <div className='w-full h-auto mb-4 flex flex-col px-1'>
        <h2 className='w-full text-center text-gray-200 mt-3 text-2xl'>Elija el largo del Cuestionario</h2>
        <div className="relative flex flex-wrap items-stretch mt-2">
        <label
            className="flex items-center whitespace-nowrap rounded-l border border-r-0 border-solid border-neutral-300 px-3 py-[0.25rem] text-center text-base font-normal leading-[1.6] text-neutral-700 dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200"
            htmlFor="inputGroupSelect01"
            >Cantidad</label>
        <select
            className="form-select relative m-0 block w-[1px] min-w-0 flex-auto rounded-r border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary" onChange={(e: any) => setQuantity(e.target.value)}
            id="inputGroupSelect01" value={quantity != null ? quantity : 5}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
        </select>
        </div>

    </div>
  )
}

export default AddQuestionQuantity