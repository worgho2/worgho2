'use client';

import { Box, Container, Flex, Heading, Text, VStack, HStack, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { LuGithub, LuLinkedin, LuMail, LuArrowRight, LuCode, LuBrain } from 'react-icons/lu';
import { Button } from './button';

export const HeroSection: React.FC = () => {
  const accentColor = '#667eea';

  return (
    <Box
      minH='100vh'
      position='relative'
      overflow='hidden'
      display='flex'
      alignItems='center'
      bg='linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
    >
      {/* Floating Elements */}
      <Box
        position='absolute'
        top='20%'
        right='10%'
        fontSize='6xl'
        color={accentColor}
        opacity={0.3}
        animation='float 6s ease-in-out infinite'
      >
        <LuCode />
      </Box>

      <Box
        position='absolute'
        bottom='30%'
        left='5%'
        fontSize='4xl'
        color={accentColor}
        opacity={0.2}
        animation='float 8s ease-in-out infinite reverse'
      >
        <LuBrain />
      </Box>

      <Container
        maxW='6xl'
        position='relative'
        zIndex={1}
      >
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align='center'
          justify='space-between'
          gap={12}
        >
          <VStack
            align={{ base: 'center', lg: 'start' }}
            gap={8}
            flex={1}
            textAlign={{ base: 'center', lg: 'left' }}
          >
            {/* Animated Greeting */}
            <Text
              fontSize='xl'
              color={accentColor}
              fontWeight='medium'
            >
              👋 Hello, I'm
            </Text>

            {/* Main Heading */}
            <Heading
              as='h1'
              size={{ base: '2xl', md: '3xl', lg: '4xl' }}
              fontWeight='bold'
              lineHeight='shorter'
            >
              <Text
                as='span'
                color={accentColor}
              >
                Otávio Baziewicz
              </Text>
              <br />
              <Text as='span'>Full-Stack Architect</Text>
            </Heading>

            {/* Subtitle */}
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color='fg.muted'
              maxW='600px'
            >
              I craft{' '}
              <Text
                as='span'
                color={accentColor}
                fontWeight='semibold'
              >
                exceptional digital experiences
              </Text>{' '}
              using cutting-edge technologies. From Rust-powered WebAssembly to serverless
              architectures, I turn complex problems into elegant solutions.
            </Text>

            {/* CTA Buttons */}
            <HStack
              gap={4}
              flexWrap='wrap'
              justify={{ base: 'center', lg: 'start' }}
            >
              <Link asChild>
                <NextLink href='/projects'>
                  <Button
                    size='lg'
                    colorPalette='blue'
                    _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                    transition='all 0.2s'
                  >
                    View My Work <LuArrowRight />
                  </Button>
                </NextLink>
              </Link>

              <Link asChild>
                <NextLink href='/blog'>
                  <Button
                    size='lg'
                    variant='outline'
                    _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                    transition='all 0.2s'
                  >
                    Read My Blog
                  </Button>
                </NextLink>
              </Link>
            </HStack>

            {/* Social Links */}
            <HStack gap={4}>
              <Link
                href='https://github.com/worgho2'
                target='_blank'
                rel='noopener noreferrer'
                p={3}
                borderRadius='full'
                bg='bg.subtle'
                _hover={{ bg: accentColor, color: 'white', transform: 'scale(1.1)' }}
                transition='all 0.2s'
              >
                <LuGithub size={20} />
              </Link>

              <Link
                href='https://www.linkedin.com/in/otaviobf'
                target='_blank'
                rel='noopener noreferrer'
                p={3}
                borderRadius='full'
                bg='bg.subtle'
                _hover={{ bg: accentColor, color: 'white', transform: 'scale(1.1)' }}
                transition='all 0.2s'
              >
                <LuLinkedin size={20} />
              </Link>

              <Link
                href='mailto:otavio@baziewi.cz'
                p={3}
                borderRadius='full'
                bg='bg.subtle'
                _hover={{ bg: accentColor, color: 'white', transform: 'scale(1.1)' }}
                transition='all 0.2s'
              >
                <LuMail size={20} />
              </Link>
            </HStack>
          </VStack>

          {/* Right side geometric design */}
          <Box
            flex={1}
            display={{ base: 'none', lg: 'block' }}
          >
            <Box
              w='400px'
              h='400px'
              borderRadius='full'
              bg={`linear-gradient(45deg, ${accentColor}, transparent)`}
              opacity={0.1}
              position='relative'
            >
              <Box
                position='absolute'
                top='50%'
                left='50%'
                transform='translate(-50%, -50%)'
                w='300px'
                h='300px'
                borderRadius='full'
                border='2px solid'
                borderColor={accentColor}
                opacity={0.3}
              />
            </Box>
          </Box>
        </Flex>
      </Container>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }
      `}</style>
    </Box>
  );
};
