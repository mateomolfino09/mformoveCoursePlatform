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
import { CiCircleChevLeft, CiCircleChevRight, CiMenuKebab } from 'react-icons/ci';
import { AiOutlineBook } from 'react-icons/ai';
import { LuSettings } from 'react-icons/lu';
import { useAppSelector } from '../redux/hooks';
import { useAuth } from '../hooks/useAuth';
import { routes } from '../constants/routes';
import { GoTools } from 'react-icons/go';
import { PiHouseLineThin } from 'react-icons/pi';
import { SiEditorconfig } from 'react-icons/si';
import { ArrowLeftEndOnRectangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { BiLeftArrow } from 'react-icons/bi';
import { BsMenuButton } from 'react-icons/bs';
import { CrossIcon } from 'react-select/dist/declarations/src/components/indicators';
import { IoCloseOutline } from 'react-icons/io5';

interface Props {
	user: User | null;
	toggleNav: any;
	where: any;
	showNav: any;
	forceStandardHeader?: boolean; // evita el layout especial (ej. camino)
	onMenuClick?: () => void; // para sobreescribir el toggle en ciertos contextos (camino)
	sidebarOpen?: boolean; // estado externo de sidebar (camino)
	forceLightTheme?: boolean; // forzar logo/texto claros (ej. audio camino)
}

const HeaderUnified = ({ user, toggleNav, where, showNav, forceStandardHeader = false, onMenuClick, sidebarOpen, forceLightTheme = false }: Props) => {
	const router = useRouter();
	const path = usePathname();
	const headerAnimation = useAnimation();
	const [isScrolled, setIsScrolled] = useState(false);
	const [indexScrollY, setIndexScrollY] = useState(0); // Para cambio a blanco en index (desde 1px de scroll)
	const [loadingLink, setLoadingLink] = useState<string | null>(null);
	const auth = useAuth();
	const linkRef = useRef<HTMLAnchorElement | null>(null);
	const linkMembRef = useRef<HTMLAnchorElement | null>(null);
	const [domLoaded, setDomLoaded] = useState(true);
	const [isMobile, setIsMobile] = useState(false);
	const [showMenuTooltip, setShowMenuTooltip] = useState(false);
	const snap = useSnapshot(state);
	const headerScroll = useAppSelector(
		(state: any) => state.headerLibraryReducer.value.scrollHeader
	);

    const isMentorship = path === routes.navegation.mentorship;
    const isMoveCrew = path === routes.navegation.membership.moveCrew;
    const isPaymentSuccess = path === routes.navegation.paymentSuccess;
    const isAccount = path === routes.user.perfil || path.startsWith(routes.navegation.account);

	const isWeeklyPath = (path === routes.navegation.membership.weeklyPath || path.startsWith(routes.navegation.membership.weeklyPath));
	const isBienvenida = path === routes.navegation.onboarding.bienvenida || path.startsWith(routes.navegation.onboarding.bienvenida);
	const isMembershipHome = path === routes.navegation.membership.library;
	const isInfoLight = path === routes.navegation.preguntasFrecuentes || path === routes.navegation.about || path === routes.navegation.privacy;
	const isEvents = path === routes.navegation.eventos || path.includes(routes.navegation.eventos);
	const isAuth = path === routes.user.login || path === routes.user.forget || path === routes.user.forgetEmail || path === routes.user.register;
	const isIndex = path === routes.navegation.index;
	const isClasses = path.startsWith(routes.navegation.classes);
	const isEmailVerify = path.startsWith(routes.navegation.email);
	const isLibrary = path === routes.navegation.membership.library;
	const isLibraryArea = path.startsWith(routes.navegation.membership.library);
	// Solo en página de módulo (/library/module/xxx): texto blanco arriba, al scroll fondo blanco y texto negro
	const isLibraryModulePage = path.startsWith(routes.navegation.membership.library + '/module');
	// Página de práctica (video): header opaco para que se vean logo y botones
	const isLibraryPracticePage = path.includes('/practice/');
	const menuTooltipText = 'Sube de nivel completando semanas del Camino. Gana U.C. y canjealas por programas, elementos, material o ropa; lo iremos mejorando y mejorando.';

	// Evita que el header del login y home cambien al hacer scroll
	const transparentUntilScroll = !isInfoLight && !isWeeklyPath && !isAuth && !isIndex;
	// Para la página de success, solo usar isScrolled local, no headerScroll del Redux
	const scrolled = isPaymentSuccess ? isScrolled : (isScrolled || headerScroll);

	// Usar useRef para evitar que el efecto se ejecute constantemente
	const isMoveCrewRef = useRef(isMoveCrew);
	const pathRef = useRef(path);
	
	// Actualizar refs cuando cambian
	useEffect(() => {
		isMoveCrewRef.current = isMoveCrew;
		pathRef.current = path;
	}, [isMoveCrew, path]);

	useEffect(() => {
		// Inicializar el estado de scroll al montar
		// Para Move Crew, esperar a que se emita el evento del contenedor
		if (!isMoveCrew) {
			const scroll = window.scrollY;
			setIsScrolled(scroll > 0);
			if (path === routes.navegation.index) {
				setIndexScrollY(scroll);
			}
		} else {
			// Para Move Crew, inicializar en false y esperar el evento del contenedor
			setIsScrolled(false);
		}
		setIsMobile(window.innerWidth < 1024);

		const handleResize = () => setIsMobile(window.innerWidth < 1024);

		// Throttle para el scroll de window
		let scrollTimeout: NodeJS.Timeout | null = null;
		const handleWindowScroll = () => {
			// Solo manejar scroll de window si no estamos en Move Crew
			if (!isMoveCrewRef.current) {
				const scroll = window.scrollY;
				setIsScrolled(scroll > 0);
				if (pathRef.current === routes.navegation.index) {
					setIndexScrollY(scroll);
				}
				if (scrollTimeout) return;
				scrollTimeout = setTimeout(() => {
					scrollTimeout = null;
				}, 10);
			}
		};

		// Throttle para el evento de Move Crew, pero sin delay cuando scrollTop es 0
		let moveCrewScrollTimeout: NodeJS.Timeout | null = null;
		const handleMoveCrewScroll = (event: Event) => {
			const detail = (event as CustomEvent).detail;
			const scrollTop = detail?.scrollTop ?? 0;
			const isAtTop = scrollTop === 0;
			
			// Si está en el top, actualizar inmediatamente sin throttle
			if (isAtTop) {
				if (moveCrewScrollTimeout) {
					clearTimeout(moveCrewScrollTimeout);
					moveCrewScrollTimeout = null;
				}
				setIsScrolled(false);
				return;
			}
			
			// Para otros valores, usar throttle
			if (moveCrewScrollTimeout) return;
			moveCrewScrollTimeout = setTimeout(() => {
				setIsScrolled(scrollTop > 0);
				moveCrewScrollTimeout = null;
			}, 10);
		};

		window.addEventListener('scroll', handleWindowScroll, { passive: true });
		window.addEventListener('movecrew-scroll', handleMoveCrewScroll);
		window.addEventListener('resize', handleResize);
		
		return () => {
			if (scrollTimeout) clearTimeout(scrollTimeout);
			if (moveCrewScrollTimeout) clearTimeout(moveCrewScrollTimeout);
			window.removeEventListener('scroll', handleWindowScroll);
			window.removeEventListener('movecrew-scroll', handleMoveCrewScroll);
			window.removeEventListener('resize', handleResize);
		};
	}, []); // Solo ejecutar una vez al montar

	useEffect(() => {
		setDomLoaded(true);
		where === 'library'
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

    const isIndexStage1 = isIndex && indexScrollY > 0 && !showNav; // Header blanco con scroll; al abrir hamburger vuelve al color original
    // En Move Crew: al abrir el menú (showNav), header transparente en web y celular; solo logo y botones
    const isMoveCrewNavOpen = isMoveCrew && showNav;
    let headerBgClass = (isAuth)
        ? 'bg-transparent'
        : (isBienvenida
            ? (scrolled ? 'bg-white/90 backdrop-blur-sm' : 'bg-transparent')
            : (isMoveCrew
                ? (isMoveCrewNavOpen ? 'bg-transparent' : (scrolled ? 'bg-white/90 backdrop-blur-sm' : 'bg-transparent'))
                : (isIndex
                    ? (isIndexStage1 ? 'bg-[#FAF8F5]' : (scrolled ? 'bg-[#141414]' : 'bg-transparent'))
                    : (isLibraryArea
                        ? 'bg-transparent'
                        : (isEmailVerify || isPaymentSuccess || isClasses
                            ? 'bg-transparent'
                            : (isAccount || isWeeklyPath
                                ? (scrolled ? 'bg-white/50 backdrop-blur-sm' : 'bg-transparent')
                                : (transparentUntilScroll
                                    ? (scrolled ? (isMentorship ? 'bg-black/50 backdrop-blur-sm' : 'bg-[#141414]/50 backdrop-blur-sm') : 'bg-transparent')
                                    : 'bg-white/90 backdrop-blur-sm')))))));

    // Cuando el menú principal o el menú Move Crew están abiertos, todos los botones del header en blanco/claro
    const isAnyMenuOpen = showNav || snap.weeklyPathNavOpen;
    const forceLightByNav = !!isAnyMenuOpen;
    const forceLight = forceLightTheme || forceLightByNav;
    const isLightTextBase = (isIndexStage1)
        ? false
        : (isBienvenida
            ? false
            : ((isAuth || isIndex)
                ? true
                : (isLibraryArea
                    ? false
                    : (isEmailVerify || isPaymentSuccess
                        ? true
                        : ((isAccount || isWeeklyPath
                            ? false
                            : (isMoveCrew
                                ? true
                                : (isMentorship
                                    ? true
                                    : (transparentUntilScroll && !scrolled
                                        ? true
                                        : false)))))))));
    // En página de módulo: sin scroll texto blanco; con scroll texto negro. Resto de library: texto negro siempre
    const isLightText = isLibraryModulePage ? !scrolled : (isLibraryArea ? false : (forceLight ? true : isLightTextBase));

    // Si el texto es claro y hay scroll, aplicar fondo difuminado para contraste (no en etapa 1 index). Move Crew no cambia.
    if (!isMoveCrew && !isLibraryArea && scrolled && isLightText && !isIndexStage1) {
        headerBgClass = 'bg-black/40 backdrop-blur-md';
    }
    // Solo en página de módulo (/library/module/xxx), cuando hay scroll: fondo blanco y texto negro
    if (isLibraryModulePage && scrolled) {
        headerBgClass = 'bg-white backdrop-blur-sm';
    }
    // Resto de library (/library, /library/individual-classes...) al hacer scroll: fondo crema
    if (isLibraryArea && !isLibraryModulePage && scrolled) {
        headerBgClass = 'bg-palette-cream/70 backdrop-blur-sm';
    }
    // Con el menú normal o Move Crew abierto, el header siempre transparente (blanco/negro queda transparente)
    if (showNav || snap.weeklyPathNavOpen) {
        headerBgClass = 'bg-transparent';
    }
	const textColorMain = isIndexStage1 ? 'text-black' : (isLightText ? 'text-white' : (isAuth || isIndex ? 'text-gray-200' : 'text-gray-800'));
	const textColorMuted = isIndexStage1 ? 'text-gray-600 hover:text-black' : (isLightText ? 'text-white/60 hover:text-white' : (isAuth || isIndex ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'));
	const underlineFill = isWeeklyPath ? 'white' : (isLightText ? 'white' : 'black');

	// Color del título MMOVE ACADEMY: solo en página de módulo blanco sin scroll, negro con scroll; resto de library negro
	const headerTitleLight = isLibraryModulePage
		? !scrolled
		: (isLibraryArea
			? false
			: (forceLightByNav
				? true
				: (isMoveCrew
					? false
					: (isIndexStage1
						? false
						: ((isAccount || isWeeklyPath)
							? forceLight
							: ((isAuth || isIndex) ? true : isLightText))))));

	// En página de práctica (video) los botones del header con fondo opaco para que se vean
	const headerButtonsOpaque = isLibraryPracticePage;

	// Logo MMOVE ACADEMY en blanco cuando el menú o el navegador Move Crew están abiertos
	const logoLight = headerTitleLight || showNav || snap.weeklyPathNavOpen;

	const linkBase = `block text-base/6 cursor-pointer focus:outline-none transition-colors duration-200`;
	const linkMuted = `${textColorMuted}`;
	const linkActive = isLightText ? 'text-white' : 'text-[#234C8C]';

	return (
		<>
			{domLoaded && (
				<m.div
					initial={{ y: 0, opacity: 1 }}
					animate={{ y: 0, opacity: 1 }}
					className={`fixed w-full h-16 min-h-14 px-4 py-3 md:py-12 md:px-8 transition-all duration-500 ease-in-out z-[250] ${headerBgClass}`} 
				>
					{isWeeklyPath ? (
						// Distribución especial para camino: width full, logo y botones en esquinas
						<div className="flex items-center h-full w-full relative">
							{/* Título a la izquierda con enlaces al lado */}
							<div className='absolute left-4 md:left-6 z-10 flex items-center gap-4'>
								<Link href={(auth?.user?.subscription?.active || auth?.user?.isVip) ? (isLibrary ? routes.navegation.index : routes.navegation.membership.library) : routes.navegation.index} className={`font-montserrat font-semibold uppercase tracking-[0.2em] text-lg md:text-xl cursor-pointer hover:opacity-80 transition-opacity ${sidebarOpen && isMobile ? 'opacity-0' : 'opacity-100'} ${logoLight ? 'text-white' : 'text-palette-ink'}`} style={{ transition: 'opacity 200ms ease' }}>
									MMOVE ACADEMY
								</Link>
								{(auth?.user?.subscription?.active || auth?.user?.isVip) && !isMoveCrew && (
									<>
										<span className={`hidden md:block ${isLightText ? 'text-white/60' : 'text-palette-stone/60'}`}>|</span>
										<div className="hidden md:flex items-center gap-6">
											<Link
												href={routes.navegation.membership.library}
												className={`font-montserrat font-light text-sm tracking-[0.1em] uppercase transition-all duration-200 ${
													isLightText 
															? 'text-white/80 hover:text-white/100' 
															: 'text-palette-stone hover:text-palette-ink'
												}`}
											>
												Biblioteca
											</Link>
											<Link
												href={routes.navegation.membership.weeklyPath}
												className={`font-montserrat font-light text-sm tracking-[0.1em] uppercase transition-all duration-200 ${isLightText 
															? 'text-white/80 hover:text-white/100' 
															: 'text-palette-stone hover:text-palette-ink'
												}`}
											>
												Camino
											</Link>
										</div>
									</>
								)}
							</div>
							
							{/* Iconos de menú y admin a la derecha */}
							<div className='absolute right-12 md:right-16 z-10 hidden md:flex items-center gap-3'>
								{/* En Move Crew: sin acceso → Empezar Camino; con acceso → botón Move Crew (al lado de Menú) */}
								{isMoveCrew && !(auth?.user && (auth.user.subscription?.active || auth.user.isVip || auth.user.rol === 'Admin')) && (
									<Link
										href={`${routes.navegation.membership.moveCrew}#move-crew-plans`}
										className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-5 py-2 shrink-0 transition-all duration-200 ${isAnyMenuOpen ? 'text-white border border-white/80 hover:bg-white hover:text-palette-ink hover:border-white' : 'bg-black text-white border border-black hover:bg-palette-sage hover:border-palette-sage'}`}
									>
										Empezar Camino
									</Link>
								)}
								<Menu as='div' className='relative inline-block text-left'>
									<div className='flex items-center gap-3'>
										{/* Move Crew: suscripción activa, isVip o Admin; mismo estilo que Empezar Camino (fondo negro, hover verde) */}
										{auth?.user && (auth.user.subscription?.active || auth.user.isVip || auth.user.rol === 'Admin') && (
											<button
												type='button'
												data-tutorial-move-crew-target
												onClick={(e) => { 
													const tutorialActive = document.body.classList.contains('tutorial-active');
													if (tutorialActive) return;
													state.weeklyPathNavOpen = !snap.weeklyPathNavOpen; 
												}}
												className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-4 md:px-5 py-2 transition-all duration-200 shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer ${snap.weeklyPathNavOpen ? 'text-white border border-white/80 hover:bg-white hover:text-palette-ink hover:border-white' : 'bg-black text-white border border-black hover:bg-palette-sage hover:border-palette-sage'}`}
												aria-label="Abrir navegador Move Crew"
											>
												{snap.weeklyPathNavOpen ? (
													<>
														<IoCloseOutline className="h-5 w-5" aria-hidden />
														<span>Cerrar</span>
													</>
												) : (
													<span>Move Crew</span>
												)}
											</button>
										)}
										{auth.user?.rol === 'Admin' && (
											<button
												type='button'
												onClick={() => router.push('/admin')}
												className={`rounded-full p-1 transition-colors cursor-pointer hidden md:block ${(isMoveCrew && isAnyMenuOpen) ? 'text-white hover:text-white/80' : headerButtonsOpaque ? 'bg-palette-cream/95 text-palette-ink hover:bg-palette-cream' : (isLightText ? 'text-white hover:text-white/80' : 'text-palette-ink hover:text-palette-stone')}`}
												aria-label='Ir al panel de administración'
											>
												<GoTools className='h-5 w-5' />
											</button>
										)}
										<Menu.Button
											as='button'
											type='button'
											className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-4 md:px-5 py-2 transition-all duration-200 shrink-0 inline-flex items-center justify-center gap-1 cursor-pointer ${isAnyMenuOpen ? 'text-white border border-white/80 hover:bg-white hover:text-palette-ink hover:border-white' : headerButtonsOpaque ? 'bg-palette-cream/95 text-palette-ink border border-palette-stone/30 hover:bg-palette-cream' : isLightText ? 'text-white border border-white/40 hover:bg-white/20' : 'text-palette-ink border border-palette-stone/50 hover:border-palette-ink hover:bg-palette-stone/5'}`}
											onClick={() => {
												if (onMenuClick && isMobile) {
													if (isMobile) onMenuClick();
												} else toggleNav();
											}}
										>
											{sidebarOpen && isMobile ? (
												<XMarkIcon className="h-5 w-5" />
											) : showNav ? (
												<IoCloseOutline className="h-5 w-5" />
											) : (
												<span>Menú</span>
											)}
										</Menu.Button>
									</div>
								</Menu>
							</div>
						</div>
					) : (
						// Distribución normal (incluye Move Crew)
						<div className="flex justify-between items-center pl-3 pr-4 md:pl-8 md:pr-8 lg:gap-x-8 h-full">
					<div className='flex items-center justify-start shrink-0 gap-4'>
										<Link href={(auth?.user?.subscription?.active || auth?.user?.isVip) ? (isLibrary ? routes.navegation.index : routes.navegation.membership.library) : routes.navegation.index} className={`font-montserrat font-semibold tracking-[0.2em] text-xl md:text-2xl cursor-pointer hover:opacity-80 transition-opacity ${sidebarOpen && !isMobile ? 'opacity-0' : 'opacity-100'} ${logoLight ? 'text-white' : 'text-palette-ink'}`} style={{ transition: 'opacity 200ms ease' }}>
											MMOVE ACADEMY
										</Link>
						{(auth?.user?.subscription?.active || auth?.user?.isVip) && !isMoveCrew && (
							<>
								<span className={`hidden md:block ${headerTitleLight ? 'text-white/60' : 'text-palette-stone/60'}`}>|</span>
								<div className="hidden md:flex items-center gap-6">
									<Link
										href={routes.navegation.membership.library}
										className={`font-montserrat font-light text-sm tracking-[0.1em] uppercase transition-all duration-200 ${headerTitleLight 
													? 'text-white/80 hover:text-white/100' 
													: 'text-palette-stone hover:text-palette-ink'
										}`}
									>
										Biblioteca
									</Link>
									<Link
										href={routes.navegation.membership.weeklyPath}
										className={`font-montserrat font-light text-sm tracking-[0.1em] uppercase transition-all duration-200 ${headerTitleLight 
													? 'text-white/80 hover:text-white/100' 
													: 'text-palette-stone hover:text-palette-ink'
										}`}
									>
										Camino
									</Link>
								</div>
							</>
						)}
					</div>
					{/* Espacio central vacío */}
					<div className="flex flex-1 w-full justify-center items-center min-h-[2rem]">
						<div className="hidden md:block w-full max-w-2xl text-center" aria-hidden="true">
							{/* Aquí se puede añadir avisos, promos o mensajes destacados */}
						</div>
					</div>
					{/* En móvil Move Crew y Menú están en MainSideBar abajo; en desktop se muestan aquí */}
					<div className='hidden md:flex items-center gap-3 shrink-0'>
						{/* En Move Crew: sin acceso → Empezar Camino; con acceso (Admin/suscripción) → se muestra Move Crew en el Menú */}
						{isMoveCrew && !(auth?.user && (auth.user.subscription?.active || auth.user.isVip || auth.user.rol === 'Admin')) && (
							<Link
								href={`${routes.navegation.membership.moveCrew}#move-crew-plans`}
								className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-5 py-2 transition-all duration-200 ${isAnyMenuOpen ? 'text-white border border-white/80 hover:bg-white hover:text-palette-ink hover:border-white' : 'bg-black text-white border border-black hover:bg-palette-sage hover:border-palette-sage'}`}
							>
								Empezar Camino
							</Link>
						)}
						<Menu as='div' className='relative inline-block text-left'>
							<div className='flex items-center gap-3'>
								{/* Move Crew: suscripción activa, isVip o Admin; mismo estilo que Empezar Camino (fondo negro, hover verde) */}
								{auth?.user && (auth.user.subscription?.active || auth.user.isVip || auth.user.rol === 'Admin') && (
									<button
										type='button'
										data-tutorial-move-crew-target
										onClick={(e) => { 
											const tutorialActive = document.body.classList.contains('tutorial-active');
											if (tutorialActive) return;
											state.weeklyPathNavOpen = !snap.weeklyPathNavOpen; 
										}}
										className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-4 md:px-5 py-2 transition-all duration-200 shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer ${snap.weeklyPathNavOpen ? 'text-white border border-white/80 hover:bg-white hover:text-palette-ink hover:border-white' : isAnyMenuOpen ? 'text-white border border-white/80 hover:bg-white hover:text-palette-ink hover:border-white' : headerButtonsOpaque ? 'bg-palette-cream/95 text-palette-ink border border-palette-stone/30 hover:bg-palette-cream' : 'bg-black text-white border border-black hover:bg-palette-sage hover:border-palette-sage'}`}
										aria-label="Abrir navegador Move Crew"
									>
										{snap.weeklyPathNavOpen ? (
											<>
												<IoCloseOutline className="h-5 w-5" aria-hidden />
												<span>Cerrar</span>
											</>
										) : (
											<span>Move Crew</span>
										)}
									</button>
								)}
								{auth.user?.rol === 'Admin' && (
									<button
										type='button'
										onClick={() => router.push('/admin')}
className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-4 md:px-5 py-2 transition-all duration-200 shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer ${isAnyMenuOpen ? 'text-white border border-white/80 hover:bg-white hover:text-palette-ink hover:border-white' : headerButtonsOpaque ? 'bg-palette-cream/95 text-palette-ink border border-palette-stone/30 hover:bg-palette-cream' : (isMoveCrew ? 'text-palette-ink border border-palette-stone/50 hover:border-palette-ink hover:bg-palette-stone/5' : isLightText ? 'text-white border border-white/40 hover:bg-white/20' : 'text-palette-ink border border-palette-stone/50 hover:border-palette-ink hover:bg-palette-stone/5')}`}
												aria-label='Ir al panel de administración'
									>
										<span>Admin</span>
									</button>
								)}
								<Menu.Button
									as='button'
									type='button'
									className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-4 md:px-5 py-2 transition-all duration-200 shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer ${isAnyMenuOpen ? 'text-white border border-white/80 hover:bg-white hover:text-palette-ink hover:border-white' : headerButtonsOpaque ? 'bg-palette-cream/95 text-palette-ink border border-palette-stone/30 hover:bg-palette-cream' : (isMoveCrew ? 'text-palette-ink border border-palette-stone/50 hover:border-palette-ink hover:bg-palette-stone/5' : isLightText ? 'text-white border border-white/40 hover:bg-white/20' : 'text-palette-ink border border-palette-stone/50 hover:border-palette-ink hover:bg-palette-stone/5')}`}
									onClick={toggleNav}
								>
									{state.systemNavOpen ? (
										<>
											<IoCloseOutline className="h-5 w-5" aria-hidden />
											<span>Cerrar</span>
										</>
									) : (
										<span>Menú</span>
									)}
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

