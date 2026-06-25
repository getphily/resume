import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
const ReactApexChart = lazy(() => import('react-apexcharts'));
const PhotoAlbum = lazy(() => import('react-photo-album').then(m => ({ default: m.MasonryPhotoAlbum })));
import 'react-photo-album/masonry.css';

import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Flex,
  Button,
  IconButton,
  Link,
  Tag,
  Divider,
  Collapse,
  useColorMode,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Image,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  useDisclosure,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { FaLinkedin, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import SkillOrbMap from '../components/SkillOrbMap';

// Inline Tech Stack Icon Paths
const techIcons = {
  node: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.57,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z"/>
    </svg>
  ),
  express: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 18.588a1.529 1.529 0 01-1.895-.72l-3.45-4.771-.5-.667-4.003 5.444a1.466 1.466 0 01-1.802.708l5.158-6.92-4.798-6.251a1.595 1.595 0 011.9.666l3.576 4.83 3.596-4.81a1.435 1.435 0 011.788-.668L21.708 7.9l-2.522 3.283a.666.666 0 000 .994l4.804 6.412zM.002 11.576l.42-2.075c1.154-4.103 5.858-5.81 9.094-3.27 1.895 1.489 2.368 3.597 2.275 5.973H1.116C.943 16.447 4.005 19.009 7.92 17.7a4.078 4.078 0 002.582-2.876c.207-.666.548-.78 1.174-.588a5.417 5.417 0 01-2.589 3.957 6.272 6.272 0 01-7.306-.933 6.575 6.575 0 01-1.64-3.858c0-.235-.08-.455-.134-.666A88.33 88.33 0 010 11.577zm1.127-.286h9.654c-.06-3.076-2.001-5.258-4.59-5.278-2.882-.04-4.944 2.094-5.071 5.264z"/>
    </svg>
  ),
  supabase: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z"/>
    </svg>
  ),
  react: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z"/>
    </svg>
  ),
  vite: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.056 23.238a.57.57 0 0 1-1.02-.355v-5.202c0-.63-.512-1.143-1.144-1.143H5.148a.57.57 0 0 1-.464-.903l3.777-5.29c.54-.753 0-1.804-.93-1.804H.57a.574.574 0 0 1-.543-.746.6.6 0 0 1 .08-.157L5.008.78a.57.57 0 0 1 .467-.24h14.589a.57.57 0 0 1 .466.903l-3.778 5.29c-.54.755 0 1.806.93 1.806h5.745c.238 0 .424.138.513.322a.56.56 0 0 1-.063.603z"/>
    </svg>
  ),
  chakraui: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.678 1.583a3.492 3.492 0 0 0-3.03 1.76L.265 10.997a2.035 2.035 0 0 0-.064 1.886l4.486 7.784a3.493 3.493 0 0 0 3.03 1.751l8.602-.01a3.495 3.495 0 0 0 3.026-1.759l4.39-7.655a2.025 2.025 0 0 0-.002-2.008L19.339 3.34a3.494 3.494 0 0 0-3.028-1.756Zm4.365 1.244V9.11c0 .32.226.595.54.656l6.089 1.187c-2.005 3.466-4.006 6.934-6.008 10.4-.17.296-.62.176-.62-.166v-6.286a.667.667 0 0 0-.538-.656l-6.072-1.193 5.988-10.393c.168-.29.621-.178.621.168z"/>
    </svg>
  ),
};

