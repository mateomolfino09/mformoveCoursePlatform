import CryptoJS from 'crypto-js';


const generateMd5 = (email) => {
    // Convertir el email a minúsculas
    const lowerCaseEmail = email.toLowerCase();
    
    // Generar el hash MD5
    const md5Hash = CryptoJS.MD5(lowerCaseEmail).toString();
    
    return md5Hash;
  };

export { generateMd5 }