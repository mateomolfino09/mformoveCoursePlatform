'use client';

import React from 'react'

const IndividaulProduct = (product:any) => {
  return (
    <div>
     La descripcion del producto seleccionado es :
     {product?.product?.description}
    </div>
  )
}

export default IndividaulProduct
