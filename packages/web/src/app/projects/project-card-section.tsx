'use client';

import { Card, Container, Flex, FlexProps, Link } from '@chakra-ui/react';
import React from 'react';
import { useInView } from 'motion/react';
import NextLink from 'next/link';
import { Button } from '@/components';

export interface ProjectCardSectionProps extends FlexProps {
  name: string;
  description: React.ReactNode;
  link: {
    href: string;
    external?: boolean;
  };
}

export const ProjectCardSection: React.FC<ProjectCardSectionProps> = ({
  name,
  description,
  link,
  ...flexProps
}) => {
  const flexRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(flexRef, { once: true });
  const dataState = inView ? 'open' : 'closed';

  return (
    <Flex
      ref={flexRef}
      width='100%'
      {...flexProps}
    >
      <Container maxW='8xl'>
        <Card.Root
          maxW={'8xl'}
          opacity={0}
          data-state={dataState}
          _open={{
            animationName: 'slide-from-right, fade-in',
            animationDuration: '0.5s, 0.3s',
            animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1), ease-in-out',
            animationFillMode: 'forwards',
            animationDelay: flexProps.animationDelay,
          }}
        >
          <Card.Header>
            <Card.Title>{name}</Card.Title>
            <Card.Description>{description}</Card.Description>
          </Card.Header>

          <Card.Footer mt={6}>
            <Link asChild>
              <NextLink
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
              >
                <Button>Open</Button>
              </NextLink>
            </Link>
          </Card.Footer>
        </Card.Root>
      </Container>
    </Flex>
  );
};
