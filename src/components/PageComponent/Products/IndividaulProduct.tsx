'use client';

import React from 'react';
import './IndividualProduct.css';

const IndividualProduct = ({ product }) => {
  return (
    <div className="product-page">
      <header className="product-header">
        <h1>MForMove</h1>
      </header>
      <main className="product-main">
        <div className="product-details">
          <div className="product-name-image">
            <h2 className='titulo'>{product?.name}</h2>
            <div className="product-image">
              <img
                src={
                  'https://img.freepik.com/foto-gratis/vista-posterior-mujer-haciendo-yoga-al-aire-libre_23-2148769551.jpg'
                }
                alt={product?.name}
              />
            </div>
          </div>
          <p>{product?.description}</p>
          <p>Precio: {product?.price}</p>
          <p>Cantidad de clases: {product?.classesQuantity}</p>
        </div>
      </main>
      <footer className="product-footer">
        <p>&copy; 2024 MForMove. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default IndividualProduct;
