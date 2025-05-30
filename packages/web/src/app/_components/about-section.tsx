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
              Passionate backend engineer specializing in Node.js and TypeScript, dedicated to
              crafting well-architected solutions that solve real-world problems with elegance and
              scalability.
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
                  Otávio
                </Text>
                , a software engineer who specializes in Node.js and TypeScript backend development.
                I'm passionate about creating solutions from scratch with well-architected code as
                my core principle.
              </Text>

              <Text
                fontSize='lg'
                color='fg.muted'
                lineHeight='relaxed'
              >
                My expertise lies in implementing robust architectural patterns like Domain-Driven
                Design (DDD), Clean Architecture, and Hexagonal Architecture. I thrive in startup
                environments where rapid prototyping meets rigorous engineering standards, creating
                proof-of-concept software that validates feasibility while maintaining code quality.
              </Text>

              <Text
                fontSize='lg'
                color='fg.muted'
                lineHeight='relaxed'
              >
                Beyond backend development, I design complete application ecosystems - from
                selecting the right tools and designing cloud architecture to implementing release
                management and CI/CD pipelines. I believe in building solutions that are not just
                functional, but maintainable, scalable, and ready for the challenges of tomorrow.
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
                  title='Backend Specialist'
                  description='Expert in Node.js and TypeScript, building robust APIs and microservices with modern development practices.'
                />

                <HighlightCard
                  icon={<LuRocket />}
                  title='Startup Experience'
                  description='Proven track record in fast-paced startup environments, creating MVPs and proof-of-concepts that validate business ideas.'
                />

                <HighlightCard
                  icon={<LuBrain />}
                  title='Architecture Expert'
                  description='Deep knowledge of DDD, Clean Architecture, and Hexagonal Architecture principles for maintainable codebases.'
                />

                <HighlightCard
                  icon={<LuTarget />}
                  title='Full-Stack Solutions'
                  description='End-to-end application design including cloud architecture, DevOps practices, and comprehensive CI/CD pipelines.'
                />
              </SimpleGrid>
            </Box>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};
