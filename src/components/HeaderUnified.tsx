"use client"
import { User } from '../../typings';
import state from '../valtio';
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next13-progressbar';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSnapshot } from 'valtio';
import { Menu } from '@headlessui/react';
import { CiMenuFries } from 'react-icons/ci';
import { useAppSelector } from '../redux/hooks';
import { useAuth } from '../hooks/useAuth';
import { routes } from '../constants/routes';

interface Props {
	user: User | null;
	toggleNav: any;
	where: any;
	showNav: any;
}

const HeaderUnified = ({ user, toggleNav, where, showNav }: Props) => {
	const router = useRouter();
	const path = usePathname();
	const headerAnimation = useAnimation();
	const [isScrolled, setIsScrolled] = useState(false);
	const [loadingLink, setLoadingLink] = useState<string | null>(null);
	const auth = useAuth();
	const linkRef = useRef<HTMLAnchorElement | null>(null);
	const linkMembRef = useRef<HTMLAnchorElement | null>(null);
	const [domLoaded, setDomLoaded] = useState(false);
	const snap = useSnapshot(state);
	const headerScroll = useAppSelector(
		(state: any) => state.headerHomeReducer.value.scrollHeader
	);

    const isMentorship = path === routes.navegation.mentorship;
    const isAccount = path === routes.user.perfil || path.startsWith('/account');
	const isMembershipHome = path === routes.navegation.membresiaHome;
	const isSelectPlan = path === routes.navegation.selectPlan;
	const isInfoLight = path === '/faq' || path === '/about' || path === '/privacy' || isSelectPlan;
	const isEvents = path === routes.navegation.eventos || path.includes(routes.navegation.eventos);
	const isAuth = path === routes.user.login || path === routes.user.forget || path === routes.user.forgetEmail || path === routes.user.register;
	const isIndex = path === routes.navegation.index;

	const transparentUntilScroll = !isInfoLight;
	const scrolled = isScrolled || headerScroll;

	useEffect(() => {
		const handleScroll = () => {
			let scroll = (window.scrollY);
			if (scroll > 0) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, [router]);

	useEffect(() => {
		setDomLoaded(true);
		where === 'home'
			? headerAnimation.start({
				y: 100,
				transition: {
					damping: 5,
					stiffness: 40,
					restDelta: 0.001,
					duration: 1
				}
			})
			: headerAnimation.start({
				y: 0,
				transition: {
					damping: 5,
					stiffness: 40,
					restDelta: 0.001,
					duration: 1
				}
			});
		[];
	});

	const handleLinkClick = async (route: string, linkName: string) => {
		setLoadingLink(linkName);
		setTimeout(() => {
			router.push(route);
			setTimeout(() => {
				setLoadingLink(null);
			}, 500);
		}, 300);
	};

    const headerBgClass = isAccount
        ? (scrolled ? 'bg-white/50 backdrop-blur-sm' : 'bg-transparent')
        : (transparentUntilScroll
            ? (scrolled ? (isMentorship ? 'bg-black/50' : 'bg-[#141414]/50') : 'bg-transparent')
            : 'bg-white/90 backdrop-blur-sm');

    const isLightText = isAccount ? false : (transparentUntilScroll ? true : false);
	const textColorMain = isLightText ? 'text-white' : 'text-gray-800';
	const textColorMuted = isLightText ? 'text-white/50 hover:text-white' : 'text-gray-600 hover:text-gray-800';
    const logoSrc = isAccount ? '/images/MFORMOVE_v2.negro03.png' : (isLightText ? '/images/MFORMOVE_blanco03.png' : '/images/MFORMOVE_v2.negro03.png');
	const underlineFill = isLightText ? 'white' : 'black';

	const linkBase = `block text-sm/6 cursor-pointer focus:outline-none transition-colors duration-200`;
	const linkMuted = `${textColorMuted}`;
	const linkActive = isLightText ? 'text-white' : 'text-[#234C8C]';

	return (
		<>
			{domLoaded && (
				<m.div
					initial={{ y: -100, opacity: 1 }}
					animate={headerAnimation}
					className={`fixed w-full h-16 flex justify-between items-center px-8 md:gap-x-16 transition-all duration-[400ms] z-[250] ${where === 'home' ? 'mt-28' : ''} ${headerBgClass}`}
				>
					<div className=''>
						<Link href={`${path === routes.navegation.selectPlan ? routes.navegation.membresiaHome : path === routes.navegation.membresiaHome ? '/' : '/'}`}>
							<img
								alt='icon image'
								src={logoSrc}
								width={180}
								height={180}
								className='cursor-pointer object-contain transition duration-500 hover:scale-105 opacity-100'
							/>
						</Link>
					</div>
					<div className="flex w-full justify-center">
						<div className={`gap-8 font-montserrat relative -left-8 ${showNav ? 'md:hidden' : 'md:flex'} hidden ${textColorMain}`}>
							<div className={`${linkBase} ${path == routes.navegation.mentorship ? linkActive : linkMuted}`}
								onClick={() => handleLinkClick('/mentorship', 'mentoria')}>
								{loadingLink === 'mentoria' ? 'Cargando...' : 'Mentoría'}
								{path == routes.navegation.mentorship && (
									<svg
										width="100%"
										height="3"
										viewBox="0 0 120 5"
										className="block mx-auto mt-0 relative bottom-1 left-1/2 -translate-x-1/2"
										style={{ minWidth: '100%', maxWidth: '100%' }}
									>
										<ellipse cx="50" cy="2" rx="65" ry="1" fill={isLightText ? 'white' : '#234C8C'} />
										</svg>
								)}
							</div>
							<div className={`${linkBase} ${(path == 'events' || path.includes(routes.navegation.eventos)) ? linkActive : linkMuted}`}
								onClick={() => handleLinkClick(routes.navegation.eventos, 'eventos')}>
								{loadingLink === 'eventos' ? 'Cargando...' : 'Eventos'}
								{(path == 'events' || path.includes(routes.navegation.eventos)) && (
									<svg
										width="100%"
										height="3"
										viewBox="0 0 120 5"
										className="block mx-auto mt-0 relative bottom-1 left-1/2 -translate-x-1/2"
										style={{ minWidth: '100%', maxWidth: '100%' }}
									>
										<ellipse cx="50" cy="2" rx="50" ry="1" fill={isLightText ? 'white' : '#234C8C'} />
									</svg>
								)}
							</div>
							<a href={`${routes.navegation.membresia(auth?.user?.subscription?.active || auth?.user?.isVip)}`} ref={linkMembRef} style={{ display: 'none' }}>
								Ir a Membresia
							</a>
							<a href="/account" ref={linkRef} style={{ display: 'none' }}>
								Ir a Cuenta
							</a>
							<div className={`${linkBase} ${(path == routes.user.login || path == routes.user.forget || path == routes.user.forgetEmail || path == routes.user.perfil || path == '/account') ? linkActive : linkMuted}`}
								onClick={() => { !auth.user ? handleLinkClick('/login', 'cuenta') : linkRef.current?.click(); }}>
								{loadingLink === 'cuenta' ? 'Cargando...' : 'Cuenta'}
								{(path == routes.user.login || path == routes.user.forget || path == routes.user.forgetEmail || path == routes.user.perfil || path == '/account') && (
									<svg
										width="100%"
										height="3"
										viewBox="0 0 100 5"
										className="block mx-auto mt-0 relative bottom-1 left-1/2 -translate-x-1/2"
										style={{ minWidth: '100%', maxWidth: '100%' }}
									>
										<ellipse cx="50" cy="2" rx="65" ry="1" fill={isLightText ? 'white' : '#234C8C'} />
										</svg>
								)}
							</div>
						</div>
					</div>
					<div className='flex items-center pr-4 md:pr-16'>
						<Menu as='div' className='relative inline-block text-left'>
							<div>
								<Menu.Button className={'inline-flex w-full justify-center items-center'}>
									<CiMenuFries className={`h-6 w-6 ${isLightText ? 'text-white' : 'text-black'}`} onClick={toggleNav}/>
								</Menu.Button>
							</div>
						</Menu>
					</div>
				</m.div>
			)}
		</>
	);
};

export default HeaderUnified;