function Resume({ data }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const [expandedCards, setExpandedCards] = useState({});
  const [hoveredCardId, setHoveredCardId] = useState(null);

  // Media library — fetched fresh each time a card is opened (no caching so admin changes appear immediately)
  const [mediaByJob,  setMediaByJob]  = useState({});       // { jobId: asset[] }
  const [fetchingJobs, setFetchingJobs] = useState(new Set()); // prevent duplicate in-flight requests
  const [lbAsset, setLbAsset] = useState(null);  // asset object currently shown in lightbox
  const [lbJobAssets, setLbJobAssets] = useState([]); // all assets for this job (for prev/next)

  const loadMediaForJob = useCallback(async (jobId) => {
    if (fetchingJobs.has(jobId)) return;                     // already in-flight, skip
    setFetchingJobs(prev => new Set([...prev, jobId]));
    try {
      const res = await fetch(`/api/media?job_id=${jobId}`);
      if (res.ok) {
        const assets = await res.json();
        // Preload native dimensions for images so masonry layout uses real ratios
        const enriched = await Promise.all(assets.map(a => {
          if (a.file_type !== 'image') return Promise.resolve(a);
          return new Promise(resolve => {
            const img = new window.Image();
            img.onload  = () => resolve({ ...a, _w: img.naturalWidth,  _h: img.naturalHeight });
            img.onerror = () => resolve({ ...a, _w: 800, _h: 600 });
            img.src = a.public_url;
          });
        }));
        setMediaByJob(prev => ({ ...prev, [jobId]: enriched }));
      }
    } catch { /* silent — gallery just won't appear */ }
    finally {
      setFetchingJobs(prev => { const n = new Set(prev); n.delete(jobId); return n; });
    }
  }, [fetchingJobs]);

  const [lightboxImg, setLightboxImg] = useState({ src: '', alt: '', title: '', desc: '', tags: [] });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Scroll past the title elements threshold (approx 220px)
      if (window.scrollY > 220) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toggleCard = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
    loadMediaForJob(id);
  };

  const openLightbox = (imgData) => {
    setLightboxImg(imgData);
    onOpen();
  };

  // Color mappings
  const navBg = useColorModeValue('rgba(255, 255, 255, 0.75)', 'rgba(20, 22, 32, 0.75)');
  const borderLight = useColorModeValue('oklch(90% 0.01 240)', 'oklch(28% 0.015 240 / 0.7)');
  const textColorMuted = useColorModeValue('oklch(50% 0.01 240)', 'oklch(65% 0.01 240)');
  const brandPrimary = useColorModeValue('oklch(55% 0.16 260)', 'oklch(75% 0.15 200)');
  const brandSecondary = useColorModeValue('oklch(50% 0.18 200)', 'oklch(65% 0.20 280)');
  const blueColor = useColorModeValue('blue.600', 'blue.300');
  const purpleColor = useColorModeValue('purple.600', 'purple.300');
  const cardBg = useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)');

  // Helper functions for career color coding
  const getTimelineTheme = (itemId) => {
    const laborIds = ['seiu-1021', 'teamsters-harris', 'teamsters-853', 'north-coast-trust', 'teamsters-665', 'teamsters-624'];
    if (laborIds.includes(itemId)) {
      return {
        color: blueColor,
        scheme: 'blue',
        label: 'Labor & Campaigns'
      };
    }
    return {
      color: purpleColor,
      scheme: 'purple',
      label: 'Digital & Comms'
    };
  };


  return (
    <Box minH="100vh" pb="2rem">

      {/* ── Media Lightbox Modal ── */}
      {lbAsset && (
        <Modal isOpen={!!lbAsset} onClose={() => setLbAsset(null)} size="4xl" isCentered>
          <ModalOverlay bg="blackAlpha.900" backdropFilter="blur(8px)" />
          <ModalContent bg="oklch(14% 0.015 240)" border="1px solid" borderColor={borderLight} borderRadius="2xl" overflow="hidden" mx="1rem">
            <ModalCloseButton color="white" zIndex="10" />
            {/* Prev / Next arrows */}
            {lbJobAssets.length > 1 && (() => {
              const idx = lbJobAssets.findIndex(a => a.id === lbAsset.id);
              return (
                <>
                  {idx > 0 && (
                    <Button position="absolute" left="0.5rem" top="50%" transform="translateY(-50%)"
                      zIndex="10" variant="ghost" color="white" fontSize="1.5rem" size="lg" borderRadius="full"
                      _hover={{ bg: 'whiteAlpha.200' }}
                      onClick={() => setLbAsset(lbJobAssets[idx - 1])}>‹</Button>
                  )}
                  {idx < lbJobAssets.length - 1 && (
                    <Button position="absolute" right="0.5rem" top="50%" transform="translateY(-50%)"
                      zIndex="10" variant="ghost" color="white" fontSize="1.5rem" size="lg" borderRadius="full"
                      _hover={{ bg: 'whiteAlpha.200' }}
                      onClick={() => setLbAsset(lbJobAssets[idx + 1])}>›</Button>
                  )}
                </>
              );
            })()}
            <ModalBody p="0">
              <Image
                src={lbAsset.public_url}
                alt={lbAsset.caption || lbAsset.filename}
                maxH="70vh" w="100%" objectFit="contain"
                bg="black"
              />
              {(lbAsset.caption || (lbAsset.keywords && lbAsset.keywords.length > 0)) && (
                <Box px="1.5rem" py="1.25rem">
                  {lbAsset.caption && (
                    <Text fontWeight="700" fontSize="0.95rem" color="white" mb="0.6rem">
                      {lbAsset.caption}
                    </Text>
                  )}
                  {lbAsset.keywords && lbAsset.keywords.length > 0 && (
                    <Flex flexWrap="wrap" gap="0.4rem">
                      {lbAsset.keywords.map(kw => (
                        <Tag key={kw} size="sm" colorScheme="blue" variant="subtle"
                          fontSize="0.72rem" fontWeight="600" borderRadius="full">
                          #{kw}
                        </Tag>
                      ))}
                    </Flex>
                  )}
                  {lbJobAssets.length > 1 && (
                    <Text fontSize="0.7rem" color="gray.500" mt="0.75rem">
                      {lbJobAssets.findIndex(a => a.id === lbAsset.id) + 1} / {lbJobAssets.length}
                    </Text>
                  )}
                </Box>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
      <Box
        as="nav"
        position="fixed"
        top="0"
        left="0"
        right="0"
        zIndex="100"
        bg={navBg}
        backdropFilter="blur(12px)"
        borderBottom="1px solid"
        borderColor={borderLight}
        py="1rem"
        transform={scrolled ? 'translateY(0)' : 'translateY(-100%)'}
        opacity={scrolled ? 1 : 0}
        pointerEvents={scrolled ? 'auto' : 'none'}
        transition="transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease"
      >
        <Container maxW="container.lg" display="flex" justifyContent="space-between" alignItems="center">
          <Heading
            fontSize="1.3rem"
            fontWeight="800"
            letterSpacing="-0.02em"
            bgGradient={`linear(to-r, ${brandPrimary}, ${brandSecondary})`}
            bgClip="text"
            cursor="pointer"
            onClick={() => window.scrollTo(0, 0)}
          >
            PHIL YBARROLAZA
          </Heading>

          <HStack spacing="1.5rem" display={{ base: 'none', md: 'flex' }}>
            <Link href="#timeline" fontSize="0.9rem" fontWeight="600" opacity="0.8" _hover={{ opacity: 1 }}>Timeline</Link>
            <Link href="#skills" fontSize="0.9rem" fontWeight="600" opacity="0.8" _hover={{ opacity: 1 }}>Skills & Edu</Link>
            <Link href="#portfolio" fontSize="0.9rem" fontWeight="600" opacity="0.8" _hover={{ opacity: 1 }}>Portfolio</Link>
            <HStack spacing="0.75rem">
              {data.socials?.primary?.linkedin && (
                <IconButton
                  as="a"
                  href={data.socials.primary.linkedin}
                  target="_blank"
                  rel="noopener"
                  aria-label="LinkedIn"
                  icon={<FaLinkedin />}
                  size="sm"
                  variant="ghost"
                />
              )}
              {data.socials?.primary?.instagram && (
                <IconButton
                  as="a"
                  href={data.socials.primary.instagram}
                  target="_blank"
                  rel="noopener"
                  aria-label="Instagram"
                  icon={<FaInstagram />}
                  size="sm"
                  variant="ghost"
                />
              )}
              {data.socials?.primary?.youtube && (
                <IconButton
                  as="a"
                  href={data.socials.primary.youtube}
                  target="_blank"
                  rel="noopener"
                  aria-label="YouTube"
                  icon={<FaYoutube />}
                  size="sm"
                  variant="ghost"
                />
              )}
              {data.socials?.primary?.x && (
                <IconButton
                  as="a"
                  href={data.socials.primary.x}
                  target="_blank"
                  rel="noopener"
                  aria-label="X"
                  icon={<FaXTwitter />}
                  size="sm"
                  variant="ghost"
                />
              )}
            </HStack>
          </HStack>

          <HStack spacing="1rem">
            <IconButton
              aria-label="Toggle Color Mode"
              icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              size="sm"
            />
          </HStack>
        </Container>
      </Box>

      {/* Main Container */}
      <Container maxW="container.md" pt="2rem">
        {/* Inline Top Header (scrolls away naturally) */}
        <Box mb="3rem" pb="1.5rem" borderBottom="2px solid" borderColor={borderLight}>
          {/* Row 1: Social links (LinkedIn first), dashboard view, and theme buttons */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            w="100%"
            mb="2rem"
            pb="0.75rem"
            borderBottom="1px solid"
            borderColor={borderLight}
          >
            <HStack spacing="0.5rem">
              {data.socials?.primary?.linkedin && (
                <IconButton
                  as="a"
                  href={data.socials.primary.linkedin}
                  target="_blank"
                  rel="noopener"
                  aria-label="LinkedIn"
                  icon={<FaLinkedin />}
                  size="sm"
                  variant="ghost"
                />
              )}
              {data.socials?.primary?.instagram && (
                <IconButton
                  as="a"
                  href={data.socials.primary.instagram}
                  target="_blank"
                  rel="noopener"
                  aria-label="Instagram"
                  icon={<FaInstagram />}
                  size="sm"
                  variant="ghost"
                />
              )}
              {data.socials?.primary?.youtube && (
                <IconButton
                  as="a"
                  href={data.socials.primary.youtube}
                  target="_blank"
                  rel="noopener"
                  aria-label="YouTube"
                  icon={<FaYoutube />}
                  size="sm"
                  variant="ghost"
                />
              )}
              {data.socials?.primary?.x && (
                <IconButton
                  as="a"
                  href={data.socials.primary.x}
                  target="_blank"
                  rel="noopener"
                  aria-label="X"
                  icon={<FaXTwitter />}
                  size="sm"
                  variant="ghost"
                />
              )}
            </HStack>

            <HStack spacing="0.5rem">
              <IconButton
                aria-label="Toggle Color Mode"
                icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                size="sm"
              />
            </HStack>
          </Box>

          {/* Grid row for Profile Image + Name / Contact info details */}
          <Box
            display="flex"
            flexDirection={{ base: 'column-reverse', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ base: 'center', md: 'center' }}
            gap="2rem"
            w="100%"
          >
            <VStack align={{ base: 'center', md: 'start' }} spacing="0.75rem" textAlign={{ base: 'center', md: 'left' }}>
              {/* Row 2: Name */}
              <Heading
                as="h1"
                fontSize={{ base: '2.4rem', md: '3.5rem' }}
                fontWeight="800"
                letterSpacing="-0.03em"
                color={useColorModeValue('oklch(15% 0 0)', 'white')}
                lineHeight="1"
              >
                PHIL YBARROLAZA
              </Heading>

              {/* Row 3: City, phone number, and email address */}
              <Text
                fontSize={{ base: '0.82rem', md: '0.92rem' }}
                fontWeight="600"
                color={textColorMuted}
                display="flex"
                flexWrap="wrap"
                gap={{ base: '0.3rem 0.6rem', md: '0.5rem 0.8rem' }}
                alignItems="center"
                justifyContent={{ base: 'center', md: 'flex-start' }}
              >
                <Box as="span">Petaluma, California</Box>
                <Box as="span" color={borderLight}>|</Box>
                <Link href="tel:+17072925778" _hover={{ color: brandPrimary }}>(707) 292-5778</Link>
                <Box as="span" color={borderLight}>|</Box>
                <Link href="mailto:phil@redwoodempiremedia.com" _hover={{ color: brandPrimary }}>phil@redwoodempiremedia.com</Link>
              </Text>
            </VStack>

            {/* Profile Image */}
            <Box flexShrink="0">
              <Image
                src="/assets/profile.jpg"
                alt="Phil Ybarrolaza"
                borderRadius="full"
                boxSize={{ base: '100px', md: '120px' }}
                objectFit="cover"
                border="3px solid"
                borderColor={brandPrimary}
                shadow="md"
              />
            </Box>
          </Box>
        </Box>

        {/* Career Scope Animated Stat Bar */}
        <CareerScopeBar
          borderLight={borderLight}
          blueColor={blueColor}
          purpleColor={purpleColor}
          employers={data.employers}
          competencies={data.competencies}
        />

        {/* Warning Badge if using fallbacks */}
        {data.usingFallbacks && (
          <Box
            bg="orange.500"
            color="white"
            px="1rem"
            py="0.5rem"
            borderRadius="md"
            mb="2rem"
            fontSize="0.85rem"
            fontWeight="bold"
            textAlign="center"
          >
            ⚠️ Running in Local Fallback Mode (Supabase database unconfigured or offline).
          </Box>
        )}

        {/* 2. Hero / Profile Section (Traditional Professional Summary) */}
        <VStack align="start" spacing="1.2rem" mb="4rem">
          <Heading
            as="h2"
            fontSize="1.2rem"
            fontWeight="800"
            textTransform="uppercase"
            letterSpacing="0.08em"
            color={brandPrimary}
          >
            Professional Summary
          </Heading>
          <Text fontSize="1.05rem" fontWeight="600" lineHeight="1.5">
            Combines deep labor relations expertise with cutting-edge digital communication strategies to amplify voices, build coalitions, and advance economic and social justice.
          </Text>
          <Text fontSize="1rem" color={textColorMuted} lineHeight="1.65">
            Field representative, former union local president, and digital media producer with 20+ years of experience directing high-impact contract campaigns, building nationwide labor coalitions, and producing viral video/audio podcasts.
          </Text>
        </VStack>

        <Divider borderColor={borderLight} my="3rem" />

        {/* 3. Timeline Section */}
        <Box id="timeline" mb="5rem">
          <Heading as="h2" fontSize="1.5rem" fontWeight="800" mb="2rem" letterSpacing="-0.01em">
            Career Timeline
          </Heading>
          <Box position="relative">
            {/* Full-height solid timeline line */}
            <Box
              position="absolute"
              left="1.18rem"
              top="0"
              bottom="0"
              w="2px"
              bg={borderLight}
              zIndex={0}
            />
            {data.timeline.map((item, idx) => {
              const isExpanded = expandedCards[item.id] || false;
              const theme = getTimelineTheme(item.id);
              const employers = Array.isArray(item.employer_list) ? item.employer_list : [];
              const skills   = Array.isArray(item.job_skills)    ? item.job_skills    : [];
              return (
                <Box
                  key={item.id}
                  display="flex"
                  gap="0"
                  mb={idx === data.timeline.length - 1 ? '0' : '1.5rem'}
                  onMouseEnter={() => setHoveredCardId(item.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                >

                  {/* Left: timeline rail — dot with ping + tooltip */}
                  <Box display="flex" flexDir="column" alignItems="center" flexShrink={0} w="2.5rem" mr="1rem">
                    <style>{`
                      @keyframes dotPing {
                        0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.75; }
                        100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0; }
                      }
                    `}</style>
                    <TimelineDot
                      color={theme.color}
                      cardBg={cardBg}
                      dateRange={item.date_range}
                      isActive={hoveredCardId === item.id}
                    />
                  </Box>

                  {/* Right: card */}
                  <Box
                    flex="1"
                    minW="0"
                    border="1px solid"
                    borderColor={borderLight}
                    borderRadius="xl"
                    bg={cardBg}
                    overflow="hidden"
                    transition="all 0.25s ease"
                    _hover={{
                      borderColor: theme.color + '88',
                      boxShadow: `0 0 0 1px ${theme.color}44, 0 0 24px ${theme.color}22, 0 4px 20px rgba(0,0,0,0.25)`,
                    }}
                  >
                    {/* Clickable header — stacks vertically on mobile, row on md+ */}
                    <Flex
                      direction={['column', 'column', 'row']}
                      justify="space-between"
                      align={['stretch', 'stretch', 'start']}
                      gap={['0.75rem', '0.75rem', '0']}
                      p="1.5rem"
                      cursor="pointer"
                      onClick={() => toggleCard(item.id)}
                      userSelect="none"
                    >
                      <VStack align="start" spacing="0.2rem" flex="1" minW="0">
                        <Heading as="h3" fontSize="1.1rem" fontWeight="700">
                          {item.role}
                        </Heading>
                        <Text fontSize="0.9rem" fontWeight="600" color={theme.color} noOfLines={2}>
                          {item.company} {item.location && `• ${item.location}`}
                        </Text>
                        <Text fontSize="0.8rem" color={textColorMuted} fontWeight="500">
                          {item.date_range}
                        </Text>
                      </VStack>
                      <HStack spacing="0.5rem" align="center" flexShrink={0} flexWrap="wrap">
                        {skills.length > 0 && (
                          <Tag size="sm" variant="subtle" colorScheme={theme.scheme} fontSize="0.72rem" fontWeight="600">
                            Core Skills
                          </Tag>
                        )}
                        <Tag size="sm" variant="subtle" colorScheme={theme.scheme} fontSize="0.75rem" fontWeight="700">
                          {theme.label}
                        </Tag>
                        <Box
                          as="span"
                          color={textColorMuted}
                          fontSize="1rem"
                          lineHeight="1"
                          transition="transform 0.2s"
                          transform={isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}
                        >
                          ▾
                        </Box>
                      </HStack>
                    </Flex>

                    <Collapse in={isExpanded} animateOpacity>
                      <VStack align="start" spacing="1.2rem" px="1.5rem" pb="1.5rem" pt="0">

                        {/* Key Competencies — keyword pills */}
                        {skills.length > 0 ? (
                          <Box w="100%">
                            <Text fontSize="0.72rem" fontWeight="700" textTransform="uppercase" letterSpacing="0.06em" mb="0.65rem" color={textColorMuted}>
                              Key Competencies
                            </Text>
                            <Flex flexWrap="wrap" gap="0.45rem">
                              {skills.map((sk, idx) => (
                                <Tag
                                  key={idx}
                                  size="sm"
                                  variant="solid"
                                  colorScheme={theme.scheme}
                                  fontSize="0.78rem"
                                  fontWeight="600"
                                  px="0.75rem"
                                  py="0.35rem"
                                  borderRadius="full"
                                >
                                  {sk.name}
                                </Tag>
                              ))}
                            </Flex>
                          </Box>
                        ) : (
                          <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                            {item.bullets.map((bullet, idx) => (
                              <li key={idx} style={{ marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.95 }}>
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Represented Employers — keyword pills */}
                        {employers.length > 0 && (
                          <Box w="100%">
                            <Text fontSize="0.72rem" fontWeight="700" textTransform="uppercase" letterSpacing="0.06em" mb="0.65rem" color={textColorMuted}>
                              Represented Employers
                            </Text>
                            <Flex flexWrap="wrap" gap="0.45rem">
                              {employers.map((emp, idx) => (
                                <Tag
                                  key={idx}
                                  size="sm"
                                  variant="solid"
                                  colorScheme="gray"
                                  fontSize="0.78rem"
                                  fontWeight="500"
                                  px="0.75rem"
                                  py="0.35rem"
                                  borderRadius="full"
                                >
                                  {emp}
                                </Tag>
                              ))}
                            </Flex>
                          </Box>
                        )}

                        {/* Media Gallery — sourced from media library */}
                        {(() => {
                          const jobMedia = (mediaByJob[item.id] || []).filter(a => a.file_type === 'image');
                          if (jobMedia.length === 0) return null;
                          const photos = jobMedia.map(a => ({
                            src: a.public_url,
                            width:  a._w || 800,
                            height: a._h || 600,
                            key: a.id,
                          }));
                          return (
                            <Box w="100%" mt="0.5rem">
                              <Text fontSize="0.72rem" fontWeight="700" textTransform="uppercase"
                                letterSpacing="0.06em" mb="0.65rem" color={textColorMuted}>
                                Media Gallery ({jobMedia.length})
                              </Text>
                              {/* CSS applied via class — no renderPhoto API needed */}
                              <style>{`
                                .resume-gallery img {
                                  border-radius: 8px !important;
                                  cursor: pointer !important;
                                  transition: transform 0.18s ease, box-shadow 0.18s ease !important;
                                  display: block;
                                }
                                .resume-gallery img:hover {
                                  transform: scale(1.025) !important;
                                  box-shadow: 0 4px 18px rgba(0,0,0,0.45) !important;
                                }
                              `}</style>
                              <Suspense fallback={<Box h="80px" />}>
                                <div className="resume-gallery">
                                  <PhotoAlbum
                                    layout="masonry"
                                    photos={photos}
                                    columns={cw => cw < 300 ? 2 : cw < 550 ? 3 : 4}
                                    spacing={5}
                                    onClick={({ index }) => {
                                      setLbAsset(jobMedia[index]);
                                      setLbJobAssets(jobMedia);
                                    }}
                                  />
                                </div>
                              </Suspense>
                            </Box>
                          );
                        })()}
                        {/* PDF tiles */}
                        {(mediaByJob[item.id] || []).filter(a => a.file_type === 'pdf').length > 0 && (
                          <Box w="100%" mt="0.5rem">
                            <Flex flexWrap="wrap" gap="0.5rem">
                              {(mediaByJob[item.id] || []).filter(a => a.file_type === 'pdf').map(a => (
                                <Tag key={a.id} as="a" href={a.public_url} target="_blank"
                                  size="sm" colorScheme="red" variant="outline" cursor="pointer">
                                  📄 {a.caption || a.filename}
                                </Tag>
                              ))}
                            </Flex>
                          </Box>
                        )}
                      </VStack>
                    </Collapse>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>



        {/* 4. Skills & Core Competencies — Full Redesign */}
        <SkillsSection
          skills={data.skills}
          competencies={data.competencies}
          timeline={data.timeline}
          borderLight={borderLight}
          cardBg={cardBg}
          textColorMuted={textColorMuted}
          brandPrimary={brandPrimary}
          brandSecondary={brandSecondary}
          blueColor={blueColor}
          purpleColor={purpleColor}
          colorMode={colorMode}
        />

        <Divider borderColor={borderLight} my="3rem" />

        {/* 4b. Education Section */}
        <Box id="education" mb="4rem">
          <Heading as="h2" fontSize="1.5rem" fontWeight="800" mb="1.5rem" letterSpacing="-0.01em">
            Education
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="1.5rem">
            {data.education.map((edu) => (
              <Box
                key={edu.id}
                border="1px solid"
                borderColor={borderLight}
                borderRadius="xl"
                p="1.2rem"
                bg={cardBg}
              >
                <Heading as="h4" fontSize="0.95rem" fontWeight="700" mb="0.2rem">
                  {edu.institution}
                </Heading>
                <Text fontSize="0.85rem" color={textColorMuted}>
                  {edu.details}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        <Divider borderColor={borderLight} my="4rem" />

        {/* 6b. Employer Geography Section */}
        <EmployerGeography
          employers={data.employers}
          borderLight={borderLight}
          blueColor={blueColor}
          cardBg={cardBg}
          textColorMuted={textColorMuted}
          brandPrimary={brandPrimary}
        />

        <Divider borderColor={borderLight} my="4rem" />

        {/* 7. Footer & Tech Stack badges */}
        <VStack spacing="2rem" as="footer" textAlign="center" pt="2rem">
          <VStack spacing="0.75rem">
            <Text
              fontSize="0.75rem"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.12em"
              color={textColorMuted}
            >
              Built with the stack
            </Text>
            <HStack spacing="0.75rem" wrap="wrap" justify="center">
              <Link
                href="https://nodejs.org/"
                target="_blank"
                rel="noopener"
                display="flex"
                alignItems="center"
                gap="0.5rem"
                px="0.88rem"
                py="0.5rem"
                bg={useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)')}
                border="1px solid"
                borderColor={borderLight}
                borderRadius="50px"
                fontSize="0.82rem"
                fontWeight="500"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  color: 'oklch(65% 0.15 140)',
                  borderColor: 'oklch(65% 0.15 140)',
                  boxShadow: '0 4px 12px oklch(65% 0.15 140 / 0.2)'
                }}
              >
                {techIcons.node}
                <Text>Node.js</Text>
              </Link>
              <Link
                href="https://expressjs.com/"
                target="_blank"
                rel="noopener"
                display="flex"
                alignItems="center"
                gap="0.5rem"
                px="0.88rem"
                py="0.5rem"
                bg={useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)')}
                border="1px solid"
                borderColor={borderLight}
                borderRadius="50px"
                fontSize="0.82rem"
                fontWeight="500"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  color: useColorModeValue('black', 'white'),
                  borderColor: useColorModeValue('black', 'white'),
                  boxShadow: '0 4px 12px rgba(255,255,255,0.1)'
                }}
              >
                {techIcons.express}
                <Text>Express</Text>
              </Link>
              <Link
                href="https://supabase.com/"
                target="_blank"
                rel="noopener"
                display="flex"
                alignItems="center"
                gap="0.5rem"
                px="0.88rem"
                py="0.5rem"
                bg={useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)')}
                border="1px solid"
                borderColor={borderLight}
                borderRadius="50px"
                fontSize="0.82rem"
                fontWeight="500"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  color: 'oklch(72% 0.18 150)',
                  borderColor: 'oklch(72% 0.18 150)',
                  boxShadow: '0 4px 12px oklch(72% 0.18 150 / 0.2)'
                }}
              >
                {techIcons.supabase}
                <Text>Supabase</Text>
              </Link>
              <Link
                href="https://react.dev/"
                target="_blank"
                rel="noopener"
                display="flex"
                alignItems="center"
                gap="0.5rem"
                px="0.88rem"
                py="0.5rem"
                bg={useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)')}
                border="1px solid"
                borderColor={borderLight}
                borderRadius="50px"
                fontSize="0.82rem"
                fontWeight="500"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  color: 'oklch(75% 0.15 200)',
                  borderColor: 'oklch(75% 0.15 200)',
                  boxShadow: '0 4px 12px oklch(75% 0.15 200 / 0.2)'
                }}
              >
                {techIcons.react}
                <Text>React</Text>
              </Link>
              <Link
                href="https://vite.dev/"
                target="_blank"
                rel="noopener"
                display="flex"
                alignItems="center"
                gap="0.5rem"
                px="0.88rem"
                py="0.5rem"
                bg={useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)')}
                border="1px solid"
                borderColor={borderLight}
                borderRadius="50px"
                fontSize="0.82rem"
                fontWeight="500"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  color: 'oklch(65% 0.20 280)',
                  borderColor: 'oklch(65% 0.20 280)',
                  boxShadow: '0 4px 12px oklch(65% 0.20 280 / 0.2)'
                }}
              >
                {techIcons.vite}
                <Text>Vite</Text>
              </Link>
              <Link
                href="https://v2.chakra-ui.com/"
                target="_blank"
                rel="noopener"
                display="flex"
                alignItems="center"
                gap="0.5rem"
                px="0.88rem"
                py="0.5rem"
                bg={useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)')}
                border="1px solid"
                borderColor={borderLight}
                borderRadius="50px"
                fontSize="0.82rem"
                fontWeight="500"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  color: 'oklch(68% 0.17 185)',
                  borderColor: 'oklch(68% 0.17 185)',
                  boxShadow: '0 4px 12px oklch(68% 0.17 185 / 0.2)'
                }}
              >
                {techIcons.chakraui}
                <Text>Chakra UI</Text>
              </Link>
            </HStack>
          </VStack>

          <VStack spacing="0.4rem" fontSize="0.85rem" color={textColorMuted}>
            <Text>&copy; 2026 Phil Ybarrolaza. Built as an interactive index for media & past experiences.</Text>
            <Text fontWeight="600" color={brandPrimary}>
              Served via <Link href="https://getphily.io" isExternal>getphily.io</Link>
            </Text>
          </VStack>
        </VStack>
      </Container>

      {/* Lightbox Modal Component */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent border="1px solid" borderColor={borderLight} borderRadius="xl" overflow="hidden">
          <ModalHeader py="0.75rem" fontSize="1.1rem" fontWeight="700">
            {lightboxImg.title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p="0" bg="black">
            <Image
              src={lightboxImg.src}
              alt={lightboxImg.alt}
              maxH="550px"
              w="100%"
              objectFit="contain"
              mx="auto"
            />
          </ModalBody>
          <Box p="1.5rem" bg={useColorModeValue('white', 'rgba(25, 27, 38, 0.95)')}>
            <Text fontSize="0.9rem" fontWeight="500" mb="1rem">
              {lightboxImg.desc}
            </Text>
            <HStack spacing="0.5rem">
              {lightboxImg.tags.map((tag) => (
                <Tag key={tag} size="sm" colorScheme="teal" variant="outline">
                  {tag}
                </Tag>
              ))}
            </HStack>
          </Box>
        </ModalContent>
      </Modal>
    </Box>
  );
}

// ─── Skills & Core Competencies — Full Redesign ────────────────────────────
const SKILL_TABS = [
  { label: 'Labor Relations', scheme: 'blue', emoji: '🔵' },
  { label: 'Digital Media & Communications', scheme: 'purple', emoji: '🟣' },
];

const LABOR_GROUPS = ['strategic_core', 'core_professional', 'skills_list'];

// ─── Timeline Dot with ping + duration tooltip ───────────────────────────────
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function parseDateRange(dateRange) {
  if (!dateRange) return null;
  const parts = dateRange.trim().split(/\s*[-–]\s*/);
  if (parts.length < 2) return null;
  const parseMMYYYY = (s) => {
    const clean = s.trim();
    if (/present/i.test(clean)) return new Date();
    const [mm, yyyy] = clean.split('/');
    if (!mm || !yyyy) return null;
    return new Date(parseInt(yyyy), parseInt(mm) - 1);
  };
  const start = parseMMYYYY(parts[0]);
  const end   = parseMMYYYY(parts[1]);
  if (!start || !end) return null;
  const totalMonths = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30.44)));
  const years  = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts2 = [];
  if (years > 0)  parts2.push(`${years} yr${years  !== 1 ? 's' : ''}`);
  if (months > 0) parts2.push(`${months} mo${months !== 1 ? 's' : ''}`);
  const fmt = (d) => d ? `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}` : '';
  const isPresent = /present/i.test(parts[1].trim());
  return {
    label:  `${fmt(start)} – ${isPresent ? 'Present' : fmt(end)}`,
    duration: parts2.join(' ') || '< 1 mo',
    totalMonths,
  };
}

function TimelineDot({ color, cardBg, dateRange, isActive = false }) {
  const [dotHovered, setDotHovered] = useState(false);
  const pinging = isActive || dotHovered;
  const info = useMemo(() => parseDateRange(dateRange), [dateRange]);
  return (
    <Box
      position="relative"
      w="13px" h="13px"
      mt="1.65rem"
      flexShrink={0}
      zIndex={2}
      onMouseEnter={() => setDotHovered(true)}
      onMouseLeave={() => setDotHovered(false)}
      cursor="crosshair"
    >
      {/* Ping rings */}
      {pinging && (
        <>
          <Box
            position="absolute"
            top="50%" left="50%"
            transform="translate(-50%, -50%)"
            w="13px" h="13px" borderRadius="full"
            border="2px solid"
            borderColor={color}
            style={{ animation: 'dotPing 1.1s ease-out infinite' }}
            pointerEvents="none"
          />
          <Box
            position="absolute"
            top="50%" left="50%"
            transform="translate(-50%, -50%)"
            w="13px" h="13px" borderRadius="full"
            border="2px solid"
            borderColor={color}
            style={{ animation: 'dotPing 1.1s ease-out 0.45s infinite' }}
            pointerEvents="none"
          />
        </>
      )}
      {/* Dot */}
      <Box
        w="13px" h="13px" borderRadius="full"
        bg={color}
        border="3px solid" borderColor={cardBg}
        boxShadow={`0 0 0 2px ${color}`}
        position="absolute" top="0" left="0"
        transition="transform 0.18s"
        transform={pinging ? 'scale(1.35)' : 'scale(1)'}
      />
      {/* Tooltip — only on direct dot hover */}
      {dotHovered && info && (
        <Box
          position="absolute"
          left="calc(100% + 14px)"
          top="50%"
          transform="translateY(-50%)"
          bg="gray.900"
          borderLeft="3px solid"
          borderLeftColor={color}
          borderRadius="md"
          px="0.75rem" py="0.5rem"
          zIndex={200}
          boxShadow="0 8px 32px rgba(0,0,0,0.5)"
          pointerEvents="none"
          whiteSpace="nowrap"
          _before={{
            content: '""',
            position: 'absolute',
            left: '-7px',
            top: '50%',
            transform: 'translateY(-50%)',
            w: 0, h: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: `6px solid`,
            borderRightColor: 'gray.900',
          }}
        >
          <Text fontSize="0.82rem" fontWeight="700" color="white" letterSpacing="0.02em">
            {info.totalMonths} month{info.totalMonths !== 1 ? 's' : ''}
          </Text>
        </Box>
      )}
    </Box>
  );
}

function SkillsSection({ skills, competencies, timeline = [], borderLight, cardBg, textColorMuted, brandPrimary, brandSecondary, blueColor, purpleColor }) {

  const [tabIdx, setTabIdx] = useState(0);
  const [viewMode, setViewMode] = useState('list');
  const { colorMode } = useColorMode();

  const groupedCompetencies = useMemo(() => {
    const out = {};
    (competencies || []).forEach(c => {
      if (!out[c.group_type]) out[c.group_type] = {};
      if (!out[c.group_type][c.category]) out[c.group_type][c.category] = [];
      out[c.group_type][c.category].push(c);
    });
    return out;
  }, [competencies]);

  // Merge all labor categories into one flat map
  const laborCategories = useMemo(() => {
    const merged = {};
    LABOR_GROUPS.forEach(grp => {
      Object.entries(groupedCompetencies[grp] || {}).forEach(([cat, items]) => {
        merged[cat] = items;
      });
    });
    return merged;
  }, [groupedCompetencies]);

  const digitalCategories = groupedCompetencies['technical_skills'] || {};

  const leadershipSkills = (skills || []).filter(s => s.category === 'leadership');
  const commsSkills = (skills || []).filter(s => s.category === 'comms');

  const laborCount = Object.values(laborCategories).reduce((n, items) => n + items.length, 0);
  const digitalCount = Object.values(digitalCategories).reduce((n, items) => n + items.length, 0);

  return (
    <Box id="skills" mb="4rem">
      <HStack justify="space-between" align="center" mb="1.5rem" wrap="wrap" gap="0.75rem">
        <Box>
          <Heading as="h2" fontSize="1.5rem" fontWeight="800" letterSpacing="-0.01em">
            Skills &amp; Core Competencies
          </Heading>
          <Text fontSize="0.8rem" color={textColorMuted} mt="0.15rem">
            {(competencies || []).length + (skills || []).length} total skills
          </Text>
        </Box>
        <HStack spacing="0.4rem">
          <Button size="sm" variant={viewMode === 'list' ? 'solid' : 'ghost'}
            colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
            onClick={() => setViewMode('list')} fontSize="0.78rem" fontWeight="700">
            📋 List
          </Button>
          <Button size="sm" variant={viewMode === 'map' ? 'solid' : 'ghost'}
            colorScheme={viewMode === 'map' ? 'purple' : 'gray'}
            onClick={() => setViewMode('map')} fontSize="0.78rem" fontWeight="700">
            🌐 Skill Map
          </Button>
          <Button size="sm" variant={viewMode === 'insights' ? 'solid' : 'ghost'}
            colorScheme={viewMode === 'insights' ? 'teal' : 'gray'}
            onClick={() => setViewMode('insights')} fontSize="0.78rem" fontWeight="700">
            📊 Skills Insights
          </Button>
        </HStack>
      </HStack>

      {viewMode === 'map' ? (
        <SkillOrbMap colorMode={colorMode} />
      ) : viewMode === 'insights' ? (
        <SkillsInsightsPanel
          colorMode={colorMode}
          borderLight={borderLight}
          cardBg={cardBg}
          textColorMuted={textColorMuted}
        />
      ) : (
        <Tabs index={tabIdx} onChange={setTabIdx} variant="soft-rounded" size="sm" isLazy>
          <TabList gap="0.5rem" mb="1.75rem">
          <Tab colorScheme="blue" fontWeight="700" fontSize="0.85rem">
            🔵 Labor Relations
            <Badge ml="0.5rem" colorScheme="blue" borderRadius="full" fontSize="0.65rem">{laborCount + leadershipSkills.length}</Badge>
          </Tab>
          <Tab colorScheme="purple" fontWeight="700" fontSize="0.85rem">
            🟣 Digital Media &amp; Communications
            <Badge ml="0.5rem" colorScheme="purple" borderRadius="full" fontSize="0.65rem">{digitalCount + commsSkills.length}</Badge>
          </Tab>
          </TabList>

        <TabPanels>
          {/* Tab 0: Labor Relations */}
          <TabPanel px="0" pt="0">
            {/* Quick-ref pills */}
            {leadershipSkills.length > 0 && (
              <Box mb="1.5rem">
                <Text fontSize="0.7rem" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" mb="0.6rem" color={blueColor}>
                  Core Skills
                </Text>
                <HStack spacing="0.4rem" wrap="wrap" rowGap="0.4rem">
                  {leadershipSkills.map(s => (
                    <Tag key={s.id} size="sm" variant="subtle" colorScheme="blue" fontSize="0.76rem">{s.name}</Tag>
                  ))}
                </HStack>
              </Box>
            )}
            <CompetencyGroup
              categories={laborCategories}
              scheme="blue"
              borderLight={borderLight}
              cardBg={cardBg}
              textColorMuted={textColorMuted}
            />
          </TabPanel>

          {/* Tab 1: Digital Media & Communications */}
          <TabPanel px="0" pt="0">
            {/* Quick-ref pills */}
            {commsSkills.length > 0 && (
              <Box mb="1.5rem">
                <Text fontSize="0.7rem" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" mb="0.6rem" color={purpleColor}>
                  Core Skills
                </Text>
                <HStack spacing="0.4rem" wrap="wrap" rowGap="0.4rem">
                  {commsSkills.map(s => (
                    <Tag key={s.id} size="sm" variant="subtle" colorScheme="purple" fontSize="0.76rem">{s.name}</Tag>
                  ))}
                </HStack>
              </Box>
            )}
            <CompetencyGroup
              categories={digitalCategories}
              scheme="purple"
              borderLight={borderLight}
              cardBg={cardBg}
              textColorMuted={textColorMuted}
            />
          </TabPanel>
        </TabPanels>
        </Tabs>
      )}

    </Box>
  );
}


function CompetencyGroup({ categories, scheme, accentColor, borderLight, cardBg, textColorMuted }) {
  const [expanded, setExpanded] = useState(null);
  const catEntries = Object.entries(categories);

  if (catEntries.length === 0) {
    return <Text color={textColorMuted} py="2rem" textAlign="center">No data available.</Text>;
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing="1.25rem">
      {catEntries.map(([category, items]) => (
        <Box
          key={category}
          border="1px solid"
          borderColor={borderLight}
          borderRadius="xl"
          overflow="hidden"
          bg={cardBg}
        >
          {/* Category Header */}
          <Box
            px="1.1rem"
            py="0.75rem"
            borderBottom="1px solid"
            borderColor={borderLight}
            bg={scheme === 'blue' ? 'blue.50' : 'purple.50'}
            _dark={{ bg: 'whiteAlpha.50' }}
          >
            <HStack justify="space-between">
              <Text fontSize="0.72rem" fontWeight="800" textTransform="uppercase" letterSpacing="0.06em">
                {category}
              </Text>
              <Badge colorScheme={scheme} borderRadius="full" fontSize="0.6rem" fontWeight="700">
                {items.length}
              </Badge>
            </HStack>
          </Box>

          {/* Skill Items */}
          <VStack align="stretch" spacing="0" divider={<Box borderTop="1px solid" borderColor={borderLight} />}>
            {items.map(item => (
              <Box key={item.name}>
                <HStack
                  px="1.1rem"
                  py="0.6rem"
                  cursor="pointer"
                  _hover={{ bg: 'blackAlpha.30' }}
                  justify="space-between"
                  onClick={() => setExpanded(e => e === item.name ? null : item.name)}
                >
                  <Text fontSize="0.82rem" fontWeight="600" lineHeight="1.3">{item.name}</Text>
                  <Text fontSize="0.65rem" opacity={0.45} flexShrink={0} ml="0.5rem">
                    {expanded === item.name ? '▴' : '▾'}
                  </Text>
                </HStack>
                <Collapse in={expanded === item.name} animateOpacity>
                  <Text px="1.1rem" pb="0.85rem" pt="0.1rem" fontSize="0.78rem" color={textColorMuted} lineHeight="1.6">
                    {item.description}
                  </Text>
                </Collapse>
              </Box>
            ))}
          </VStack>
        </Box>
      ))}
    </SimpleGrid>
  );
}

// ─── Career Scope Animated Stat Bar ────────────────────────────────────────

function CareerScopeBar({ borderLight, blueColor, purpleColor, employers, competencies }) {
  const ref       = useRef(null);
  const countRef  = useRef(null);
  const cycleRef  = useRef(null);
  const [statIdx,  setStatIdx]  = useState(0);
  const [visible,  setVisible]  = useState(true);
  const [counts,   setCounts]   = useState({});
  const [inView,   setInView]   = useState(false);
  const [progKey,  setProgKey]  = useState(0); // remount progress bar to restart animation

  const SETS = useMemo(() => [
    {
      label: 'Career Scope',
      items: [
        { key: 'employers',    target: employers?.length || 78, suffix: '',   label: 'Employer Accounts Represented', accent: blueColor },
        { key: 'years',        target: 20,                      suffix: '+',  label: 'Years Labor Leadership',        accent: blueColor },
        { key: 'competencies', target: competencies?.length || 60, suffix: '+', label: 'Core Competencies',          accent: purpleColor },
        { key: 'reach',        target: 1,                       suffix: 'M+', label: 'Coalition Reach',              accent: purpleColor },
      ],
    },
    {
      label: 'Impact',
      items: [
        { key: 'contracts', target: 40,  suffix: '+',  label: 'Union Contracts Negotiated',  accent: blueColor   },
        { key: 'members',   target: 12,  suffix: 'K+', label: 'Union Members Represented',   accent: blueColor   },
        { key: 'campaigns', target: 35,  suffix: '+',  label: 'Political Campaigns Supported', accent: purpleColor },
        { key: 'media',     target: 200, suffix: '+',  label: 'Press & Media Placements',    accent: purpleColor },
      ],
    },
  ], [blueColor, purpleColor, employers, competencies]);

  const animateTo = useCallback((items) => {
    if (countRef.current) clearInterval(countRef.current);
    const init = Object.fromEntries(items.map(s => [s.key, 0]));
    setCounts(init);
    const duration = 1800, steps = 60;
    let step = 0;
    countRef.current = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
      const next = Object.fromEntries(items.map(s => [s.key, Math.round(ease * s.target)]));
      setCounts(next);
      if (step >= steps) clearInterval(countRef.current);
    }, duration / steps);
  }, []);

  // IntersectionObserver — trigger on first scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, []);

  // Animate counters when set changes or comes into view
  useEffect(() => {
    if (!inView) return;
    animateTo(SETS[statIdx].items);
  }, [inView, statIdx, SETS, animateTo]);

  // 10-second auto-cycle
  useEffect(() => {
    if (!inView) return;
    cycleRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setStatIdx(i => (i + 1) % SETS.length);
        setProgKey(k => k + 1);
        setVisible(true);
      }, 420);
    }, 10000);
    return () => clearInterval(cycleRef.current);
  }, [inView, SETS.length]);

  function jumpTo(i) {
    if (i === statIdx) return;
    setVisible(false);
    clearInterval(cycleRef.current);
    setTimeout(() => {
      setStatIdx(i);
      setProgKey(k => k + 1);
      setVisible(true);
      // Restart cycle
      cycleRef.current = setInterval(() => {
        setVisible(false);
        setTimeout(() => {
          setStatIdx(prev => (prev + 1) % SETS.length);
          setProgKey(k => k + 1);
          setVisible(true);
        }, 420);
      }, 10000);
    }, 420);
  }

  const currentSet = SETS[statIdx];

  return (
    <>
      <style>{`
        @keyframes statsProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
      <Box
        ref={ref}
        my="3rem"
        borderRadius="2xl"
        border="1px solid"
        borderColor={borderLight}
        backdropFilter="blur(8px)"
        overflow="hidden"
        bg="linear-gradient(135deg, oklch(18% 0.025 240 / 0.06) 0%, oklch(18% 0.02 280 / 0.06) 100%)"
      >
        {/* Stat grid */}
        <Box style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <SimpleGrid columns={{ base: 2, md: 4 }} divider={<Divider orientation="vertical" borderColor={borderLight} />}>
            {currentSet.items.map((stat, i) => (
              <VStack
                key={stat.key}
                py="1.5rem"
                px="1rem"
                spacing="0.25rem"
                align="center"
                borderRight={i < 3 ? '1px solid' : 'none'}
                borderColor={borderLight}
                borderBottom={{ base: i < 2 ? '1px solid' : 'none', md: 'none' }}
              >
                <Text
                  fontSize={{ base: '2rem', md: '2.5rem' }}
                  fontWeight="900"
                  letterSpacing="-0.04em"
                  color={stat.accent}
                  lineHeight="1"
                  fontVariantNumeric="tabular-nums"
                >
                  {counts[stat.key] ?? 0}{stat.suffix}
                </Text>
                <Text fontSize="0.72rem" fontWeight="600" textAlign="center" opacity={0.7}
                  textTransform="uppercase" letterSpacing="0.06em">
                  {stat.label}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Box>

        {/* Progress bar + set indicators */}
        <Box
          px="1.5rem" py="0.6rem"
          borderTop="1px solid" borderColor={borderLight}
          display="flex" alignItems="center" gap="0.75rem"
        >
          {/* Animated progress line */}
          <Box flex={1} h="2px" bg="rgba(255,255,255,0.06)" borderRadius="full" overflow="hidden">
            <Box
              key={progKey}
              h="100%"
              borderRadius="full"
              bg={statIdx === 0 ? blueColor : purpleColor}
              style={{ animation: 'statsProgress 10s linear forwards' }}
            />
          </Box>
          {/* Dot indicators */}
          <Flex gap="0.35rem" align="center">
            <Text fontSize="0.62rem" color="whiteAlpha.400" letterSpacing="0.06em" textTransform="uppercase" mr="0.2rem">
              {currentSet.label}
            </Text>
            {SETS.map((s, i) => (
              <Box
                key={i}
                as="button"
                w="7px" h="7px"
                borderRadius="full"
                bg={i === statIdx ? (i === 0 ? blueColor : purpleColor) : 'whiteAlpha.200'}
                transition="all 0.35s ease"
                transform={i === statIdx ? 'scale(1.35)' : 'scale(1)'}
                cursor="pointer"
                border="none"
                onClick={() => jumpTo(i)}
                aria-label={`Show ${s.label} stats`}
              />
            ))}
          </Flex>
        </Box>
      </Box>
    </>
  );
}

// ─── Employer Geography Section ──────────────────────────────────────────────
const GEO_GROUPS = [
  {
    region: 'Bay Area',
    match: (loc) => /Oakland|Berkeley|San Francisco|SF|Redwood|Hayward|Fremont|Alameda|San Leandro|South San Francisco|Brisbane|San Mateo|Burlingame|Colma|Daly City|Martinez|East Bay/i.test(loc),
  },
  {
    region: 'North Bay / Sonoma County',
    match: (loc) => /Sonoma|Petaluma|Santa Rosa|Rohnert Park|Cotati|Geyserville|Marin|Mill Valley|San Rafael|Corte Madera|North Bay|Ukiah|Lake County|Ukiah/i.test(loc),
  },
  {
    region: 'Los Angeles / Southern California',
    match: (loc) => /Los Angeles|LA|Manhattan Beach|Menlo Park/i.test(loc),
  },
  {
    region: 'Regional / Statewide',
    match: (loc) => /Regional|Northern California|California Region|National|Statewide/i.test(loc),
  },
];

function EmployerGeography({ employers, borderLight, blueColor, cardBg, textColorMuted, brandPrimary }) {
  const [open, setOpen] = useState(false);

  const grouped = GEO_GROUPS.map(g => ({
    ...g,
    employers: (employers || []).filter(e => g.match(e.location)),
  })).filter(g => g.employers.length > 0);

  return (
    <Box mb="4rem">
      <HStack justify="space-between" align="center" mb={open ? '1.5rem' : '0'} cursor="pointer" onClick={() => setOpen(o => !o)}>
        <VStack align="start" spacing="0.1rem">
          <Heading as="h2" fontSize="1.5rem" fontWeight="800" letterSpacing="-0.01em">
            Labor Footprint
          </Heading>
          <Text fontSize="0.85rem" color={textColorMuted}>
            {(employers || []).length} employer accounts across California — Click to expand
          </Text>
        </VStack>
        <Box
          w="2rem" h="2rem"
          display="flex" alignItems="center" justifyContent="center"
          borderRadius="full"
          border="1px solid"
          borderColor={borderLight}
          fontSize="1rem"
          transition="transform 0.3s"
          transform={open ? 'rotate(180deg)' : 'rotate(0deg)'}
        >
          ▾
        </Box>
      </HStack>

      <Collapse in={open} animateOpacity>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing="1.5rem">
          {grouped.map(g => (
            <Box
              key={g.region}
              border="1px solid"
              borderColor={borderLight}
              borderRadius="xl"
              p="1.25rem"
              bg={cardBg}
            >
              <Text
                fontSize="0.75rem"
                fontWeight="800"
                textTransform="uppercase"
                letterSpacing="0.08em"
                color={blueColor}
                mb="0.75rem"
              >
                {g.region}
              </Text>
              <HStack spacing="0.4rem" wrap="wrap" rowGap="0.4rem">
                {g.employers.map(e => (
                  <Tag key={e.id} size="sm" variant="subtle" colorScheme="blue" fontSize="0.72rem">
                    {e.name}
                  </Tag>
                ))}
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      </Collapse>
    </Box>
  );
}

// ─────────────────────────────────────────────
// Skills Insights Panel — curated importance rankings
// ─────────────────────────────────────────────

// Top 10 Labor Relations skills, ranked #1 (most important) → #10
const LABOR_TOP10 = [
  { skill: 'Collective Bargaining & Contract Architecture', score: 100 },
  { skill: 'NLRB Representation & Statutory Defense',       score: 94  },
  { skill: 'Strategic Field Organizing',                    score: 88  },
  { skill: 'Grievance Administration & Arbitration',        score: 83  },
  { skill: 'Unfair Labor Practice (ULP) Enforcement',       score: 79  },
  { skill: 'Economic Package Modeling',                     score: 75  },
  { skill: 'Worksite Mobilization & Unit Mapping',          score: 70  },
  { skill: 'Federal Mediation Pathways (FMCS)',             score: 66  },
  { skill: 'Taft-Hartley Trust Compliance',                 score: 62  },
  { skill: 'Internal Union Governance & Compliance',        score: 58  },
];

// Top 10 Digital & Communications skills, ranked #1 → #10
const DIGITAL_TOP10 = [
  { skill: 'Content Strategy & Editorial Planning', score: 100 },
  { skill: 'Video Production & Post-Production',    score: 94  },
  { skill: 'Podcast Production',                    score: 88  },
  { skill: 'Digital Campaign Management',           score: 83  },
  { skill: 'Social Media & Community Building',     score: 79  },
  { skill: 'Brand Identity & Visual Design',        score: 75  },
  { skill: 'Audio Engineering',                     score: 70  },
  { skill: 'Live Streaming & Broadcast',            score: 66  },
  { skill: 'SEO & Web Development',                 score: 62  },
  { skill: 'Graphic Design',                        score: 58  },
];

function makeBarOptions(skills, color, isDark) {
  const textColor = isDark ? '#cbd5e0' : '#2d3748';
  const gridColor = isDark ? '#2d3748' : '#e2e8f0';
  return {
    chart: { type: 'bar', background: 'transparent', toolbar: { show: false }, animations: { enabled: true, speed: 600 } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, distributed: false, barHeight: '60%' } },
    colors: [color],
    xaxis: {
      categories: skills.map(s => s.skill),
      min: 0, max: 100,
      labels: {
        show: false,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: skills.map(() => textColor), fontSize: '0.8rem', fontWeight: '500' },
        maxWidth: 260,
      },
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: { title: { formatter: () => 'Importance' }, formatter: val => `${val}/100` },
    },
    grid: { borderColor: gridColor, xaxis: { lines: { show: false } }, yaxis: { lines: { show: false } } },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: { fontSize: '0.75rem', fontWeight: '600', colors: [isDark ? '#e2e8f0' : '#1a202c'] },
      formatter: val => `${val}`,
      offsetX: 6,
    },
    legend: { show: false },
  };
}

function SkillsInsightsPanel({ colorMode, borderLight, cardBg, textColorMuted }) {
  const isDark = colorMode === 'dark';

  const laborOptions  = useMemo(() => makeBarOptions(LABOR_TOP10,   '#4299e1', isDark), [isDark]);
  const digitalOptions = useMemo(() => makeBarOptions(DIGITAL_TOP10, '#9f7aea', isDark), [isDark]);

  const laborSeries   = [{ name: 'Importance', data: LABOR_TOP10.map(s => s.score) }];
  const digitalSeries = [{ name: 'Importance', data: DIGITAL_TOP10.map(s => s.score) }];

  return (
    <Suspense fallback={<Box py="4rem" textAlign="center"><Text color={textColorMuted}>Loading charts…</Text></Box>}>
      <VStack align="stretch" spacing="3rem">

        {/* Chart 1 — Labor Relations */}
        <Box>
          <Text fontSize="0.72rem" fontWeight="700" textTransform="uppercase" letterSpacing="0.06em" mb="0.25rem" color={textColorMuted}>
            🔵 Labor Relations
          </Text>
          <Text fontSize="0.82rem" color={textColorMuted} mb="1.25rem">
            Top 10 skills ranked by strategic importance to employers in this field.
          </Text>
          <ReactApexChart
            type="bar"
            options={laborOptions}
            series={laborSeries}
            height={340}
          />
        </Box>

        {/* Chart 2 — Digital & Communications */}
        <Box>
          <Text fontSize="0.72rem" fontWeight="700" textTransform="uppercase" letterSpacing="0.06em" mb="0.25rem" color={textColorMuted}>
            🟣 Digital &amp; Communications
          </Text>
          <Text fontSize="0.82rem" color={textColorMuted} mb="1.25rem">
            Top 10 skills ranked by strategic importance to employers in this field.
          </Text>
          <ReactApexChart
            type="bar"
            options={digitalOptions}
            series={digitalSeries}
            height={340}
          />
        </Box>

      </VStack>
    </Suspense>
  );
}

export default Resume;
