import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LaborMap } from '../components/LaborMap';

const ReactApexChart = lazy(() => import('react-apexcharts'));
import { MasonryPhotoAlbum as PhotoAlbum } from 'react-photo-album';
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
import { SunIcon, MoonIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FaLinkedin, FaInstagram, FaYoutube, FaFileDownload, FaCalendarAlt } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import SkillOrbMap from '../components/SkillOrbMap';
import SkillsTree from '../components/SkillsTree';

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
  antigravity: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-7.3 16.8L12 11l7.3 7.8A10 10 0 0 0 12 2zm0 3.5l4.5 4.8H7.5L12 5.5zM3 19h18v2H3v-2z" />
    </svg>
  ),
  gemini: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a1 1 0 0 0-1 1c0 4.4-3.6 8-8 8a1 1 0 0 0 0 2c4.4 0 8 3.6 8 8a1 1 0 0 0 2 0c0-4.4 3.6-8 8-8a1 1 0 0 0 0-2c-4.4 0-8-3.6-8-8a1 1 0 0 0-1-1z" />
    </svg>
  ),
  pilot: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4.4 0-8 2-8 5v1h16v-1c0-3-3.6-5-8-5zm-8-3l-2-2 2-2v4zm16-4l2 2-2 2v-4z" />
    </svg>
  ),
};

