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
import { AiOutlineHome } from 'react-icons/ai';
import { LuSettings } from 'react-icons/lu';
import { useAppSelector } from '../redux/hooks';
import { useAuth } from '../hooks/useAuth';
import { routes } from '../constants/routes';
import { GoTools } from 'react-icons/go';
import { PiHouseLineThin } from 'react-icons/pi';
import { SiEditorconfig } from 'react-icons/si';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
	user: User | null;
	toggleNav: any;
	where: any;
	showNav: any;
	forceStandardHeader?: boolean; // evita el layout especial (ej. bitácora)
	onMenuClick?: () => void; // para sobreescribir el toggle en ciertos contextos (bitácora)
	sidebarOpen?: boolean; // estado externo de sidebar (bitácora)
	forceLightTheme?: boolean; // forzar logo/texto claros (ej. audio bitácora)
}

const HeaderUnified = ({ user, toggleNav, where, showNav, forceStandardHeader = false, onMenuClick, sidebarOpen, forceLightTheme = false }: Props) => {
	const router = useRouter();
	const path = usePathname();
	const headerAnimation = useAnimation();
	const [isScrolled, setIsScrolled] = useState(false);
	const [loadingLink, setLoadingLink] = useState<string | null>(null);
	const auth = useAuth();
	const linkRef = useRef<HTMLAnchorElement | null>(null);
	const linkMembRef = useRef<HTMLAnchorElement | null>(null);
	const [domLoaded, setDomLoaded] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [showMenuTooltip, setShowMenuTooltip] = useState(false);
	const snap = useSnapshot(state);
	const headerScroll = useAppSelector(
		(state: any) => state.headerHomeReducer.value.scrollHeader
	);

    const isMentorship = path === routes.navegation.mentorship;
    const isMoveCrew = path === '/move-crew';
    const isPaymentSuccess = path === '/payment/success';
    const isAccount = path === routes.user.perfil || path.startsWith('/account')
	
	const isBitacora = (path === '/bitacora' || path.startsWith('/bitacora'));
	const isMembershipHome = path === routes.navegation.membership.home;
	const isInfoLight = path === '/faq' || path === '/about' || path === '/privacy';
	const isEvents = path === routes.navegation.eventos || path.includes(routes.navegation.eventos);
	const isAuth = path === routes.user.login || path === routes.user.forget || path === routes.user.forgetEmail || path === routes.user.register;
	const isIndex = path === routes.navegation.index;
  const isClasses = path.startsWith('/classes');
    const isEmailVerify = path.startsWith('/email');
    const isHome = path === '/home';
	const menuTooltipText = 'Sube de nivel completando semanas del Camino del Gorila. Gana U.C. y canjealas por programas, elementos, material o ropa; lo iremos mejorando y mejorando.';

	// Evita que el header del login y home cambien al hacer scroll
	const transparentUntilScroll = !isInfoLight && !isBitacora && !isAuth && !isIndex;
	// Para la página de success, solo usar isScrolled local, no headerScroll del Redux
	const scrolled = isPaymentSuccess ? isScrolled : (isScrolled || headerScroll);

	useEffect(() => {
		// Inicializar el estado de scroll al montar
		setIsScrolled(window.scrollY > 0);
		setIsMobile(window.innerWidth < 1024);

		const handleResize = () => setIsMobile(window.innerWidth < 1024);

		const handleWindowScroll = () => {
			let scroll = (window.scrollY);
			if (scroll > 0) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		// Para Move Crew, también escuchar el evento personalizado del contenedor
		const handleMoveCrewScroll = (event: Event) => {
			const detail = (event as CustomEvent).detail;
			const scrollTop = detail?.scrollTop ?? 0;
			setIsScrolled(scrollTop > 0);
		};

		window.addEventListener('scroll', handleWindowScroll);
		window.addEventListener('movecrew-scroll', handleMoveCrewScroll);
		window.addEventListener('resize', handleResize);
		
		return () => {
			window.removeEventListener('scroll', handleWindowScroll);
			window.removeEventListener('movecrew-scroll', handleMoveCrewScroll);
			window.removeEventListener('resize', handleResize);
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

    let headerBgClass = (isAuth || isIndex)
        ? 'bg-transparent'
        : (isEmailVerify || isPaymentSuccess || isHome || isClasses
            ? 'bg-transparent'
            : ((isAccount || isBitacora
                ? (scrolled ? 'bg-white/50 backdrop-blur-sm' : 'bg-transparent')
                : (transparentUntilScroll
                    ? (scrolled ? (isMentorship ? 'bg-black/50 backdrop-blur-sm' : (isMoveCrew ? 'bg-black/50 backdrop-blur-sm' : 'bg-[#141414]/50 backdrop-blur-sm')) : 'bg-transparent')
                        : 'bg-white/90 backdrop-blur-sm'))));

    // En Move Crew, siempre mantener texto blanco; si el sidebar está abierto, forzar blanco
    const forceLightByNav = !!showNav;
    const forceLight = forceLightTheme || forceLightByNav;
    const isLightTextBase = (isAuth || isIndex)
        ? true
        : (isEmailVerify || isPaymentSuccess || isHome
            ? true
            : ((isAccount || isBitacora
                ? false
                : (isMoveCrew
                    ? true
                    : (isMentorship
                        ? true
                        : (transparentUntilScroll && !scrolled
                            ? true
                            : (!transparentUntilScroll && !isMoveCrew && path === '/home'
                                ? true
                                : false)))))));
    const isLightText = forceLight ? true : isLightTextBase;

    // Si el texto es claro y hay scroll, aplicar fondo difuminado para contraste
    if (scrolled && isLightText) {
        headerBgClass = 'bg-black/40 backdrop-blur-md';
    }
	const textColorMain = (isLightText ? 'text-white' : (isAuth || isIndex ? 'text-gray-200' : 'text-gray-800'));
	const textColorMuted = (isLightText ? 'text-white/60 hover:text-white' : (isAuth || isIndex ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'));
    const logoSrc = forceLightByNav
        ? '/images/MFORMOVE_blanco03.png'
        : ((isAccount || isBitacora
                ? (forceLight ? '/images/MFORMOVE_blanco03.png' : '/images/MFORMOVE_v2.negro03.png')
                : ((isAuth || isIndex) ? '/images/MFORMOVE_blanco03.png' : (isLightText ? '/images/MFORMOVE_blanco03.png' : '/images/MFORMOVE_v2.negro03.png'))));
	const underlineFill = isBitacora ? 'white' : (isLightText ? 'white' : 'black');
	
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
					className={`fixed w-full h-16 transition-all duration-300 ease-in-out z-[250] ${where === 'home' ? 'mt-28' : ''} ${headerBgClass}`}
				>
					{isBitacora ? (
						// Distribución especial para bitácora: width full, logo y botones en esquinas, texto centrado alineado con video
						<div className="flex items-center h-full w-full relative">
							{/* Logo a la izquierda - esquina */}
							<div className='absolute left-8 z-10'>
								<Link href={auth?.user?.subscription?.active || auth?.user?.isVip ? '/home' : '/'}>
									<div className="relative md:w-[180px] md:h-[180px] w-[150px] h-[80px]">
										<img
											alt='icon image'
											src={logoSrc}
											width={150}
											height={150}
											className={`cursor-pointer object-contain ${logoTransition} hover:scale-105 w-full h-full`}
													style={{ opacity: sidebarOpen && isMobile ? 0 : 0.8, transition: 'opacity 200ms ease' }}
										/>
									</div>
								</Link>
							</div>
							
							{/* Links de navegación centrados - alineados con el video (max-w-7xl con offset del sidebar) */}
							<div className="flex-1 hidden lg:flex justify-center lg:pl-[380px]">
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
													className="block mx-auto mt-0 relative bottom-1  left-1/2 -translate-x-1/2"
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
										<a href={`${routes.navegation.membership.entry(auth?.user?.subscription?.active || auth?.user?.isVip)}`} ref={linkMembRef} style={{ display: 'none' }}>
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
											onClick={() => {
												if (onMenuClick && isMobile) {
													if (isMobile) {
														onMenuClick();
													}
												} else {
													toggleNav();
												}
											}}
										>
											{sidebarOpen && isMobile ? (
												<XMarkIcon className={`h-6 w-6 ${isLightText ? 'text-white' : 'text-black'}`} />
											) : (
												<CiMenuFries className={`h-6 w-6 ${isLightText ? 'text-white' : 'text-black'}`} />
											)}
										</Menu.Button>
									</div>
								</Menu>
							</div>
						</div>
					) : (
						// Distribución normal para otras páginas
						<div className="flex justify-between items-center px-8 md:gap-x-16 h-full">
					<div className='flex items-center gap-4'>
										<Link href={auth?.user?.subscription?.active || auth?.user?.isVip ? '/home' : '/'}>
											<div className="relative md:w-[180px] md:h-[180px] w-[150px] h-[80px]">
												<img
													alt='icon image'
													src={logoSrc}
													width={180}
													height={180}
													className={`cursor-pointer object-contain ${logoTransition} hover:scale-105 w-full h-full`}
											style={{ opacity: sidebarOpen && !isMobile ? 0 : 1, transition: 'opacity 200ms ease' }}
												/>
											</div>
										</Link>
					</div>
					<div className="flex w-full justify-center">
						<div
							className={`gap-8 font-montserrat relative -left-8 ${showNav ? 'md:hidden' : 'md:flex'} hidden ${textColorMain}`}
							onMouseEnter={() => !isMobile && isBitacora && setShowMenuTooltip(true)}
							onMouseLeave={() => setShowMenuTooltip(false)}
						>
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
							<a href={`${routes.navegation.membership.entry(auth?.user?.subscription?.active || auth?.user?.isVip)}`} ref={linkMembRef} style={{ display: 'none' }}>
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
							{showMenuTooltip && !isMobile && (
								<div className="absolute left-1/2 top-full z-20 mt-3 w-72 -translate-x-1/2 rounded-xl bg-black px-4 py-3 text-xs text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] border border-white/10 text-center">
									{menuTooltipText}
								</div>
							)}
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
										<SiEditorconfig className='h-6 w-6' />
									</button>
								)}
			
							<Menu.Button
									as='button'
									type='button'
									className='inline-flex w-full justify-center items-center'
									onClick={() => router.push('/home')}
								>
									<PiHouseLineThin className={`h-6 w-6 ${isLightText ? 'text-white' : 'text-black'}`} />
								</Menu.Button>
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

