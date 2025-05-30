'use client';

import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Link,
  SimpleGrid,
} from '@chakra-ui/react';
import { LuMail, LuLinkedin, LuGithub, LuMapPin, LuCalendar, LuArrowRight } from 'react-icons/lu';
import { Button } from './button';

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: {
    label: string;
    href: string;
    external?: boolean;
  };
}

const ContactCard: React.FC<ContactCardProps> = ({ icon, title, description, action }) => {
  const accentColor = '#667eea';

  return (
    <VStack
      p={8}
      bg='bg.subtle'
      borderRadius='xl'
      border='1px solid'
      borderColor='border.subtle'
      align='start'
      gap={6}
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'xl',
        borderColor: accentColor,
      }}
      transition='all 0.3s ease'
      position='relative'
      overflow='hidden'
    >
      {/* Background gradient */}
      <Box
        position='absolute'
        top={0}
        left={0}
        right={0}
        h='4px'
        bg={`linear-gradient(90deg, ${accentColor}, transparent)`}
      />

      <Box
        p={4}
        bg={accentColor}
        color='white'
        borderRadius='xl'
        fontSize='2xl'
      >
        {icon}
      </Box>

      <VStack
        align='start'
        gap={3}
      >
        <Heading
          size='lg'
          color='fg.default'
        >
          {title}
        </Heading>
        <Text
          color='fg.muted'
          lineHeight='relaxed'
        >
          {description}
        </Text>
      </VStack>

      <Link
        href={action.href}
        target={action.external ? '_blank' : undefined}
        rel={action.external ? 'noopener noreferrer' : undefined}
        _hover={{ textDecoration: 'none' }}
        w='full'
      >
        <Button
          variant='outline'
          size='lg'
          w='full'
          _hover={{
            bg: accentColor,
            color: 'white',
            borderColor: accentColor,
          }}
          transition='all 0.2s'
        >
          {action.label} <LuArrowRight />
        </Button>
      </Link>
    </VStack>
  );
};

export const ContactSection: React.FC = () => {
  const accentColor = '#667eea';

  return (
    <Box
      py={{ base: 20, md: 28 }}
      bg='bg.default'
      position='relative'
      overflow='hidden'
    >
      {/* Background Elements */}
      <Box
        position='absolute'
        top='10%'
        right='5%'
        w='300px'
        h='300px'
        bgGradient={`radial(circle, ${accentColor}20, transparent)`}
        borderRadius='full'
        opacity={0.5}
      />
      <Box
        position='absolute'
        bottom='10%'
        left='5%'
        w='200px'
        h='200px'
        bgGradient={`radial(circle, purple.200, transparent)`}
        borderRadius='full'
        opacity={0.3}
      />

      <Container
        maxW='6xl'
        position='relative'
      >
        <VStack
          gap={16}
          align='stretch'
        >
          {/* Section Header */}
          <VStack
            gap={6}
            textAlign='center'
          >
            <Heading
              as='h2'
              size={{ base: 'xl', md: '2xl' }}
              color='fg.default'
            >
              Let&apos;s Build Something{' '}
              <Text
                as='span'
                color={accentColor}
              >
                Amazing
              </Text>{' '}
              Together
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color='fg.muted'
              maxW='3xl'
              lineHeight='relaxed'
            >
              I&apos;m always excited to discuss new opportunities, innovative projects, or just
              chat about technology. Whether you have a specific project in mind or want to explore
              possibilities, I&apos;d love to hear from you.
            </Text>
          </VStack>

          {/* Contact Cards */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            gap={8}
          >
            <ContactCard
              icon={<LuMail />}
              title='Email Me'
              description='Drop me a line and I will get back to you as soon as possible. Perfect for detailed project discussions.'
              action={{
                label: 'Send Email',
                href: 'mailto:otavio@baziewi.cz',
                external: true,
              }}
            />

            <ContactCard
              icon={<LuLinkedin />}
              title='Connect on LinkedIn'
              description='Let us connect professionally and stay updated on each other journey in the tech world.'
              action={{
                label: 'Connect',
                href: 'https://www.linkedin.com/in/otaviobf',
                external: true,
              }}
            />

            <ContactCard
              icon={<LuGithub />}
              title='Collaborate on GitHub'
              description='Check out my open-source projects, contribute, or start a new collaboration together.'
              action={{
                label: 'View Profile',
                href: 'https://github.com/worgho2',
                external: true,
              }}
            />
          </SimpleGrid>

          {/* Additional Info */}
          <Box
            bg='bg.subtle'
            borderRadius='2xl'
            p={8}
            border='1px solid'
            borderColor='border.subtle'
          >
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align='center'
              justify='space-between'
              gap={8}
            >
              <VStack
                align={{ base: 'center', md: 'start' }}
                gap={4}
              >
                <Heading
                  size='lg'
                  color='fg.default'
                >
                  Ready to Start a Project?
                </Heading>
                <Text
                  color='fg.muted'
                  textAlign={{ base: 'center', md: 'left' }}
                >
                  I&apos;m currently available for new opportunities and exciting challenges.
                  Let&apos;s discuss how we can bring your ideas to life.
                </Text>
              </VStack>

              <VStack
                gap={4}
                align='center'
              >
                <HStack
                  gap={6}
                  color='fg.muted'
                >
                  <HStack gap={2}>
                    <LuMapPin />
                    <Text fontSize='sm'>Remote / Curitiba,Brazil</Text>
                  </HStack>
                  <HStack gap={2}>
                    <LuCalendar />
                    <Text fontSize='sm'>Available Now</Text>
                  </HStack>
                </HStack>

                <Link
                  href='mailto:otavio@baziewi.cz?subject=Project Inquiry'
                  _hover={{ textDecoration: 'none' }}
                >
                  <Button
                    size='lg'
                    colorPalette='blue'
                    _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                    transition='all 0.2s'
                    px='20'
                  >
                    Start a Conversation <LuArrowRight />
                  </Button>
                </Link>
              </VStack>
            </Flex>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};