// ─── Horizontal Timeline Component for Carousel ───
function HorizontalTimeline({ events = [], color, scheme, borderLight, cardBg, textColorMuted, setLbAsset, setLbJobAssets }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedEvent = events[selectedIdx];

  if (!events || events.length === 0) return null;

  return (
    <VStack align="stretch" spacing="1.5rem" w="100%" flex="1" minH="0" justify="space-between">
      <style>{`
        @keyframes dotPingH {
          0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.75; }
          100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0; }
        }
      `}</style>
      
      {/* Horizontal timeline track and nodes */}
      <Box
        overflowX="auto"
        w="100%"
        pb="0.75rem"
        sx={{
          '&::-webkit-scrollbar': { height: '5px' },
          '&::-webkit-scrollbar-track': { bg: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            bg: borderLight,
            borderRadius: '4px',
          },
        }}
      >
        <Box position="relative" w="100%" minW="fit-content" h="90px">
          {/* Track Line - mathematically centered vertically */}
          <Box
            position="absolute"
            top="50%"
            left="2rem"
            right="2rem"
            h="2px"
            bg={borderLight}
            zIndex="1"
            transform="translateY(-50%)"
          />

          {/* Nodes Container */}
          <HStack
            spacing="3.5rem"
            px="1.25rem"
            zIndex="2"
            position="relative"
            align="center"
            h="100%"
          >
            {events.map((ev, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <Flex
                  key={idx}
                  direction="column"
                  align="center"
                  justify="center"
                  minW="120px"
                  cursor="pointer"
                  onClick={() => setSelectedIdx(idx)}
                  position="relative"
                  userSelect="none"
                  h="100%"
                >
                  {/* Year - Positioned Above Dot */}
                  <Text
                    position="absolute"
                    top="0"
                    fontSize="0.78rem"
                    fontWeight="700"
                    color={isSelected ? color : textColorMuted}
                    transition="color 0.2s"
                  >
                    {ev.year}
                  </Text>

                  {/* Timeline node - Exactly Centered Vertically */}
                  <Box
                    boxSize="13px"
                    borderRadius="full"
                    bg={isSelected ? color : cardBg}
                    border="3px solid"
                    borderColor={isSelected ? color : borderLight}
                    position="relative"
                    transition="all 0.2s ease"
                    _hover={{ transform: 'scale(1.25)', borderColor: color }}
                    zIndex="2"
                  >
                    {isSelected && (
                      <>
                        <Box
                          position="absolute"
                          top="50%"
                          left="50%"
                          transform="translate(-50%, -50%)"
                          boxSize="13px"
                          borderRadius="full"
                          border="2px solid"
                          borderColor={color}
                          style={{ animation: 'dotPingH 2.2s ease-out infinite' }}
                          transformOrigin="center"
                          pointerEvents="none"
                        />
                        <Box
                          position="absolute"
                          top="50%"
                          left="50%"
                          transform="translate(-50%, -50%)"
                          boxSize="13px"
                          borderRadius="full"
                          border="2px solid"
                          borderColor={color}
                          style={{ animation: 'dotPingH 2.2s ease-out 0.9s infinite' }}
                          transformOrigin="center"
                          pointerEvents="none"
                        />
                      </>
                    )}
                  </Box>

                  {/* Event Title - Positioned Below Dot */}
                  <Text
                    position="absolute"
                    bottom="0"
                    fontSize="0.8rem"
                    fontWeight="600"
                    textAlign="center"
                    noOfLines={1}
                    color={isSelected ? 'white' : textColorMuted}
                    transition="color 0.2s"
                    maxW="110px"
                  >
                    {ev.title}
                  </Text>
                </Flex>
              );
            })}
          </HStack>
        </Box>
      </Box>

      {/* Selected Event Details Card */}
      <AnimatePresence mode="wait">
        {selectedEvent && (
          <motion.div
            key={selectedIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
          >
            <Box
              p="1.25rem"
              bg={useColorModeValue('rgba(0,0,0,0.015)', 'rgba(255,255,255,0.015)')}
              border="1px solid"
              borderColor={borderLight}
              borderRadius="xl"
              w="100%"
              flex="1"
              overflowY="auto"
            >
              <HStack justify="space-between" align="center" mb="0.6rem">
                <Text fontSize="1rem" fontWeight="700" color={color}>
                  {selectedEvent.title}
                </Text>
                <Badge colorScheme={scheme} fontSize="0.75rem" px="0.5rem" py="0.1rem" borderRadius="full">
                  {selectedEvent.year}
                </Badge>
              </HStack>
              <Flex align="start" justify="space-between" gap="1.5rem">
                <Text fontSize="0.9rem" color={textColorMuted} lineHeight="1.6" fontWeight="500" flex="1">
                  {selectedEvent.details}
                </Text>
                {selectedEvent.image_url && (
                  <Box
                    boxSize={{ base: '75px', md: '95px' }}
                    minW={{ base: '75px', md: '95px' }}
                    borderRadius="lg"
                    overflow="hidden"
                    cursor="pointer"
                    onClick={() => {
                      const asset = {
                        id: `slide-event-${selectedIdx}`,
                        public_url: selectedEvent.image_url,
                        caption: selectedEvent.title || 'Event Image',
                        filename: 'event_image.jpg',
                        file_type: 'image'
                      };
                      if (setLbAsset) setLbAsset(asset);
                      if (setLbJobAssets) setLbJobAssets([asset]);
                    }}
                    border="1px solid"
                    borderColor={borderLight}
                    transition="transform 0.18s ease, box-shadow 0.18s ease"
                    _hover={{
                      transform: 'scale(1.035)',
                      boxShadow: '0 4px 18px rgba(0,0,0,0.45)'
                    }}
                  >
                    <Image
                      src={selectedEvent.image_url}
                      alt={selectedEvent.title || 'Event Image'}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  </Box>
                )}
              </Flex>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </VStack>
  );
}

// ─── Slide Carousel Component ───
function SlideCarousel({ slides = [], brandPrimary, brandSecondary, borderLight, cardBg, textColorMuted, setLbAsset, setLbJobAssets }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const enabledSlides = slides.filter(s => s.is_enabled);

  if (enabledSlides.length === 0) return null;

  const currentSlide = enabledSlides[activeIdx];

  const nextSlide = () => {
    setActiveIdx(prev => (prev === enabledSlides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveIdx(prev => (prev === 0 ? enabledSlides.length - 1 : prev - 1));
  };

  const slideTheme = activeIdx % 2 === 0 ? {
    color: brandPrimary,
    scheme: 'blue'
  } : {
    color: brandSecondary,
    scheme: 'purple'
  };

  return (
    <Box
      w="100%"
      border="1px solid"
      borderColor={borderLight}
      borderRadius="2xl"
      p={{ base: '1.5rem', md: '2rem' }}
      bg={cardBg}
      position="relative"
      mb="4rem"
      aspectRatio="4/3"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      {/* Carousel Header */}
      <Flex align="center" justify="space-between" mb="1.5rem" pb="1rem" borderBottom="1px solid" borderColor={borderLight} flexShrink={0}>
        <Heading
          as="h2"
          fontSize="1.1rem"
          fontWeight="800"
          textTransform="uppercase"
          letterSpacing="0.08em"
          color={slideTheme.color}
        >
          {currentSlide.title}
        </Heading>

        {/* Carousel controls */}
        {enabledSlides.length > 1 && (
          <HStack spacing="0.75rem">
            <IconButton
              aria-label="Previous Slide"
              icon={<span>&lsaquo;</span>}
              size="sm"
              variant="ghost"
              borderRadius="full"
              fontSize="1.3rem"
              onClick={prevSlide}
              _hover={{ bg: 'whiteAlpha.100' }}
            />
            <Text fontSize="0.78rem" fontWeight="700" color={textColorMuted} minW="2.5rem" textAlign="center">
              {activeIdx + 1} / {enabledSlides.length}
            </Text>
            <IconButton
              aria-label="Next Slide"
              icon={<span>&rsaquo;</span>}
              size="sm"
              variant="ghost"
              borderRadius="full"
              fontSize="1.3rem"
              onClick={nextSlide}
              _hover={{ bg: 'whiteAlpha.100' }}
            />
          </HStack>
        )}
      </Flex>

      {/* Slide body */}
      <Box position="relative" w="100%" flex="1" display="flex" flexDirection="column" overflow="hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id || activeIdx}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
          >
            {currentSlide.content_type === 'markdown' && (
              <VStack align="start" spacing="1.2rem" overflowY="auto" flex="1" pr="0.5rem">
                <Text fontSize="1.05rem" fontWeight="650" lineHeight="1.5">
                  {currentSlide.content_data?.lead}
                </Text>
                <Text fontSize="1rem" color={textColorMuted} lineHeight="1.65">
                  {currentSlide.content_data?.body}
                </Text>
              </VStack>
            )}

             {currentSlide.content_type === 'personal_timeline' && (
              <HorizontalTimeline
                events={currentSlide.content_data}
                color={slideTheme.color}
                scheme={slideTheme.scheme}
                borderLight={borderLight}
                cardBg={cardBg}
                textColorMuted={textColorMuted}
                setLbAsset={setLbAsset}
                setLbJobAssets={setLbJobAssets}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}

function Resume({ data }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const navigate = useNavigate();
  const [expandedCards, setExpandedCards] = useState({});
  const [hoveredCardId, setHoveredCardId] = useState(null);

  // Media library — prefetched for all jobs on load; never re-fetches if already cached
  const [mediaByJob,  setMediaByJob]  = useState({});
  const [lbAsset, setLbAsset] = useState(null);
  const [lbJobAssets, setLbJobAssets] = useState([]);
  const fetchedJobs = useRef(new Set()); // tracks jobs already fetched or in-flight

  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const minimapRef = useRef(null);

  useEffect(() => {
    setCropX(50);
    setCropY(50);
    setNaturalWidth(0);
    setNaturalHeight(0);
    setIsDragging(false);
  }, [lbAsset?.id]);

  const handleMinimapInteraction = useCallback((e) => {
    if (!minimapRef.current || !naturalWidth || !naturalHeight) return;
    const rect = minimapRef.current.getBoundingClientRect();
    
    // Support touch events as well
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;

    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const imgRatio = naturalWidth / naturalHeight;

    if (imgRatio > 1) {
      // Landscape
      const Wm = 100;
      const Hm = 100 / imgRatio;
      const left = clickX - Hm / 2;
      const clampedLeft = Math.max(0, Math.min(Wm - Hm, left));
      const range = Wm - Hm;
      if (range > 0) {
        setCropX((clampedLeft / range) * 100);
      }
    } else {
      // Portrait
      const Hm = 100;
      const Wm = 100 * imgRatio;
      const top = clickY - Wm / 2;
      const clampedTop = Math.max(0, Math.min(Hm - Wm, top));
      const range = Hm - Wm;
      if (range > 0) {
        setCropY((clampedTop / range) * 100);
      }
    }
  }, [naturalWidth, naturalHeight]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleMinimapInteraction(e);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e) => {
      handleMinimapInteraction(e);
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('touchmove', handleWindowMouseMove);
    window.addEventListener('touchend', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchmove', handleWindowMouseMove);
      window.removeEventListener('touchend', handleWindowMouseUp);
    };
  }, [isDragging, handleMinimapInteraction]);

  const loadMediaForJob = useCallback(async (jobId) => {
    if (fetchedJobs.current.has(jobId)) return; // already cached or in-flight
    fetchedJobs.current.add(jobId);
    try {
      const res = await fetch(`/api/media?job_id=${jobId}`);
      if (res.ok) {
        const assets = await res.json();
        // Use default 4:3 dims — avoids blocking on image load before gallery renders
        const withDims = assets.map(a =>
          a.file_type === 'image' ? { ...a, _w: 800, _h: 600 } : a
        );
        setMediaByJob(prev => ({ ...prev, [jobId]: withDims }));
      }
    } catch { /* silent */ }
  }, []);

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

  // Background-prefetch media for every timeline job as soon as the data arrives
  useEffect(() => {
    if (!data?.timeline?.length) return;
    data.timeline.forEach((item, i) => {
      setTimeout(() => loadMediaForJob(item.id), i * 250);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.timeline?.length]); // run once when timeline is populated

  const toggleCard = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
    loadMediaForJob(id); // no-op if already prefetched
  };

  const openLightbox = (imgData) => {
    setLightboxImg(imgData);
    onOpen();
  };

  // Color mappings
  const navBg = useColorModeValue('oklch(100% 0 0 / 0.75)', 'oklch(18% 0.015 240 / 0.75)');
  const borderLight = useColorModeValue('oklch(90% 0.01 240)', 'oklch(28% 0.015 240 / 0.7)');
  const textColorMuted = useColorModeValue('oklch(50% 0.01 240)', 'oklch(65% 0.01 240)');
  const brandPrimary = useColorModeValue('oklch(55% 0.16 260)', 'oklch(75% 0.15 200)');
  const brandSecondary = useColorModeValue('oklch(60% 0.18 300)', 'oklch(65% 0.20 280)');
  const blueColor = useColorModeValue('blue.600', 'blue.300');
  const purpleColor = useColorModeValue('purple.600', 'purple.300');
  const cardBg = useColorModeValue('white', 'oklch(18% 0.015 240 / 0.65)');
  const modalBg = useColorModeValue('white', 'oklch(14% 0.015 240)');

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
      <style>{`
        @keyframes animatedGlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes bounceIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes emanateChevrons {
          0% {
            opacity: 0;
            transform: translateY(-4px) scale(0.8);
          }
          20% {
            opacity: 0.65;
          }
          100% {
            opacity: 0;
            transform: translateY(16px) scale(0.9);
          }
        }

        .ghostly-chevrons {
          opacity: 0;
          transition: opacity 0.22s ease-in-out;
        }

        .animated-glow-card:hover .ghostly-chevrons {
          opacity: 0.75;
        }

        .ghostly-chevrons svg {
          animation: emanateChevrons 1.5s infinite linear;
        }
        .ghostly-chevrons .chev-1 {
          animation-delay: 0s;
        }
        .ghostly-chevrons .chev-2 {
          animation-delay: 0.5s;
        }
        .ghostly-chevrons .chev-3 {
          animation-delay: 1s;
        }

        .animated-glow-card {
          position: relative;
          transition: all 0.28s ease !important;
        }

        .animated-glow-card::before {
          content: "";
          position: absolute;
          top: 0px;
          left: 0px;
          right: 0px;
          bottom: 0px;
          border-radius: inherit;
          background: linear-gradient(90deg, ${brandPrimary}, ${brandSecondary}, ${brandPrimary});
          background-size: 200% 200%;
          z-index: -1;
          filter: blur(16px);
          opacity: 0;
          transition: opacity 0.3s ease, filter 0.3s ease;
          animation: animatedGlow 8s ease infinite;
        }

        .animated-glow-card:hover {
          transform: translateY(-2px);
        }

        .animated-glow-card:hover::before {
          opacity: ${isDark ? 0.58 : 0.24};
          filter: blur(24px);
        }
      `}</style>

      {/* ── Media Lightbox Modal ── */}
      {lbAsset && (
        <Modal isOpen={!!lbAsset} onClose={() => setLbAsset(null)} size="4xl" isCentered>
          <ModalOverlay bg="blackAlpha.900" backdropFilter="blur(8px)" />
          <ModalContent bg={modalBg} border="1px solid" borderColor={borderLight} borderRadius="2xl" overflow="hidden" mx="1rem">
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
              <Box
                position="relative"
                w="100%"
                maxW="600px"
                mx="auto"
                aspectRatio="1/1"
                overflow="hidden"
                bg="black"
              >
                <Image
                  src={lbAsset.public_url}
                  alt={lbAsset.caption || lbAsset.filename}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  objectPosition={`${cropX}% ${cropY}%`}
                  onLoad={(e) => {
                    const { naturalWidth, naturalHeight } = e.target;
                    setNaturalWidth(naturalWidth);
                    setNaturalHeight(naturalHeight);
                  }}
                />

                {/* Interactive Panning Minimap Overlay */}
                {(() => {
                  const imgRatio = naturalWidth && naturalHeight ? naturalWidth / naturalHeight : 1;
                  const isImageNonSquare = naturalWidth && naturalHeight && Math.abs(imgRatio - 1) > 0.02;
                  if (!isImageNonSquare) return null;

                  return (
                    <VStack
                      position="absolute"
                      bottom="1rem"
                      right="1rem"
                      p="0.5rem"
                      bg="rgba(0, 0, 0, 0.75)"
                      backdropFilter="blur(10px)"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="whiteAlpha.300"
                      spacing="0.5rem"
                      zIndex="20"
                      boxShadow="xl"
                    >
                      <Text
                        fontSize="0.65rem"
                        fontWeight="800"
                        color="whiteAlpha.800"
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                        alignSelf="center"
                      >
                        Explore Crop
                      </Text>
                      {/* Bounding box of the minimap */}
                      <Box
                        ref={minimapRef}
                        position="relative"
                        cursor="crosshair"
                        overflow="hidden"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="whiteAlpha.400"
                        bg="blackAlpha.600"
                        w={imgRatio > 1 ? '100px' : `${100 * imgRatio}px`}
                        h={imgRatio > 1 ? `${100 / imgRatio}px` : '100px'}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleMouseDown}
                        userSelect="none"
                      >
                        {/* Semi-transparent background image */}
                        <Image
                          src={lbAsset.public_url}
                          w="100%"
                          h="100%"
                          objectFit="fill"
                          pointerEvents="none"
                          opacity="0.6"
                        />
                        {/* Highlighted Crop outline */}
                        <Box
                          position="absolute"
                          border="2px solid"
                          borderColor="blue.400"
                          bg="blue.400"
                          opacity="0.25"
                          boxShadow="0 0 8px rgba(66, 153, 225, 0.6)"
                          pointerEvents="none"
                          w={imgRatio > 1 ? `${100 / imgRatio}px` : '100px'}
                          h={imgRatio > 1 ? `${100 / imgRatio}px` : `${100 * imgRatio}px`}
                          left={imgRatio > 1 ? `${(cropX / 100) * (100 - 100 / imgRatio)}px` : '0px'}
                          top={imgRatio > 1 ? '0px' : `${(cropY / 100) * (100 - 100 * imgRatio)}px`}
                        />
                      </Box>

                      {/* Control buttons */}
                      <HStack spacing="0.25rem" justify="center" w="100%">
                        {imgRatio > 1 ? (
                          <>
                            <IconButton
                              size="xs"
                              icon={<ChevronLeftIcon />}
                              onClick={(e) => { e.stopPropagation(); setCropX(prev => Math.max(0, prev - 10)); }}
                              aria-label="Pan Left"
                              variant="ghost"
                              color="white"
                              _hover={{ bg: 'whiteAlpha.300' }}
                            />
                            <Text fontSize="0.65rem" color="whiteAlpha.800" fontWeight="600" minW="2.5rem" textAlign="center">
                              X: {Math.round(cropX)}%
                            </Text>
                            <IconButton
                              size="xs"
                              icon={<ChevronRightIcon />}
                              onClick={(e) => { e.stopPropagation(); setCropX(prev => Math.min(100, prev + 10)); }}
                              aria-label="Pan Right"
                              variant="ghost"
                              color="white"
                              _hover={{ bg: 'whiteAlpha.300' }}
                            />
                          </>
                        ) : (
                          <>
                            <IconButton
                              size="xs"
                              icon={<ChevronUpIcon />}
                              onClick={(e) => { e.stopPropagation(); setCropY(prev => Math.max(0, prev - 10)); }}
                              aria-label="Pan Up"
                              variant="ghost"
                              color="white"
                              _hover={{ bg: 'whiteAlpha.300' }}
                            />
                            <Text fontSize="0.65rem" color="whiteAlpha.800" fontWeight="600" minW="2.5rem" textAlign="center">
                              Y: {Math.round(cropY)}%
                            </Text>
                            <IconButton
                              size="xs"
                              icon={<ChevronDownIcon />}
                              onClick={(e) => { e.stopPropagation(); setCropY(prev => Math.min(100, prev + 10)); }}
                              aria-label="Pan Down"
                              variant="ghost"
                              color="white"
                              _hover={{ bg: 'whiteAlpha.300' }}
                            />
                          </>
                        )}
                      </HStack>
                    </VStack>
                  );
                })()}
              </Box>

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
            <Link href="#employers" fontSize="0.9rem" fontWeight="600" opacity="0.8" _hover={{ opacity: 1 }}>Employers</Link>
            <Link href="#testimonials" fontSize="0.9rem" fontWeight="600" opacity="0.8" _hover={{ opacity: 1 }}>Testimonials</Link>
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

              {data.slogan && (
                <Text
                  fontSize={{ base: '0.9rem', md: '1.1rem' }}
                  fontWeight="650"
                  bgGradient={`linear(to-r, ${brandPrimary}, ${brandSecondary})`}
                  bgClip="text"
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                  mt="-0.2rem"
                  mb="0.1rem"
                >
                  {data.slogan}
                </Text>
              )}

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

              {/* Call to Actions (CTAs) */}
              <HStack spacing="1rem" mt="1.25rem" wrap="wrap" justify={{ base: 'center', md: 'start' }}>
                <Button
                  as="a"
                  href="/Phil_Ybarrolaza_Resume.pdf"
                  download="Phil_Ybarrolaza_Resume.pdf"
                  leftIcon={<FaFileDownload />}
                  variant="solid"
                  bg={brandPrimary}
                  color="white"
                  borderRadius="12px"
                  px="1.5rem"
                  fontSize="0.82rem"
                  fontWeight="700"
                  _hover={{
                    bg: brandSecondary,
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                    "svg, .chakra-button__icon": {
                      animation: 'bounceIcon 0.6s ease-in-out infinite'
                    }
                  }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.2s"
                >
                  Download Resume
                </Button>
                <Button
                  as="a"
                  href="https://calendar.app.google/z7bjVcmc2qxZnEru7"
                  target="_blank"
                  rel="noopener"
                  leftIcon={<FaCalendarAlt />}
                  variant="outline"
                  borderColor={brandPrimary}
                  color={useColorModeValue(brandPrimary, 'white')}
                  borderRadius="12px"
                  px="1.5rem"
                  fontSize="0.82rem"
                  fontWeight="700"
                  _hover={{
                    bg: 'whiteAlpha.100',
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                    "svg, .chakra-button__icon": {
                      animation: 'bounceIcon 0.6s ease-in-out infinite'
                    }
                  }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.2s"
                >
                  Book a Meeting
                </Button>
              </HStack>
            </VStack>

            {/* Profile Image with Gradient Border */}
            <Box
              flexShrink="0"
              p="3px"
              bgGradient={`linear(to-tr, ${brandPrimary}, ${brandSecondary})`}
              borderRadius="full"
              shadow="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Image
                src="/assets/profile.jpg"
                alt="Phil Ybarrolaza"
                borderRadius="full"
                boxSize={{ base: '94px', md: '114px' }}
                objectFit="cover"
                bg={cardBg}
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
          cardBg={cardBg}
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

        {/* 2. Hero / Profile Section (Traditional Professional Summary Carousel) */}
        <SlideCarousel
          slides={data.slides || []}
          brandPrimary={brandPrimary}
          brandSecondary={brandSecondary}
          borderLight={borderLight}
          cardBg={cardBg}
          textColorMuted={textColorMuted}
          setLbAsset={setLbAsset}
          setLbJobAssets={setLbJobAssets}
        />



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
                  alignItems="stretch"
                  mb={idx === data.timeline.length - 1 ? '0' : '1.5rem'}
                  onMouseEnter={() => setHoveredCardId(item.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                >

                  {/* Left: timeline rail — dot with ping + tooltip */}
                  <Box display="flex" flexDir="column" justifyContent="center" alignItems="center" flexShrink={0} w="2.5rem" mr="1rem">
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

                                  <Box
                    className="animated-glow-card"
                    flex="1"
                    minW="0"
                    position="relative"
                  >
                    <Box
                      w="100%"
                      h="100%"
                      border="1px solid"
                      borderColor={borderLight}
                      borderRadius="2xl"
                      bg={cardBg}
                      overflow="hidden"
                      position="relative"
                      zIndex="1"
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
                      borderBottom="1px solid"
                      borderBottomColor={isExpanded ? borderLight : 'transparent'}
                      transition="border-bottom-color 0.22s ease"
                    >
                      <VStack align="start" spacing="0.2rem" flex="1" minW="0">
                        <Heading as="h3" fontSize="1.1rem" fontWeight="700">
                           {item.role}
                        </Heading>
                        <Text fontSize="0.9rem" fontWeight="600" color={theme.color} noOfLines={2}>
                          {item.company} {item.location && `\u2022 ${item.location}`}
                        </Text>
                        <Text fontSize="0.8rem" color={textColorMuted} fontWeight="500">
                          {item.date_range}
                        </Text>
                      </VStack>
                      <HStack spacing="0.65rem" align="center" flexShrink={0} flexWrap="wrap">
                        {skills.length > 0 && (
                          <Tag size="sm" variant="subtle" colorScheme={theme.scheme} fontSize="0.72rem" fontWeight="600">
                            Core Skills
                          </Tag>
                        )}
                        <Tag size="sm" variant="subtle" colorScheme={theme.scheme} fontSize="0.75rem" fontWeight="700">
                          {theme.label}
                        </Tag>
                        {/* Interactive Chevron Button */}
                        <Flex
                          position="relative"
                          align="center"
                          justify="center"
                          boxSize="28px"
                          borderRadius="full"
                          border="1px solid"
                          borderColor={isExpanded ? theme.color : borderLight}
                          bg={isExpanded ? `${theme.color}15` : 'transparent'}
                          color={isExpanded ? theme.color : theme.color + '8C'}
                          transition="all 0.22s ease"
                          _hover={{
                            borderColor: theme.color,
                            bg: `${theme.color}25`,
                            color: theme.color,
                          }}
                        >
                          <ChevronDownIcon
                            transition="transform 0.25s ease"
                            transform={isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}
                            w="16px"
                            h="16px"
                          />
                          {!isExpanded && (
                            <Box
                              className="ghostly-chevrons"
                              position="absolute"
                              top="28px"
                              left="50%"
                              transform="translateX(-50%)"
                              w="20px"
                              h="36px"
                              pointerEvents="none"
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                              justifyContent="flex-start"
                              color={theme.color}
                              style={{
                                maskImage: 'linear-gradient(to bottom, black, transparent)',
                                WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
                              }}
                            >
                              <ChevronDownIcon w="12px" h="12px" className="chev-1" />
                              <ChevronDownIcon w="12px" h="12px" className="chev-2" />
                              <ChevronDownIcon w="12px" h="12px" className="chev-3" />
                            </Box>
                          )}
                        </Flex>
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
                          return (
                            <Box w="100%" mt="0.5rem">
                              <Text fontSize="0.72rem" fontWeight="700" textTransform="uppercase"
                                letterSpacing="0.06em" mb="0.65rem" color={textColorMuted}>
                                Media Gallery ({jobMedia.length})
                              </Text>
                              <SimpleGrid columns={[2, 3, 4]} spacing="16px">
                                {jobMedia.map((media, index) => (
                                  <Box
                                    key={media.id}
                                    aspectRatio="1/1"
                                    overflow="hidden"
                                    borderRadius="8px"
                                    cursor="pointer"
                                    onClick={() => {
                                      setLbAsset(media);
                                      setLbJobAssets(jobMedia);
                                    }}
                                    transition="transform 0.18s ease, box-shadow 0.18s ease"
                                    _hover={{
                                      transform: 'scale(1.025)',
                                      boxShadow: '0 4px 18px rgba(0,0,0,0.45)'
                                    }}
                                  >
                                    <Image
                                      src={media.public_url}
                                      alt={media.caption || media.filename}
                                      w="100%"
                                      h="100%"
                                      objectFit="cover"
                                    />
                                  </Box>
                                ))}
                              </SimpleGrid>
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
              </Box>
              );
            })}
          </Box>
        </Box>



        {/* 3.5 Testimonials Section */}
        {data.testimonials && data.testimonials.length > 0 && (
          <TestimonialsSection
            testimonials={data.testimonials}
            borderLight={borderLight}
            cardBg={cardBg}
            textColorMuted={textColorMuted}
            brandPrimary={brandPrimary}
            brandSecondary={brandSecondary}
          />
        )}


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



        {/* 6b. Labor Footprint — interactive employer map */}
        <Box id="employers">
          <Heading as="h2" fontSize="1.5rem" fontWeight="800" mb="1.5rem" letterSpacing="-0.01em">
            Employers
          </Heading>
          <LaborMap
            employers={data.employers}
            borderLight={borderLight}
            cardBg={cardBg}
            textColorMuted={textColorMuted}
          />
        </Box>



        {/* 7. Footer & Tech Stack badges */}
        <VStack spacing="2rem" as="footer" textAlign="center" pt="2rem">
          <VStack spacing="0.75rem" w="100%">
            <Text
              fontSize="0.75rem"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.12em"
              color={textColorMuted}
            >
              BUILT WITH
            </Text>
            {(() => {
              const builtWithBadges = [
                {
                  id: 'pilot',
                  label: 'Phil Ybarrolaza',
                  href: '#',
                  onClick: (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
                  icon: techIcons.pilot,
                  hoverColor: 'oklch(75% 0.15 70)',
                },
                {
                  id: 'antigravity',
                  label: 'Antigravity AI',
                  href: 'https://antigravity.google',
                  icon: techIcons.antigravity,
                  hoverColor: 'oklch(70% 0.20 200)',
                },
                {
                  id: 'gemini',
                  label: 'Gemini Foundation',
                  href: 'https://deepmind.google',
                  icon: techIcons.gemini,
                  hoverColor: 'oklch(70% 0.18 290)',
                },
                {
                  id: 'node',
                  label: 'Node.js',
                  href: 'https://nodejs.org/',
                  icon: techIcons.node,
                  hoverColor: 'oklch(65% 0.15 140)',
                },
                {
                  id: 'express',
                  label: 'Express',
                  href: 'https://expressjs.com/',
                  icon: techIcons.express,
                  hoverColor: isDark ? 'white' : 'black',
                },
                {
                  id: 'supabase',
                  label: 'Supabase',
                  href: 'https://supabase.com/',
                  icon: techIcons.supabase,
                  hoverColor: 'oklch(72% 0.18 150)',
                },
                {
                  id: 'react',
                  label: 'React',
                  href: 'https://react.dev/',
                  icon: techIcons.react,
                  hoverColor: 'oklch(75% 0.15 200)',
                },
                {
                  id: 'vite',
                  label: 'Vite',
                  href: 'https://vite.dev/',
                  icon: techIcons.vite,
                  hoverColor: 'oklch(65% 0.20 280)',
                },
                {
                  id: 'chakra',
                  label: 'Chakra UI',
                  href: 'https://v2.chakra-ui.com/',
                  icon: techIcons.chakraui,
                  hoverColor: 'oklch(68% 0.17 185)',
                }
              ];

              return (
                <Box
                  w="100%"
                  maxW="100%"
                  mx="auto"
                  overflow="hidden"
                  position="relative"
                  py="0.75rem"
                  style={{
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                    maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                  }}
                >
                  <motion.div
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      width: 'max-content',
                    }}
                    animate={{
                      x: ['0%', '-50%'],
                    }}
                    transition={{
                      x: {
                        repeat: Infinity,
                        repeatType: 'loop',
                        duration: 32,
                        ease: 'linear',
                      },
                    }}
                  >
                    {[...Array(2)].map((_, listIdx) => (
                      <HStack key={listIdx} spacing="1.5rem" mr="1.5rem" flexShrink={0}>
                        {builtWithBadges.map((badge) => {
                          const hoverShadow = badge.hoverColor.startsWith('oklch')
                            ? `0 4px 12px ${badge.hoverColor.replace(')', ' / 0.25)')}`
                            : `0 4px 12px ${badge.hoverColor === 'white' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`;
                          return (
                            <Link
                              key={badge.id}
                              href={badge.href}
                              onClick={badge.onClick}
                              target={badge.href === '#' ? undefined : "_blank"}
                              rel={badge.href === '#' ? undefined : "noopener"}
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
                              flexShrink={0}
                              _hover={{
                                transform: 'translateY(-2px)',
                                color: badge.hoverColor,
                                borderColor: badge.hoverColor,
                                boxShadow: hoverShadow,
                              }}
                            >
                              {badge.icon}
                              <Text>{badge.label}</Text>
                            </Link>
                          );
                        })}
                      </HStack>
                    ))}
                  </motion.div>
                </Box>
              );
            })()}
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
            <Box position="relative" w="100%" aspectRatio="1/1" overflow="hidden">
              <Image
                src={lightboxImg.src}
                alt={lightboxImg.alt}
                w="100%"
                h="100%"
                objectFit="cover"
                mx="auto"
              />
            </Box>
          </ModalBody>
          <Box p="1.5rem" bg={useColorModeValue('white', 'rgba(25, 27, 38, 0.95)')}>
            <Text fontSize="0.9rem" fontWeight="500" mb="1rem">
              {lightboxImg.desc}
            </Text>
            <HStack spacing="0.5rem">
              {lightboxImg.tags.map((tag) => (
                <Tag
                  key={tag}
                  size="sm"
                  variant="outline"
                  borderColor={brandPrimary}
                  color={brandPrimary}
                  bg={useColorModeValue('rgba(59, 130, 246, 0.04)', 'rgba(59, 130, 246, 0.1)')}
                >
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
            style={{ animation: 'dotPing 2.2s ease-out infinite' }}
            transformOrigin="center"
            pointerEvents="none"
          />
          <Box
            position="absolute"
            top="50%" left="50%"
            transform="translate(-50%, -50%)"
            w="13px" h="13px" borderRadius="full"
            border="2px solid"
            borderColor={color}
            style={{ animation: 'dotPing 2.2s ease-out 0.9s infinite' }}
            transformOrigin="center"
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
  const isDark = colorMode === 'dark';

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
    <Box
      id="skills"
      mb="4rem"
      border="1px solid"
      borderColor={borderLight}
      borderRadius="2xl"
      p={{ base: '1.5rem', md: '2rem' }}
      bg={cardBg}
    >
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', sm: 'center' }}
        gap="1rem"
        mb="2rem"
        pb="1.25rem"
        borderBottom="1px solid"
        borderColor={borderLight}
      >
        <Box>
          <Heading as="h2" fontSize="1.1rem" fontWeight="800" textTransform="uppercase" letterSpacing="0.08em">
            Skills &amp; Core Competencies
          </Heading>
          <Text fontSize="0.8rem" color={textColorMuted} mt="0.15rem">
            {(competencies || []).length + (skills || []).length} total skills
          </Text>
        </Box>
        <HStack
          spacing="0.4rem"
          bg={useColorModeValue('rgba(0,0,0,0.02)', 'rgba(255,255,255,0.02)')}
          p="0.25rem"
          borderRadius="lg"
          border="1px solid"
          borderColor={borderLight}
          alignSelf={{ base: 'start', sm: 'auto' }}
        >
          <Button
            size="xs"
            onClick={() => setViewMode('list')}
            fontSize="0.75rem"
            fontWeight="700"
            borderRadius="md"
            px="0.75rem"
            variant="unstyled"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            h="1.6rem"
            bg={viewMode === 'list' ? brandPrimary : 'transparent'}
            color={viewMode === 'list' ? (isDark ? 'gray.900' : 'white') : textColorMuted}
            boxShadow={viewMode === 'list' ? 'sm' : 'none'}
            _hover={{
              bg: viewMode === 'list' ? brandPrimary : useColorModeValue('rgba(0,0,0,0.04)', 'rgba(255,255,255,0.04)'),
              color: viewMode === 'list' ? (isDark ? 'gray.900' : 'white') : (isDark ? 'white' : 'gray.800'),
              "span": {
                animation: 'bounceIcon 0.6s ease-in-out infinite'
              }
            }}
            transition="all 0.15s"
          >
            <Box as="span" display="inline-block" mr="0.3rem">📋</Box> List
          </Button>
          <Button
            size="xs"
            onClick={() => setViewMode('map')}
            fontSize="0.75rem"
            fontWeight="700"
            borderRadius="md"
            px="0.75rem"
            variant="unstyled"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            h="1.6rem"
            bg={viewMode === 'map' ? brandSecondary : 'transparent'}
            color={viewMode === 'map' ? (isDark ? 'gray.900' : 'white') : textColorMuted}
            boxShadow={viewMode === 'map' ? 'sm' : 'none'}
            _hover={{
              bg: viewMode === 'map' ? brandSecondary : useColorModeValue('rgba(0,0,0,0.04)', 'rgba(255,255,255,0.04)'),
              color: viewMode === 'map' ? (isDark ? 'gray.900' : 'white') : (isDark ? 'white' : 'gray.800'),
              "span": {
                animation: 'bounceIcon 0.6s ease-in-out infinite'
              }
            }}
            transition="all 0.15s"
          >
            <Box as="span" display="inline-block" mr="0.3rem">🌐</Box> Skill Map
          </Button>
          <Button
            size="xs"
            onClick={() => setViewMode('insights')}
            fontSize="0.75rem"
            fontWeight="700"
            borderRadius="md"
            px="0.75rem"
            variant="unstyled"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            h="1.6rem"
            bg={viewMode === 'insights' ? brandPrimary : 'transparent'}
            color={viewMode === 'insights' ? (isDark ? 'gray.900' : 'white') : textColorMuted}
            boxShadow={viewMode === 'insights' ? 'sm' : 'none'}
            _hover={{
              bg: viewMode === 'insights' ? brandPrimary : useColorModeValue('rgba(0,0,0,0.04)', 'rgba(255,255,255,0.04)'),
              color: viewMode === 'insights' ? (isDark ? 'gray.900' : 'white') : (isDark ? 'white' : 'gray.800'),
              "span": {
                animation: 'bounceIcon 0.6s ease-in-out infinite'
              }
            }}
            transition="all 0.15s"
          >
            <Box as="span" display="inline-block" mr="0.3rem">📊</Box> Insights
          </Button>
          <Button
            size="xs"
            onClick={() => setViewMode('tree')}
            fontSize="0.75rem"
            fontWeight="700"
            borderRadius="md"
            px="0.75rem"
            variant="unstyled"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            h="1.6rem"
            bg={viewMode === 'tree' ? brandSecondary : 'transparent'}
            color={viewMode === 'tree' ? (isDark ? 'gray.900' : 'white') : textColorMuted}
            boxShadow={viewMode === 'tree' ? 'sm' : 'none'}
            _hover={{
              bg: viewMode === 'tree' ? brandSecondary : useColorModeValue('rgba(0,0,0,0.04)', 'rgba(255,255,255,0.04)'),
              color: viewMode === 'tree' ? (isDark ? 'gray.900' : 'white') : (isDark ? 'white' : 'gray.800'),
              "span": {
                animation: 'bounceIcon 0.6s ease-in-out infinite'
              }
            }}
            transition="all 0.15s"
          >
            <Box as="span" display="inline-block" mr="0.3rem">🌳</Box> Skills Tree
          </Button>
        </HStack>
      </Flex>

      <Box flex="1">
        {viewMode === 'map' ? (
          <Box minH="300px">
            <SkillOrbMap colorMode={colorMode} />
          </Box>
        ) : viewMode === 'tree' ? (
          <SkillsTree
            borderLight={borderLight}
            brandPrimary={brandPrimary}
          />
        ) : viewMode === 'insights' ? (
          <SkillsInsightsPanel
            colorMode={colorMode}
            borderLight={borderLight}
            cardBg={cardBg}
            textColorMuted={textColorMuted}
          />
        ) : (
          <Tabs index={tabIdx} onChange={setTabIdx} variant="soft-rounded" size="sm" isLazy>
            <TabList
              display="inline-flex"
              bg={useColorModeValue('rgba(0,0,0,0.02)', 'rgba(255,255,255,0.02)')}
              p="0.25rem"
              borderRadius="xl"
              border="1px solid"
              borderColor={borderLight}
              gap="0.3rem"
              mb="1.75rem"
              wrap="wrap"
            >
              <Tab
                _selected={{ bg: brandPrimary, color: isDark ? 'gray.900' : 'white', boxShadow: 'sm' }}
                _hover={{ bg: useColorModeValue('rgba(0,0,0,0.04)', 'rgba(255,255,255,0.04)') }}
                fontWeight="700"
                fontSize="0.8rem"
                bg="transparent"
                px="1rem"
                py="0.4rem"
                borderRadius="lg"
                color={textColorMuted}
                transition="all 0.2s"
              >
                🔵 Labor Relations
                <Badge
                  ml="0.5rem"
                  bg={tabIdx === 0 ? (isDark ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.25)") : useColorModeValue("rgba(59, 130, 246, 0.08)", "rgba(59, 130, 246, 0.15)")}
                  color={tabIdx === 0 ? (isDark ? "gray.900" : "white") : brandPrimary}
                  borderRadius="full"
                  fontSize="0.65rem"
                >
                  {laborCount + leadershipSkills.length}
                </Badge>
              </Tab>
              <Tab
                _selected={{ bg: brandSecondary, color: isDark ? 'gray.900' : 'white', boxShadow: 'sm' }}
                _hover={{ bg: useColorModeValue('rgba(0,0,0,0.04)', 'rgba(255,255,255,0.04)') }}
                fontWeight="700"
                fontSize="0.8rem"
                bg="transparent"
                px="1rem"
                py="0.4rem"
                borderRadius="lg"
                color={textColorMuted}
                transition="all 0.2s"
              >
                🟣 Digital Media &amp; Communications
                <Badge
                  ml="0.5rem"
                  bg={tabIdx === 1 ? (isDark ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.25)") : useColorModeValue("rgba(147, 51, 234, 0.08)", "rgba(147, 51, 234, 0.15)")}
                  color={tabIdx === 1 ? (isDark ? "gray.900" : "white") : brandSecondary}
                  borderRadius="full"
                  fontSize="0.65rem"
                >
                  {digitalCount + commsSkills.length}
                </Badge>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Tab 0: Labor Relations */}
              <TabPanel px="0" pt="0">
                {/* Quick-ref pills */}
                {leadershipSkills.length > 0 && (
                  <Box
                    mb="1.5rem"
                    p="1rem"
                    bg={useColorModeValue('rgba(0,0,0,0.015)', 'rgba(255,255,255,0.015)')}
                    border="1px solid"
                    borderColor={borderLight}
                    borderRadius="xl"
                  >
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
                  <Box
                    mb="1.5rem"
                    p="1rem"
                    bg={useColorModeValue('rgba(0,0,0,0.015)', 'rgba(255,255,255,0.015)')}
                    border="1px solid"
                    borderColor={borderLight}
                    borderRadius="xl"
                  >
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

function CareerScopeBar({ borderLight, blueColor, purpleColor, employers, competencies, cardBg }) {
  const progressTrackBg = useColorModeValue('rgba(0,0,0,0.06)', 'rgba(255,255,255,0.06)');
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
        @keyframes statsProgressRadial {
          from { stroke-dashoffset: 43.982; }
          to   { stroke-dashoffset: 0; }
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
        bg={cardBg}
        position="relative"
        transition="transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: useColorModeValue(
            '0 20px 40px -15px rgba(0,0,0,0.06)',
            '0 20px 40px -15px rgba(0,0,0,0.4)'
          )
        }}
      >
        {/* Dynamic color shifting background overlays */}
        <Box
          position="absolute"
          inset="0"
          pointerEvents="none"
          transition="opacity 0.8s ease-in-out"
          opacity={statIdx === 0 ? 1 : 0}
          bg={useColorModeValue(
            'linear-gradient(135deg, rgba(96, 165, 250, 0.08) 0%, rgba(255, 255, 255, 0) 80%)',
            'linear-gradient(135deg, rgba(96, 165, 250, 0.05) 0%, rgba(0, 0, 0, 0) 80%)'
          )}
          zIndex="1"
        />
        <Box
          position="absolute"
          inset="0"
          pointerEvents="none"
          transition="opacity 0.8s ease-in-out"
          opacity={statIdx === 1 ? 1 : 0}
          bg={useColorModeValue(
            'linear-gradient(135deg, rgba(192, 132, 252, 0.08) 0%, rgba(255, 255, 255, 0) 80%)',
            'linear-gradient(135deg, rgba(192, 132, 252, 0.05) 0%, rgba(0, 0, 0, 0) 80%)'
          )}
          zIndex="1"
        />

        {/* Tiny circle in top-right showing progress */}
        <Box
          key={progKey}
          onClick={() => {
            const next = (statIdx + 1) % SETS.length;
            jumpTo(next);
          }}
          position="absolute"
          top="0.75rem"
          right="0.75rem"
          zIndex="10"
          cursor="pointer"
          transition="opacity 0.2s"
          _hover={{ opacity: 0.8 }}
          title={`Click to switch to ${statIdx === 0 ? SETS[1].label : SETS[0].label} stats`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            {/* Background Track */}
            <circle
              cx="10"
              cy="10"
              r="7"
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1.5"
            />
            {/* Animated Stroke Progress */}
            <circle
              cx="10"
              cy="10"
              r="7"
              fill="transparent"
              stroke={statIdx === 0 ? '#60a5fa' : '#c084fc'}
              strokeWidth="1.5"
              strokeDasharray="43.982"
              strokeDashoffset="43.982"
              style={{
                animation: 'statsProgressRadial 10s linear forwards',
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
              }}
            />
          </svg>
        </Box>

        {/* Stat grid */}
        <Box position="relative" zIndex="2" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <SimpleGrid columns={{ base: 2, md: 4 }} divider={<Divider orientation="vertical" borderColor={borderLight} />}>
            {currentSet.items.map((stat, i) => (
              <VStack
                key={stat.key}
                aspectRatio="1/1"
                justify="center"
                align="center"
                px="1rem"
                spacing="0.25rem"
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

// ─── Testimonials Section ──────────────────────────────────────────────────────

function TestimonialsSection({ testimonials, borderLight, cardBg, textColorMuted, brandPrimary, brandSecondary }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!testimonials || testimonials.length <= 3) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 3) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [testimonials]);

  if (!testimonials || testimonials.length === 0) return null;

  const currentGroup = testimonials.length > 3 
    ? [
        testimonials[currentIndex],
        testimonials[(currentIndex + 1) % testimonials.length],
        testimonials[(currentIndex + 2) % testimonials.length],
      ].filter(Boolean)
    : testimonials;

  return (
    <Box id="testimonials" mb="6rem">
      <Heading as="h2" fontSize="1.5rem" fontWeight="800" mb="2rem" letterSpacing="-0.01em">
        Testimonials
      </Heading>
      
      <Box position="relative" minH={{ base: "450px", md: "300px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <SimpleGrid columns={1} spacing="1.5rem">
              {currentGroup.map((t, idx) => (
          <Box
            key={t.id}
            bg={cardBg}
            border="1px solid"
            borderColor={borderLight}
            borderRadius="12px"
            p="1.75rem"
            mb="1.5rem"
            display="inline-block"
            w="100%"
            boxShadow="sm"
            _hover={{ boxShadow: 'md', transform: 'translateY(-4px)', borderColor: brandPrimary }}
            transition="all 0.3s ease"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-10px"
              right="10px"
              fontSize="6rem"
              color={brandPrimary}
              opacity={0.05}
              lineHeight="1"
              fontFamily="serif"
              pointerEvents="none"
            >
              &rdquo;
            </Box>
            <Flex gap="0.75rem" mb="1.5rem" position="relative" zIndex={1}>
              <Text fontSize="0.95rem" lineHeight="1.7" color={textColorMuted}>
                "{t.content}"
              </Text>
            </Flex>
            <Divider mb="1rem" borderColor={borderLight} />
            <Flex justify="space-between" align="center">
              <Flex gap="1rem" align="center">
                {t.image_url && (
                  <Image src={t.image_url} alt={`${t.name} avatar`} boxSize="50px" borderRadius="full" objectFit="cover" border="2px solid" borderColor={brandPrimary} />
                )}
                <Box>
                  <Text fontWeight="700" fontSize="0.95rem">{t.name}</Text>
                  <Text fontSize="0.8rem" color={textColorMuted}>
                    {t.title}{t.company ? ` @ ${t.company}` : ''}
                  </Text>
                </Box>
              </Flex>
              {t.linkedin_url && (
                <Link href={t.linkedin_url} isExternal title="View on LinkedIn">
                  <Box
                    as="svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    boxSize="20px"
                    color="#0a66c2"
                    _hover={{ opacity: 0.8 }}
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </Box>
                </Link>
              )}
            </Flex>
          </Box>
              ))}
            </SimpleGrid>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}

export default Resume;
