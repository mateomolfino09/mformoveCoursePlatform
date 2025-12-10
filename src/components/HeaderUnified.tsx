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
import { LuSettings } from 'react-icons/lu';
import { useAppSelector } from '../redux/hooks';
import { useAuth } from '../hooks/useAuth';
import { routes } from '../constants/routes';
import { GoTools } from 'react-icons/go';

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
    const isMoveCrew = path === '/move-crew';
    const isPaymentSuccess = path === '/payment/success';
    const isAccount = path === routes.user.perfil || path.startsWith('/account');
	const isBitacora = path === '/bitacora' || path.startsWith('/bitacora');
	const isMembershipHome = path === routes.navegation.membresiaHome;
	const isInfoLight = path === '/faq' || path === '/about' || path === '/privacy';
	const isEvents = path === routes.navegation.eventos || path.includes(routes.navegation.eventos);
	const isAuth = path === routes.user.login || path === routes.user.forget || path === routes.user.forgetEmail || path === routes.user.register;
	const isIndex = path === routes.navegation.index;

	const transparentUntilScroll = !isInfoLight && !isBitacora;
	// Para la página de success, solo usar isScrolled local, no headerScroll del Redux
	const scrolled = isPaymentSuccess ? isScrolled : (isScrolled || headerScroll);

	useEffect(() => {
		// Inicializar el estado de scroll al montar
		setIsScrolled(window.scrollY > 0);

		const handleWindowScroll = () => {
			let scroll = (window.scrollY);
			if (scroll > 0) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		// Para Move Crew, también escuchar el evento personalizado del contenedor
		const handleMoveCrewScroll = (event: CustomEvent) => {
			const { scrollTop } = event.detail;
			if (scrollTop > 0) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		window.addEventListener('scroll', handleWindowScroll);
		window.addEventListener('movecrew-scroll', handleMoveCrewScroll as EventListener);
		
		return () => {
			window.removeEventListener('scroll', handleWindowScroll);
			window.removeEventListener('movecrew-scroll', handleMoveCrewScroll as EventListener);
		};
	}, [router, path]); // Agregar path como dependencia para resetear cuando cambia la ruta

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

    const headerBgClass = isBitacora
        ? (scrolled ? 'bg-white backdrop-blur-sm' : 'bg-transparent')
        : (isAccount
        ? (scrolled ? 'bg-white/50 backdrop-blur-sm' : 'bg-transparent')
        : (transparentUntilScroll
            ? (scrolled ? (isMentorship ? 'bg-black/50 backdrop-blur-sm' : (isMoveCrew ? 'bg-black/50 backdrop-blur-sm' : 'bg-[#141414]/50 backdrop-blur-sm')) : 'bg-transparent')
                : 'bg-white/90 backdrop-blur-sm'));

    // En Move Crew, siempre mantener texto blanco
    const isLightText = isBitacora ? false : (isAccount ? false : (isMoveCrew ? true : (transparentUntilScroll && !scrolled ? true : false)));
	const textColorMain = isLightText ? 'text-white' : 'text-gray-800';
	const textColorMuted = isLightText ? 'text-white/50 hover:text-white' : 'text-gray-600 hover:text-gray-800';
    const logoSrc = (isAccount || isBitacora) ? '/images/MFORMOVE_v2.negro03.png' : (isLightText ? '/images/MFORMOVE_blanco03.png' : '/images/MFORMOVE_v2.negro03.png');
	const underlineFill = isLightText ? 'white' : 'black';
	
	// Asegurar transición suave del logo sin superposición
	const logoTransition = 'transition-all duration-300 ease-in-out';

	const linkBase = `block text-sm/6 cursor-pointer focus:outline-none transition-colors duration-200`;
	const linkMuted = `${textColorMuted}`;
	const linkActive = isLightText ? 'text-white' : 'text-[#234C8C]';

	return (
		<>
			{domLoaded && (
				<m.div
					initial={{ y: -100, opacity: 1 }}
					animate={headerAnimation}
					className={`fixed w-full h-16 transition-all duration-300 ease-in-out z-[250] ${where === 'home' ? 'mt-28' : ''} ${headerBgClass} ${isBitacora ? 'hidden lg:flex' : ''}`}
				>
					{isBitacora ? (
						// Distribución especial para bitácora: width full, logo y botones en esquinas, texto centrado alineado con video
						<div className="flex items-center h-full w-full relative">
							{/* Logo a la izquierda - esquina */}
							<div className='absolute left-8 z-10'>
								<Link href={auth?.user?.subscription?.active || auth?.user?.isVip ? '/home' : '/'}>
									<div className="relative w-[180px] h-[180px]">
										<img
											alt='icon image'
											src={logoSrc}
											width={180}
											height={180}
											className={`cursor-pointer object-contain ${logoTransition} hover:scale-105 w-full h-full`}
											style={{ opacity: 1 }}
										/>
									</div>
								</Link>
							</div>
							
							{/* Links de navegación centrados - alineados con el video (max-w-7xl con offset del sidebar) */}
							<div className="flex-1 flex justify-center lg:pl-[380px]">
								<div className="max-w-7xl w-full flex justify-center px-4 sm:px-6 lg:px-8">
									<div className={`gap-8 font-montserrat flex ${textColorMain}`}>
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
										<div className={`${linkBase} ${isMoveCrew ? linkActive : linkMuted}`}
											onClick={() => handleLinkClick('/move-crew', 'movecrew')}>
											{loadingLink === 'movecrew' ? 'Cargando...' : 'Move Crew'}
											{isMoveCrew && (
												<svg
													width="100%"
													height="3"
													viewBox="0 0 120 5"
													className="block mx-auto mt-0 relative bottom-1 left-1/2 -translate-x-1/2"
													style={{ minWidth: '100%', maxWidth: '100%' }}
												>
													<ellipse cx="50" cy="2" rx="76" ry="1" fill={isLightText ? 'white' : '#234C8C'} />
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
							</div>
							
							{/* Iconos de menú y admin a la derecha - esquina */}
							<div className='absolute right-8 z-10'>
								<Menu as='div' className='relative inline-block text-left'>
									<div className='flex items-center gap-3'>
										{auth.user?.rol === 'Admin' && (
											<button
												type='button'
												onClick={() => router.push('/admin')}
												className={`rounded-full p-1 transition-colors ${isLightText ? 'text-white hover:text-white/80' : 'text-black hover:text-gray-700'}`}
												aria-label='Ir al panel de administración'
											>
												<GoTools className='h-6 w-6' />
											</button>
										)}
										<Menu.Button
											as='button'
											type='button'
											className='inline-flex w-full justify-center items-center'
											onClick={toggleNav}
										>
											<CiMenuFries className={`h-6 w-6 ${isLightText ? 'text-white' : 'text-black'}`} />
										</Menu.Button>
									</div>
								</Menu>
							</div>
						</div>
					) : (
						// Distribución normal para otras páginas
						<div className="flex justify-between items-center px-8 md:gap-x-16 h-full">
					<div className=''>
						<Link href={auth?.user?.subscription?.active || auth?.user?.isVip ? '/home' : '/'}>
							<div className="relative w-[180px] h-[180px]">
								<img
									alt='icon image'
									src={logoSrc}
									width={180}
									height={180}
									className={`cursor-pointer object-contain ${logoTransition} hover:scale-105 w-full h-full`}
									style={{ opacity: 1 }}
								/>
							</div>
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
                            <div className={`${linkBase} ${isMoveCrew ? linkActive : linkMuted}`}
								onClick={() => handleLinkClick('/move-crew', 'movecrew')}>
								{loadingLink === 'movecrew' ? 'Cargando...' : 'Move Crew'}
								{isMoveCrew && (
									<svg
										width="100%"
										height="3"
										viewBox="0 0 120 5"
										className="block mx-auto mt-0 relative bottom-1 left-1/2 -translate-x-1/2"
										style={{ minWidth: '100%', maxWidth: '100%' }}
									>
										<ellipse cx="50" cy="2" rx="76" ry="1" fill={isLightText ? 'white' : '#234C8C'} />
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
							<div className='flex items-center gap-3'>
								{auth.user?.rol === 'Admin' && (
									<button
										type='button'
										onClick={() => router.push('/admin')}
										className={`rounded-full p-1 transition-colors ${isLightText ? 'text-white hover:text-white/80' : 'text-black hover:text-gray-700'}`}
										aria-label='Ir al panel de administración'
									>
										<GoTools className='h-6 w-6' />
									</button>
								)}
								<Menu.Button
									as='button'
									type='button'
									className='inline-flex w-full justify-center items-center'
									onClick={toggleNav}
								>
									<CiMenuFries className={`h-6 w-6 ${isLightText ? 'text-white' : 'text-black'}`} />
								</Menu.Button>
							</div>
						</Menu>
					</div>
						</div>
					)}
				</m.div>
			)}
		</>
	);
};

export default HeaderUnified;

