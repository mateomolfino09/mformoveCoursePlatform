import { useEffect, useState } from 'react';
import { motion as m } from 'framer-motion';
import { Menu } from '@headlessui/react';
import { CiMenuFries } from "react-icons/ci";

interface Props {
  user: any;
  toggleNav: any;
  where: any;
}

const IndexHeader = ({ user, toggleNav, where }: Props) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <m.div
      initial={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 w-full h-16 flex justify-between items-center transition-all duration-300 z-[250] ${
        isScrolled ? 'bg-black' : 'bg-transparent'
      }`}
    >
      <div className='pl-4 md:pl-16'>
        <img
          alt='icon image'
          src='/images/MFORMOVE_blanco03.png'
          width={180}
          height={180}
          className='cursor-pointer object-contain transition duration-500 hover:scale-105 opacity-100'
        />
      </div>
      <div className='flex items-center pr-4 md:pr-16'>
        <Menu as='div' className='relative inline-block text-left'>
          <div>
            <Menu.Button className='inline-flex w-full justify-center items-center'>
              <CiMenuFries className='h-6 w-6' onClick={toggleNav} />
            </Menu.Button>
          </div>
        </Menu>
      </div>
    </m.div>
  );
};

export default IndexHeader;
