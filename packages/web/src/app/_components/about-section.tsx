'use client';

import { Box, Container, Flex, Heading, Text, VStack, HStack, SimpleGrid } from '@chakra-ui/react';
import { LuCode, LuRocket, LuBrain, LuTarget } from 'react-icons/lu';

interface HighlightCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const HighlightCard: React.FC<HighlightCardProps> = ({ icon, title, description }) => {
  return (
    <VStack
      p={6}
      bg='bg.subtle'
      borderRadius='xl'
      border='1px solid'
      borderColor='border.subtle'
      align='start'
      gap={4}
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'lg',
        borderColor: '#667eea',
      }}
      transition='all 0.3s ease'
    >
      <Box
        p={3}
        bg='#667eea'
        color='white'
        borderRadius='lg'
        fontSize='xl'
      >
        {icon}
      </Box>
      <Heading
        size='md'
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
  );
};

export const AboutSection: React.FC = () => {
  return (
    <Box
      py={{ base: 16, md: 24 }}
      bg='bg.default'
    >
      <Container maxW='6xl'>
        <VStack
          gap={16}
          align='stretch'
        >
          {/* Section Header */}
          <VStack
            gap={4}
            textAlign='center'
          >
            <Heading
              as='h2'
              size={{ base: 'xl', md: '2xl' }}
              color='fg.default'
            >
              About Me
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color='fg.muted'
              maxW='3xl'
            >
              Passionate about creating innovative solutions that bridge the gap between complex
              technical challenges and elegant user experiences.
            </Text>
          </VStack>

          {/* Main Content */}
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            gap={12}
            align='center'
          >
            {/* Left side - Story */}
            <VStack
              flex={1}
              align='start'
              gap={6}
              textAlign={{ base: 'center', lg: 'left' }}
            >
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                color='fg.default'
                lineHeight='relaxed'
              >
                I'm{' '}
                <Text
                  as='span'
                  color='#667eea'
                  fontWeight='bold'
                >
                  Otávio Baziewicz
                </Text>
                , a full-stack architect with a passion for pushing the boundaries of what's
                possible in software development.
              </Text>

              <Text
                fontSize='lg'
                color='fg.muted'
                lineHeight='relaxed'
              >
                My journey spans from crafting high-performance algorithms in Rust and compiling
                them to WebAssembly, to building scalable serverless architectures on AWS. I believe
                in the power of choosing the right tool for each challenge, whether it's Java with
                Micronaut for robust microservices or Next.js for dynamic web experiences.
              </Text>

              <Text
                fontSize='lg'
                color='fg.muted'
                lineHeight='relaxed'
              >
                When I'm not coding, you'll find me exploring new technologies, contributing to
                open-source projects, or sharing my knowledge through technical writing. I'm
                constantly learning and evolving, always seeking to turn complex problems into
                elegant, maintainable solutions.
              </Text>
            </VStack>

            {/* Right side - Highlights */}
            <Box flex={1}>
              <SimpleGrid
                columns={{ base: 1, md: 2 }}
                gap={6}
              >
                <HighlightCard
                  icon={<LuCode />}
                  title='Full-Stack Expertise'
                  description='From Rust-powered WebAssembly to modern React applications, I work across the entire technology stack.'
                />

                <HighlightCard
                  icon={<LuRocket />}
                  title='Performance Focused'
                  description='Obsessed with creating fast, efficient solutions that scale beautifully and provide exceptional user experiences.'
                />

                <HighlightCard
                  icon={<LuBrain />}
                  title='Problem Solver'
                  description='I thrive on complex challenges, using algorithmic thinking and creative approaches to find elegant solutions.'
                />

                <HighlightCard
                  icon={<LuTarget />}
                  title='Quality Driven'
                  description='Every line of code is written with maintainability, scalability, and best practices in mind.'
                />
              </SimpleGrid>
            </Box>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};
