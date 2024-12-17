'use client';

import { Container, Stack, Text, IconButton, Link, Flex, For } from '@chakra-ui/react';
import dayjs from 'dayjs';
import React from 'react';
import { LuGithub, LuLinkedin } from 'react-icons/lu';
import utc from 'dayjs/plugin/utc';
import NextLink from 'next/link';

dayjs.extend(utc);

interface FooterProps {
  githubUrl: string;
  linkedinUrl: string;
}

export const Footer: React.FC<FooterProps> = (props) => {
  return (
    <footer>
      <Flex
        bgColor={'white'}
        py={4}
      >
        <Container maxW='8xl'>
          <Stack
            direction={{
              base: 'column-reverse',
              md: 'row',
            }}
            justify={{
              base: 'center',
              md: 'space-between',
            }}
            align={'center'}
            gap={6}
          >
            <Text
              color={'gray.400'}
              fontSize={'md'}
            >
              {`© ${dayjs().utc().year()} Otávio Baziewicz Filho`}
            </Text>

            <Stack
              direction={'row'}
              justify={'center'}
              gap={6}
            >
              <For
                each={[
                  {
                    href: props.githubUrl,
                    label: props.githubUrl,
                    icon: LuGithub,
                  },
                  {
                    href: props.linkedinUrl,
                    label: props.linkedinUrl,
                    icon: LuLinkedin,
                  },
                ]}
              >
                {(item) => (
                  <Link
                    asChild
                    key={item.label}
                  >
                    <NextLink
                      href={item.href}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <IconButton
                        aria-label={item.label}
                        size='xl'
                        rounded={'full'}
                        variant='outline'
                      >
                        <item.icon />
                      </IconButton>
                    </NextLink>
                  </Link>
                )}
              </For>
            </Stack>
          </Stack>
        </Container>
      </Flex>
    </footer>
  );
};
