"use client"
import { User } from '../../typings';
import state from '../valtio';
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next13-progressbar';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSnapshot } from 'valtio';
import { CiCircleChevLeft, CiCircleChevRight } from 'react-icons/ci';
import { AiOutlineBook } from 'react-icons/ai';
import { LuSettings } from 'react-icons/lu';
import { useAppSelector } from '../redux/hooks';
import { useAuth } from '../hooks/useAuth';
import { useLogout } from '../hooks/useLogout';
import { routes } from '../constants/routes';
import { isCursoPublicPath } from '../lib/cursoPaths';
import { PiHouseLineThin } from 'react-icons/pi';
import { SiEditorconfig } from 'react-icons/si';
import { ArrowLeftEndOnRectangleIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
	const { performLogout } = useLogout('/');
	const linkRef = useRef<HTMLAnchorElement | null>(null);
	const linkMembRef = useRef<HTMLAnchorElement | null>(null);
	const [domLoaded, setDomLoaded] = useState(true);
	const [isMobile, setIsMobile] = useState(false);
	const [showMenuTooltip, setShowMenuTooltip] = useState(false);
	const [userLevel, setUserLevel] = useState<number | null>(null);
	const [levelProgress, setLevelProgress] = useState<number>(0);
	const [totalCoherenceUnits, setTotalCoherenceUnits] = useState<number | null>(null);
	const [profileMenuOpen, setProfileMenuOpen] = useState(false);
	const [eventsMentorshipOpen, setEventsMentorshipOpen] = useState(false);
	const profileMenuRefMobile = useRef<HTMLDivElement>(null);
	const profileMenuRefDesktop = useRef<HTMLDivElement>(null);
	const eventsMentorshipRef = useRef<HTMLDivElement>(null);
	const snap = useSnapshot(state);
	const headerScroll = useAppSelector(
		(state: any) => state.headerLibraryReducer.value.scrollHeader
	);

    const isMentorship = path === routes.navegation.mentorship;
    const isCursoLanding = isCursoPublicPath(path);
	/** Landing comercial: mentoría y páginas de curso */
	const isMembershipLanding = isMentorship || isCursoLanding;
    const isPaymentSuccess = path === routes.navegation.paymentSuccess;
    const isAccount = path === routes.user.perfil || path.startsWith(routes.navegation.account);

	const isWeeklyPath = (path === routes.navegation.membership.weeklyPath || path.startsWith(routes.navegation.membership.weeklyPath));
	const isBienvenida = path === routes.navegation.onboarding.bienvenida || path.startsWith(routes.navegation.onboarding.bienvenida);
	const isInfoLight =
		path === routes.navegation.preguntasFrecuentes ||
		path === routes.navegation.about ||
		path === routes.navegation.privacy ||
		path === routes.navegation.contact ||
		path === routes.navegation.terminos;
	const isEvents = path === routes.navegation.eventos || path.includes(routes.navegation.eventos);
	const isAuth = path === routes.user.login || path === routes.user.forget || path === routes.user.forgetEmail || path === routes.user.register;
	const isIndex = path === routes.navegation.index;
	const isClasses = path.startsWith(routes.navegation.classes);
	const isEmailVerify = path.startsWith(routes.navegation.email);
	const isLibraryArea = path.startsWith(routes.navegation.membership.library);
	/** Logo siempre al inicio (sin enlace a biblioteca desde el header por ahora). */
	const logoHref = routes.navegation.index;
	// Solo en página de módulo (/biblioteca/modulo/xxx): texto blanco arriba, al scroll fondo blanco y texto negro
	const isLibraryModulePage = path.startsWith(routes.navegation.membership.library + '/module');
	// Página de práctica (video): header opaco para que se vean logo y botones
	const isLibraryPracticePage = path.includes('/practice/');
	const menuTooltipText = 'Una semana completada = 1 U.C. Completá semanas del Camino y canjeá por programas o merch.';

	// Evita que el header del login y home cambien al hacer scroll
	const transparentUntilScroll = !isInfoLight && !isWeeklyPath && !isAuth && !isIndex;
	// Para la página de success, solo usar isScrolled local, no headerScroll del Redux
	const scrolled = isPaymentSuccess ? isScrolled : (isScrolled || headerScroll);

	// Usar useRef para evitar que el efecto se ejecute constantemente
	const isCursoLandingRef = useRef(isCursoLanding);
	const isMembershipLandingRef = useRef(isMembershipLanding);
	const pathRef = useRef(path);

	// Actualizar refs cuando cambian
	useEffect(() => {
		isCursoLandingRef.current = isCursoLanding;
		isMembershipLandingRef.current = isMembershipLanding;
		pathRef.current = path;
	}, [isCursoLanding, isMembershipLanding, path]);

	// Tracking de coherencia (Camino) para el avatar cuando hay sesión
	useEffect(() => {
		const hasAccess = auth && auth.user;
		if (!hasAccess || !auth?.user) {
			setUserLevel(null);
			setLevelProgress(0);
			setTotalCoherenceUnits(null);
			return;
		}
		let cancelled = false;
		fetch('/api/coherence/tracking', { credentials: 'include', cache: 'no-store' })
			.then((r) => (r.ok ? r.json() : null))
			.then((data) => {
				if (!cancelled && data?.success && data?.tracking) {
					setUserLevel(data.tracking.level != null ? data.tracking.level : null);
					setLevelProgress(typeof data.tracking.levelProgress === 'number' ? data.tracking.levelProgress : 0);
					setTotalCoherenceUnits(typeof data.tracking.totalUnits === 'number' ? data.tracking.totalUnits : null);
				} else if (!cancelled) {
					setUserLevel(null);
					setLevelProgress(0);
					setTotalCoherenceUnits(null);
				}
			})
			.catch(() => { if (!cancelled) { setUserLevel(null); setLevelProgress(0); setTotalCoherenceUnits(null); } });
		return () => { cancelled = true; };
	}, [auth?.user]);

	// Escuchar actualizaciones de coherencia (p. ej. al completar una semana en el Camino) para actualizar el número en el menú de perfil
	useEffect(() => {
		const handler = (e: CustomEvent<{ totalUnits?: number; level?: number; levelProgress?: number }>) => {
			const d = e.detail;
			if (typeof d.totalUnits === 'number') setTotalCoherenceUnits(d.totalUnits);
			if (typeof d.level === 'number') setUserLevel(d.level);
			if (typeof d.levelProgress === 'number') setLevelProgress(d.levelProgress);
		};
		window.addEventListener('coherence-tracking-updated', handler as any);
		return () => window.removeEventListener('coherence-tracking-updated', handler as any);
	}, []);

	// Cerrar menú de perfil y dropdown Eventos/Mentoría al hacer clic fuera
	useEffect(() => {
		if (!profileMenuOpen && !eventsMentorshipOpen) return;
		const handleClick = (e: MouseEvent) => {
			const target = e.target as Node;
			const insideProfile = (profileMenuRefMobile.current?.contains(target) || profileMenuRefDesktop.current?.contains(target));
			const insideEvents = eventsMentorshipRef.current?.contains(target);
			if (!insideProfile) setProfileMenuOpen(false);
			if (!insideEvents) setEventsMentorshipOpen(false);
		};
		document.addEventListener('click', handleClick);
		return () => document.removeEventListener('click', handleClick);
	}, [profileMenuOpen, eventsMentorshipOpen]);

	useEffect(() => {
		// Inicializar el estado de scroll al montar
		// Cuerpo autónomo y Mentoría landing: mismo criterio (scroll por contenedor / Redux / movecrew-scroll)
		if (!isMembershipLandingRef.current) {
			const scroll = window.scrollY;
			setIsScrolled(scroll > 0);
			if (path === routes.navegation.index) {
				setIndexScrollY(scroll);
			}
		} else {
			setIsScrolled(false);
		}
		setIsMobile(window.innerWidth < 1024);

		const handleResize = () => setIsMobile(window.innerWidth < 1024);

		// Throttle para el scroll de window
		let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
		const handleWindowScroll = () => {
			// No usar scroll de ventana en landings tipo membership (mismo comportamiento que Cuerpo autónomo)
			if (!isMembershipLandingRef.current) {
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

		let landingScrollTimeout: ReturnType<typeof setTimeout> | null = null;

		const handleCourseScroll = (event: Event) => {
			if (!isCursoLandingRef.current) return;
			const detail = (event as CustomEvent).detail;
			const scrollTop = detail?.scrollTop ?? 0;
			const isAtTop = scrollTop === 0;

			if (isAtTop) {
				if (landingScrollTimeout) {
					clearTimeout(landingScrollTimeout);
					landingScrollTimeout = null;
				}
				setIsScrolled(false);
				return;
			}

			if (landingScrollTimeout) return;
			landingScrollTimeout = setTimeout(() => {
				setIsScrolled(scrollTop > 0);
				landingScrollTimeout = null;
			}, 10);
		};

		window.addEventListener('scroll', handleWindowScroll, { passive: true });
		window.addEventListener('course-scroll', handleCourseScroll);
		window.addEventListener('resize', handleResize);
		
		return () => {
			if (scrollTimeout) clearTimeout(scrollTimeout);
			if (landingScrollTimeout) clearTimeout(landingScrollTimeout);
			window.removeEventListener('scroll', handleWindowScroll);
			window.removeEventListener('course-scroll', handleCourseScroll);
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
    // Cuerpo autónomo y Mentoría: al abrir el menú (showNav), header transparente; mismo criterio que membership
    const isMembershipLandingNavOpen = isMembershipLanding && showNav;
    let headerBgClass = (isAuth)
        ? 'bg-transparent'
        : (isBienvenida
            ? (scrolled ? 'bg-white/90 backdrop-blur-sm' : 'bg-transparent')
            : (isMembershipLanding
                ? (isMembershipLandingNavOpen ? 'bg-transparent' : (scrolled ? 'bg-white/90 backdrop-blur-sm' : 'bg-transparent'))
                : (isIndex
                    ? (isIndexStage1 ? 'bg-[#FAF8F5]' : (scrolled ? 'bg-[#141414]' : 'bg-transparent'))
                    : (isLibraryArea
                        ? 'bg-transparent'
                        : (isEmailVerify || isPaymentSuccess || isClasses
                            ? 'bg-transparent'
                            : (isAccount || isWeeklyPath
                                ? (scrolled ? 'bg-white/50 backdrop-blur-sm' : 'bg-transparent')
                                : (transparentUntilScroll
                                    ? (scrolled ? 'bg-[#141414]/50 backdrop-blur-sm' : 'bg-transparent')
                                    : 'bg-white/90 backdrop-blur-sm')))))));

    // Cuando el menú principal o el menú Cuerpo autónomo están abiertos, todos los botones del header en blanco/claro
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
                        : ((isAccount || isWeeklyPath)
                            ? false
                            : (isMentorship
                                ? true
                                : (isCursoLanding
                                    ? false
                                    : (transparentUntilScroll && !scrolled
                                        ? true
                                        : false))))))));
    // En weekly path y práctica (video): texto blanco. En página de módulo: sin scroll blanco, con scroll negro. Resto de library: texto negro. Con navegación abierta: texto claro.
    const isLightText = isWeeklyPath ? true : (isLibraryPracticePage ? true : (isLibraryModulePage ? !scrolled : (isLibraryArea ? (forceLight ? true : false) : (forceLight ? true : isLightTextBase))));

    // Si el texto es claro y hay scroll, aplicar fondo difuminado para contraste (no en etapa 1 index). Cuerpo autónomo no cambia.
    if (!isMembershipLanding && !isLibraryArea && scrolled && isLightText && !isIndexStage1) {
        headerBgClass = 'bg-black/40 backdrop-blur-md';
    }
    // Solo en página de módulo (/biblioteca/modulo/xxx), cuando hay scroll: fondo blanco y texto negro. En práctica (video) el header siempre transparente.
    if (isLibraryModulePage && !isLibraryPracticePage && scrolled) {
        headerBgClass = 'bg-white backdrop-blur-sm';
    }
    // Resto de library (/biblioteca, /biblioteca/clases-individuales...) al hacer scroll: fondo crema
    if (isLibraryArea && !isLibraryModulePage && scrolled) {
        headerBgClass = 'bg-palette-cream/70 backdrop-blur-sm';
    }
    // Con el menú normal o Cuerpo autónomo abierto, el header siempre transparente (blanco/negro queda transparente)
    if (showNav || snap.weeklyPathNavOpen) {
        headerBgClass = 'bg-transparent';
    }
	const textColorMain = isIndexStage1 ? 'text-black' : (isLightText ? 'text-white' : (isAuth || isIndex ? 'text-gray-200' : 'text-gray-800'));
	const textColorMuted = isIndexStage1 ? 'text-gray-600 hover:text-black' : (isLightText ? 'text-white/60 hover:text-white' : (isAuth || isIndex ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'));
	const underlineFill = isWeeklyPath ? 'white' : (isLightText ? 'white' : 'black');

	// Color del título MMOVE ACADEMY: en weekly path y práctica (video) siempre blanco; en página de módulo blanco sin scroll, negro con scroll; resto de library negro. Con navegación abierta: siempre claro.
	const headerTitleLight = (isWeeklyPath
		? true
		: (isLibraryPracticePage
		? true
		: (isLibraryModulePage
		? !scrolled
		: (isLibraryArea
			? false
				: (forceLightByNav
				? true
				: (isMembershipLanding
					? false
					: (isIndexStage1
						? false
							: (isAccount
							? forceLight
							: ((isAuth || isIndex) ? true : isLightText))))))))) || forceLightByNav;

	// En página de práctica (video) los botones del header con fondo opaco para que se vean
	const headerButtonsOpaque = isLibraryPracticePage;

	const membershipLandingButtonClass =
		'text-palette-ink border border-palette-stone/50 hover:border-palette-sage hover:bg-palette-sage/30';

	// Logo MMOVE ACADEMY en blanco en weekly path y cuando el menú o el navegador Cuerpo autónomo están abiertos
	const logoLight = headerTitleLight || showNav || snap.weeklyPathNavOpen || isWeeklyPath;

	const linkBase = `block text-base/6 cursor-pointer focus:outline-none transition-colors duration-200`;
	const linkMuted = `${textColorMuted}`;
	const linkActive = isLightText ? 'text-white' : 'text-[#234C8C]';

	const menuOpenOnMobile = (snap.weeklyPathNavOpen || snap.bitacoraNavOpen) && isMobile;

	const cursoTitleInHeader = isCursoLanding && snap.cursoHeaderTitle;
	const logoTitleClass = `font-montserrat font-semibold uppercase tracking-[0.15em] md:tracking-[0.2em] cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap shrink-0 ${logoLight ? 'text-white' : 'text-palette-ink'}`;
	const cursoTitleClass = `font-montserrat font-medium tracking-tight truncate max-w-[42vw] sm:max-w-[280px] md:max-w-[360px] ${logoLight ? 'text-white' : 'text-palette-ink'}`;

	const brandBlock = (logoSizeClass: string, hideLogoOnMobileSidebar?: boolean) => (
		<div className="flex items-center gap-2 md:gap-3 min-w-0">
			<Link
				href={logoHref}
				className={`${logoTitleClass} ${logoSizeClass} ${hideLogoOnMobileSidebar && sidebarOpen && isMobile ? 'opacity-0' : 'opacity-100'}`}
				style={{ transition: 'opacity 200ms ease' }}
			>
				MMOVE
			</Link>
			{cursoTitleInHeader ? (
				<>
					<span className={`hidden sm:inline shrink-0 ${logoLight ? 'text-white/50' : 'text-palette-stone/50'}`} aria-hidden>
						|
					</span>
					<span className={`${cursoTitleClass} text-sm md:text-lg`} title={snap.cursoHeaderTitle}>
						{snap.cursoHeaderTitle}
					</span>
				</>
			) : null}
		</div>
	);

	const headerContent = domLoaded ? (
				<m.div
					initial={{ y: 0, opacity: 1 }}
					animate={{ y: 0, opacity: 1 }}
					className={`fixed w-full h-16 min-h-14 px-4 py-3 md:py-12 md:px-8 transition-all duration-500 ease-in-out ${(snap.weeklyPathNavOpen || snap.bitacoraNavOpen) ? 'z-[300]' : 'z-[250]'} ${headerBgClass}`} 
				>
					{isWeeklyPath ? (
						// Distribución especial para camino: flex en 3 zonas; más espacio a la derecha del logo solo aquí
						<div className="flex items-center justify-between h-full w-full gap-4">
							{/* Logo | Eventos + Mentoría */}
							<div className='flex items-center gap-4 md:gap-6 min-w-0 shrink-0'>
								<div className="mr-4 md:mr-24">{brandBlock('text-sm md:text-xl', true)}</div>
								<div className="hidden md:flex items-center gap-6 shrink-0 flex-wrap">
								<span className={`hidden md:block shrink-0 ${isLightText ? 'text-white/60' : 'text-palette-stone/60'}`}>|</span>
									<Link href={routes.navegation.eventos} className={`font-montserrat text-sm tracking-[0.1em] uppercase transition-all duration-200 whitespace-nowrap ${isLightText ? (isEvents ? 'text-white font-semibold' : 'text-white/80 hover:text-white font-light') : (isEvents ? 'text-palette-ink font-semibold' : 'text-palette-stone hover:text-palette-ink font-light')}`}>
										Eventos
									</Link>
									<Link href={routes.navegation.mentorship} className={`font-montserrat text-sm tracking-[0.1em] uppercase transition-all duration-200 whitespace-nowrap ${isLightText ? (isMentorship ? 'text-white font-semibold' : 'text-white/80 hover:text-white font-light') : (isMentorship ? 'text-palette-ink font-semibold' : 'text-palette-stone hover:text-palette-ink font-light')}`}>
										Mentoría
									</Link>
								</div>
							</div>
							{/* Derecha: en móvil = dropdown + usuario + menú; en desktop = Menú + Admin + usuario */}
							<div className='flex items-center gap-2 shrink-0'>
								{/* Solo móvil: con acceso = menú navegación (como bitácora); sin acceso = popover Eventos/Mentoría + Iniciar sesión */}
								<div className="flex md:hidden items-center gap-2">
								{(() => {
									const hasNavAccess = auth && auth.user;
									if (hasNavAccess) {
										return (
											<button
												type="button"
												data-tutorial-membership-target
												onClick={(e) => {
													e.stopPropagation();
													const tutorialActive = document.body.classList.contains('tutorial-active');
													if (tutorialActive) return;
													state.weeklyPathNavOpen = !snap.weeklyPathNavOpen;
												}}
												className={`rounded-full p-2 border transition-colors ${isLightText ? 'text-white border-white/40 hover:bg-palette-sage/40 hover:border-palette-sage' : 'text-palette-ink border-palette-stone/40 hover:bg-palette-sage/30 hover:border-palette-sage'}`}
												aria-expanded={snap.weeklyPathNavOpen}
												aria-label="Menú"
											>
												<ChevronDownIcon className={`h-5 w-5 transition-transform ${snap.weeklyPathNavOpen ? 'rotate-180' : ''}`} />
											</button>
										);
									}
									return (
								<div className="relative shrink-0" ref={eventsMentorshipRef}>
									<button
										type="button"
										onClick={(e) => { e.stopPropagation(); setEventsMentorshipOpen((v) => !v); }}
										className={`rounded-full p-2 border transition-colors ${isLightText ? 'text-white border-white/40 hover:bg-palette-sage/40 hover:border-palette-sage' : 'text-palette-ink border-palette-stone/40 hover:bg-palette-sage/30 hover:border-palette-sage'}`}
										aria-expanded={eventsMentorshipOpen}
										aria-haspopup="true"
										aria-label="Mentoría y eventos"
									>
										<ChevronDownIcon className={`h-5 w-5 transition-transform ${eventsMentorshipOpen ? 'rotate-180' : ''}`} />
									</button>
									{eventsMentorshipOpen && (
										<div className="absolute right-0 top-full mt-2 min-w-[10rem] w-max max-w-[min(20rem,calc(100vw-2rem))] rounded-xl bg-palette-ink border border-palette-stone/20 shadow-xl py-2 z-[260]">
											<Link href={routes.navegation.eventos} className={`block px-4 py-2.5 text-sm font-montserrat transition-colors ${isEvents ? 'text-palette-cream font-semibold bg-palette-stone/20' : 'text-palette-cream hover:bg-palette-sage/25'}`} onClick={() => setEventsMentorshipOpen(false)}>Eventos</Link>
											<Link href={routes.navegation.mentorship} className={`block px-4 py-2.5 text-sm font-montserrat transition-colors ${isMentorship ? 'text-palette-cream font-semibold bg-palette-stone/20' : 'text-palette-cream hover:bg-white/10'}`} onClick={() => setEventsMentorshipOpen(false)}>Mentoría</Link>
											{!auth?.user && (
												<button type="button" className="block w-full text-left px-4 py-2.5 font-montserrat font-light text-xs tracking-[0.12em] uppercase text-palette-cream hover:bg-palette-sage/25 transition-colors" onClick={() => { setEventsMentorshipOpen(false); state.loginForm = true; }}>Iniciar sesión</button>
											)}
										</div>
									)}
								</div>
									);
								})()}
								{auth && auth.user && (() => {
									const hasSub = true;
									const size = 40;
									const r = 17;
									const circumference = 2 * Math.PI * r;
									const progressPct = hasSub ? (levelProgress / 8) * 100 : 0;
									const strokeDashoffset = circumference * (1 - progressPct / 100);
									return (
									<div className="relative shrink-0" ref={profileMenuRefMobile}>
										<button type="button" onClick={(e) => { e.stopPropagation(); setProfileMenuOpen((v) => !v); }} className="flex items-center shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50" aria-expanded={profileMenuOpen} aria-haspopup="true" title="Abrir menú de perfil">
											<div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
												{isWeeklyPath && hasSub && (
													<svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full -rotate-90" style={{ width: size, height: size }}>
														<circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
														<circle cx="20" cy="20" r={r} fill="none" stroke="rgba(249,115,22,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={strokeDashoffset} className="transition-all duration-500" />
													</svg>
												)}
												<div className={`w-8 h-8 rounded-full overflow-hidden bg-palette-ink/80 flex items-center justify-center text-palette-cream font-montserrat font-semibold text-xs ring-2 ${isLightText ? 'ring-white/30' : 'ring-palette-stone/30'}`}>
													{(auth.user as any).profileImageUrl ? (
														<img src={(auth.user as any).profileImageUrl} alt="" className="w-full h-full object-cover" />
													) : (
														<span>{(auth.user.nombre || auth.user.name || auth.user.email || 'U').charAt(0).toUpperCase()}</span>
													)}
												</div>
												{isWeeklyPath && hasSub && userLevel != null && (
													<span className="absolute -bottom-1 -right-1 min-w-[14px] h-3.5 rounded-full bg-palette-sage/90 text-palette-ink text-[10px] font-bold flex items-center justify-center px-1">{userLevel}</span>
												)}
											</div>
										</button>
										{profileMenuOpen && (
											<div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-palette-ink border border-palette-stone/20 shadow-xl py-2 z-[260]">
												<Link href={routes.user.perfil} className="block px-4 py-2.5 text-sm font-montserrat text-palette-cream hover:bg-palette-sage/25 transition-colors" onClick={() => setProfileMenuOpen(false)}>Mi perfil</Link>
												<button type="button" className="block w-full text-left px-4 py-2.5 text-sm font-montserrat text-red-500 hover:bg-palette-sage/25 transition-colors" onClick={() => { setProfileMenuOpen(false); performLogout('/'); }}>Cerrar sesión</button>
											</div>
										)}
									</div>
									);
								})()}
								</div>
								{/* Solo desktop: Menú + Admin + usuario */}
								<div className='hidden md:flex items-center gap-3'>
									{auth?.user && (
										<button
											type='button'
											data-tutorial-membership-target
											onClick={(e) => { 
												const tutorialActive = document.body.classList.contains('tutorial-active');
												if (tutorialActive) return;
												state.weeklyPathNavOpen = !snap.weeklyPathNavOpen; 
											}}
											className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-4 md:px-5 py-2 transition-all duration-200 shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer ${(snap.weeklyPathNavOpen || isWeeklyPath) ? 'text-white border border-white/80 hover:bg-palette-sage hover:text-palette-ink hover:border-palette-sage' : 'bg-black text-white border border-black hover:bg-palette-sage hover:border-palette-sage hover:text-palette-ink'}`}
											aria-label="Abrir menú"
										>
											{snap.weeklyPathNavOpen ? (
												<>
													<IoCloseOutline className="h-5 w-5" aria-hidden />
													<span>Cerrar</span>
												</>
											) : (
												<span>Menú</span>
											)}
										</button>
									)}
								{auth?.user?.rol === 'Admin' && (
										<button
											type='button'
											onClick={() => router.push('/admin')}
											className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-4 md:px-5 py-2 transition-all duration-200 shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer ${(isAnyMenuOpen || isWeeklyPath) ? 'text-white border border-white/80 hover:bg-palette-sage hover:text-palette-ink hover:border-palette-sage' : headerButtonsOpaque ? 'bg-palette-cream/95 text-palette-ink border border-palette-stone/30 hover:bg-palette-sage hover:border-palette-sage' : 'text-palette-ink border border-palette-stone/50 hover:border-palette-sage hover:bg-palette-sage/30'}`}
											aria-label='Ir al panel de administración'
										>
											<span>Admin</span>
										</button>
									)}
								{/* Ruta semanal: avatar + menú perfil */}
								{isWeeklyPath && auth?.user && (() => {
									const hasSub = true;
									const size = 40;
									const r = 18;
									const circumference = 2 * Math.PI * r;
									const progressPct = hasSub ? (levelProgress / 8) * 100 : 0;
									const strokeDashoffset = circumference * (1 - progressPct / 100);
									return (
									<div className="relative shrink-0" ref={profileMenuRefDesktop}>
										<button type="button" onClick={(e) => { e.stopPropagation(); setProfileMenuOpen((v) => !v); }} className="flex items-center shrink-0 rounded-full hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/50" aria-expanded={profileMenuOpen} aria-haspopup="true" title="Abrir menú de perfil">
											<div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
												{hasSub && (
													<svg viewBox="0 0 44 44" className="absolute inset-0 w-full h-full -rotate-90" style={{ width: size, height: size }}>
														<circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
														<circle cx="22" cy="22" r={r} fill="none" stroke="rgba(249,115,22,0.9)" strokeWidth="2" strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={strokeDashoffset} className="transition-all duration-500" />
													</svg>
												)}
												<div className="w-9 h-9 rounded-full overflow-hidden bg-palette-ink/80 flex items-center justify-center text-palette-cream font-montserrat font-semibold text-sm ring-2 ring-white/30">
													{(auth.user as any).profileImageUrl ? (
														<img src={(auth.user as any).profileImageUrl} alt="" className="w-full h-full object-cover" />
													) : (
														<span>{(auth.user.nombre || auth.user.name || auth.user.email || 'U').charAt(0).toUpperCase()}</span>
													)}
												</div>
												{hasSub && userLevel != null && (
													<span className="absolute -bottom-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-palette-sage text-palette-ink text-xs font-bold flex items-center justify-center">{userLevel}</span>
												)}
											</div>
										</button>
										{profileMenuOpen && (
											<div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-palette-ink border border-palette-stone/20 shadow-xl py-2 z-[260]">
												<Link href={routes.user.perfil} className="block px-4 py-2.5 text-sm font-montserrat text-palette-cream hover:bg-palette-sage/25 transition-colors" onClick={() => setProfileMenuOpen(false)}>Mi perfil</Link>
												<button type="button" className="block w-full text-left px-4 py-2.5 text-sm font-montserrat text-red-500 hover:bg-palette-sage/25 transition-colors" onClick={() => { setProfileMenuOpen(false); performLogout('/'); }}>Cerrar sesión</button>
											</div>
										)}
									</div>
									);
								})()}
								</div>
							</div>
						</div>
					) : (
						// Distribución normal
						<div className="flex justify-between items-center pl-3 pr-4 md:pl-8 md:pr-8 lg:gap-x-8 h-full">
					<div className='flex items-center justify-start shrink-0 gap-4'>
										{brandBlock('text-sm md:text-2xl', false)}
					</div>
					{/* Centro: Mentoría y Eventos */}
					<div className="flex flex-1 w-full justify-start items-center min-h-[2rem]">
						<div className={`hidden items-center gap-6 flex-wrap -translate-x-[15%] ${isMembershipLanding || isBienvenida ? 'md:hidden' : 'md:flex'} ml-4`}>
						<span className={`hidden md:block shrink-0 ${isLightText ? 'text-white/60' : 'text-palette-stone/60'}`}>|</span>
							<Link href={routes.navegation.mentorship} className={`font-montserrat text-sm tracking-[0.1em] uppercase transition-all duration-200 ${headerTitleLight ? (isMentorship ? 'text-white font-semibold' : 'text-white/80 hover:text-white font-light') : (isMentorship ? 'text-palette-ink font-semibold' : 'text-palette-stone hover:text-palette-ink font-light')}`}>
								Mentoría
							</Link>
			
							<Link href={routes.navegation.eventos} className={`font-montserrat text-sm tracking-[0.1em] uppercase transition-all duration-200 ${headerTitleLight ? (isEvents ? 'text-white font-semibold' : 'text-white/80 hover:text-white font-light') : (isEvents ? 'text-palette-ink font-semibold' : 'text-palette-stone hover:text-palette-ink font-light')}`}>
								Eventos
							</Link>
						</div>
					</div>
					{/* Móvil (layout normal): con acceso = menú navegación (bitácora en index, weekly en resto); sin acceso = popover */}
					<div className="flex md:hidden items-center gap-2 shrink-0">
						{(() => {
							const hasNavAccess = auth && auth.user;
							if (hasNavAccess) {
								const navOpen = isIndex ? snap.bitacoraNavOpen : snap.weeklyPathNavOpen;
								return (
									<button
										type="button"
										data-tutorial-membership-target
										onClick={(e) => {
											e.stopPropagation();
											const tutorialActive = document.body.classList.contains('tutorial-active');
											if (tutorialActive) return;
											if (isIndex) {
												state.bitacoraNavOpen = !snap.bitacoraNavOpen;
												state.weeklyPathNavOpen = !snap.weeklyPathNavOpen; // mismo overlay en layout
											} else {
												state.weeklyPathNavOpen = !snap.weeklyPathNavOpen;
											}
										}}
										className={`rounded-full p-2 border transition-colors ${headerTitleLight ? 'text-white border-white/40 hover:bg-palette-sage/40 hover:border-palette-sage' : 'text-palette-ink border-palette-stone/40 hover:bg-palette-sage/30 hover:border-palette-sage'}`}
										aria-expanded={navOpen}
										aria-label="Menú"
									>
										<ChevronDownIcon className={`h-5 w-5 transition-transform ${navOpen ? 'rotate-180' : ''}`} />
									</button>
								);
							}
							return (
						<div className="relative shrink-0" ref={eventsMentorshipRef}>
							<button
								type="button"
								onClick={(e) => { e.stopPropagation(); setEventsMentorshipOpen((v) => !v); }}
								className={`rounded-full p-2 border transition-colors ${headerTitleLight ? 'text-white border-white/40 hover:bg-palette-sage/40 hover:border-palette-sage' : 'text-palette-ink border-palette-stone/40 hover:bg-palette-sage/30 hover:border-palette-sage'}`}
								aria-expanded={eventsMentorshipOpen}
								aria-haspopup="true"
								aria-label="Mentoría y eventos"
							>
								<ChevronDownIcon className={`h-5 w-5 transition-transform ${eventsMentorshipOpen ? 'rotate-180' : ''}`} />
							</button>
							{eventsMentorshipOpen && (
								<div className="absolute right-0 top-full mt-2 min-w-[10rem] w-max max-w-[min(20rem,calc(100vw-2rem))] rounded-xl bg-palette-ink border border-palette-stone/20 shadow-xl py-2 z-[260]">
									<Link href={routes.navegation.mentorship} className={`block px-4 py-2.5 text-sm font-montserrat transition-colors ${isMentorship ? 'text-palette-cream font-semibold bg-palette-stone/20' : 'text-palette-cream hover:bg-white/10'}`} onClick={() => setEventsMentorshipOpen(false)}>Mentoría</Link>
									<Link href={routes.navegation.eventos} className={`block px-4 py-2.5 text-sm font-montserrat transition-colors ${isEvents ? 'text-palette-cream font-semibold bg-palette-stone/20' : 'text-palette-cream hover:bg-palette-sage/25'}`} onClick={() => setEventsMentorshipOpen(false)}>Eventos</Link>
									{!auth?.user && (
										<button type="button" className="block w-full text-left px-4 py-2.5 font-montserrat font-light text-xs tracking-[0.12em] uppercase text-palette-cream hover:bg-palette-sage/25 transition-colors" onClick={() => { setEventsMentorshipOpen(false); state.loginForm = true; }}>Iniciar sesión</button>
									)}
								</div>
							)}
						</div>
							);
						})()}
						{auth?.user ? (
							<div className="relative shrink-0" ref={profileMenuRefDesktop}>
								<button type="button" onClick={(e) => { e.stopPropagation(); setProfileMenuOpen((v) => !v); }} className="flex items-center shrink-0 rounded-full hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-palette-stone/50" aria-expanded={profileMenuOpen} aria-haspopup="true" title="Abrir menú de perfil">
									<div className="relative flex items-center justify-center w-9 h-9">
										<div className="w-8 h-8 rounded-full overflow-hidden bg-palette-ink/80 flex items-center justify-center text-palette-cream font-montserrat font-semibold text-xs ring-2 ring-palette-stone/30">
											{(auth.user as any).profileImageUrl ? (
												<img src={(auth.user as any).profileImageUrl} alt="" className="w-full h-full object-cover" />
											) : (
												<span>{(auth.user.nombre || auth.user.name || auth.user.email || 'U').charAt(0).toUpperCase()}</span>
											)}
										</div>
									</div>
								</button>
								{profileMenuOpen && (
									<div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-palette-ink border border-palette-stone/20 shadow-xl py-2 z-[260]">
										<Link href={routes.user.perfil} className="block px-4 py-2.5 text-sm font-montserrat text-palette-cream hover:bg-palette-sage/25 transition-colors" onClick={() => setProfileMenuOpen(false)}>Mi perfil</Link>
										<button type="button" className="block w-full text-left px-4 py-2.5 text-sm font-montserrat text-red-500 hover:bg-palette-sage/25 transition-colors" onClick={() => { setProfileMenuOpen(false); performLogout('/'); }}>Cerrar sesión</button>
									</div>
								)}
							</div>
						) : null}
					</div>
					{/* Desktop: Menú (navegador Cuerpo autónomo), Admin, avatar */}
					<div className='hidden md:flex items-center gap-3 shrink-0'>
						<div className='flex items-center gap-3'>
								{auth && auth.user && (!isBienvenida) && (
									<button
										type='button'
										data-tutorial-membership-target
										onClick={(e) => { 
											const tutorialActive = document.body.classList.contains('tutorial-active');
											if (tutorialActive) return;
											state.weeklyPathNavOpen = !snap.weeklyPathNavOpen; 
										}}
										className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-4 md:px-5 py-2 transition-all duration-200 shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer ${snap.weeklyPathNavOpen ? 'text-white border border-white/80 hover:bg-palette-sage hover:text-palette-ink hover:border-palette-sage' : isAnyMenuOpen ? 'text-white border border-white/80 hover:bg-palette-sage hover:text-palette-ink hover:border-palette-sage' : headerButtonsOpaque ? 'bg-palette-cream/95 text-palette-ink border border-palette-stone/30 hover:bg-palette-sage hover:border-palette-sage' : isMembershipLanding ? membershipLandingButtonClass : isLightText ? 'text-white border border-white/40 hover:bg-palette-sage/40 hover:border-palette-sage hover:text-palette-ink' : membershipLandingButtonClass}`}
										aria-label="Abrir menú"
									>
										{snap.weeklyPathNavOpen ? (
											<>
												<IoCloseOutline className="h-5 w-5" aria-hidden />
												<span>Cerrar</span>
											</>
										) : (
											<span>Menú</span>
										)}
									</button>
								)}
								{auth?.user?.rol === 'Admin' && (
									<button
										type='button'
										onClick={() => router.push('/admin')}
										className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-4 md:px-5 py-2 transition-all duration-200 shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer ${isAnyMenuOpen ? 'text-white border border-white/80 hover:bg-palette-sage hover:text-palette-ink hover:border-palette-sage' : headerButtonsOpaque ? 'bg-palette-cream/95 text-palette-ink border border-palette-stone/30 hover:bg-palette-sage hover:border-palette-sage' : isMembershipLanding ? membershipLandingButtonClass : isLightText ? 'text-white border border-white/40 hover:bg-palette-sage/40 hover:border-palette-sage hover:text-palette-ink' : membershipLandingButtonClass}`}
												aria-label='Ir al panel de administración'
									>
										<span>Admin</span>
									</button>
								)}
							</div>
							{/* Avatar o Iniciar Sesión (desktop: arriba a la derecha) */}
							{auth?.user ? (
								<div className="relative shrink-0" ref={profileMenuRefDesktop}>
									<button type="button" onClick={(e) => { e.stopPropagation(); setProfileMenuOpen((v) => !v); }} className="flex items-center shrink-0 rounded-full hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-palette-stone/50" aria-expanded={profileMenuOpen} aria-haspopup="true" title="Abrir menú de perfil">
										<div className="relative flex items-center justify-center w-10 h-10">
											<div className="w-9 h-9 rounded-full overflow-hidden bg-palette-ink/80 flex items-center justify-center text-palette-cream font-montserrat font-semibold text-sm ring-2 ring-palette-stone/30">
												{(auth.user as any).profileImageUrl ? (
													<img src={(auth.user as any).profileImageUrl} alt="" className="w-full h-full object-cover" />
												) : (
													<span>{(auth.user.nombre || auth.user.name || auth.user.email || 'U').charAt(0).toUpperCase()}</span>
												)}
											</div>
										</div>
									</button>
									{profileMenuOpen && (
										<div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-palette-ink border border-palette-stone/20 shadow-xl py-2 z-[260]">
											<Link href={routes.user.perfil} className="block px-4 py-2.5 text-sm font-montserrat text-palette-cream hover:bg-palette-sage/25 transition-colors" onClick={() => setProfileMenuOpen(false)}>Mi perfil</Link>
											<button type="button" className="block w-full text-left px-4 py-2.5 text-sm font-montserrat text-red-500 hover:bg-palette-sage/25 transition-colors" onClick={() => { setProfileMenuOpen(false); performLogout('/'); }}>Cerrar sesión</button>
										</div>
									)}
								</div>
							) : (
								<button
									type="button"
									onClick={() => { state.loginForm = true; }}
									className={`rounded-full px-4 py-2 border transition-colors duration-200 font-montserrat font-light text-xs tracking-[0.12em] uppercase shrink-0 ${
										headerButtonsOpaque
											? 'bg-palette-cream/95 text-palette-ink border border-palette-stone/30 hover:bg-palette-sage hover:border-palette-sage'
											: isMembershipLanding
												? 'text-palette-ink border border-palette-ink/60 hover:bg-palette-sage/30 hover:border-palette-sage'
												: isLightText
													? 'text-white border border-white/40 hover:bg-palette-sage/40 hover:border-palette-sage hover:text-palette-ink'
													: 'text-palette-ink border border-palette-stone/40 hover:bg-palette-sage/30 hover:border-palette-sage'
									}`}
								>
									Iniciar sesión
								</button>
							)}
					</div>
						</div>
					)}
				</m.div>
	) : null;

	return (
		<>
			{menuOpenOnMobile ? (
				<div className="fixed w-full h-16 min-h-14 invisible" aria-hidden />
			) : (
				headerContent
			)}
			{menuOpenOnMobile && typeof document !== 'undefined' && createPortal(
				<div className="fixed inset-0 z-[301] pointer-events-none">
					<div className="pointer-events-auto w-full h-16 min-h-14">
						{headerContent}
					</div>
				</div>,
				document.body
			)}
		</>
	);
};

export default HeaderUnified;

