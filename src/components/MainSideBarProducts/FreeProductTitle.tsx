import React from 'react'
import { FreeProduct, ProductDB } from '../../../typings'

interface Props {
    product: FreeProduct
}

const FreeProductTitle = ({product}: Props) => {
  return (
    <div>
        <h1 className='font-boldFont'>
            {product.name}
        </h1>
    </div>
  )
}

export default FreeProductTitle