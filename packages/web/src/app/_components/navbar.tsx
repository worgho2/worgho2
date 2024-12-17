'use client';

import {
  Box,
  Collapsible,
  Container,
  Flex,
  FlexProps,
  For,
  HStack,
  Link,
  Portal,
  Tabs,
  Text,
  useBreakpointValue,
  VStack,
} from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import React from 'react';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { LuChevronDown, LuMenu, LuX } from 'react-icons/lu';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from './menu';
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from './accordion';

interface NavbarMenuItem {
  pathname: string;
  label: string;
  active?: boolean;
  children?: Omit<NavbarMenuItem, 'active' | 'children'>[];
}

interface NavbarProps {
  height: FlexProps['height'];
  logoImageSrc: string;
}

export const Navbar: React.FC<NavbarProps> = (props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  const items: NavbarMenuItem[] = [
    {
      pathname: '/',
      label: 'Home',
      active: pathname === '/',
    },
    {
      pathname: '/blog',
      label: 'Blog',
      active: pathname.startsWith('/blog'),
    },
  ];

  return (
    <nav>
      <Flex
        position='fixed'
        top='0'
        left='0'
        width='100vw'
        zIndex='2'
      >
        <Box
          position='absolute'
          top='0'
          width={'100%'}
          display='flex'
          bgColor={'white'}
          boxShadow={'lg'}
        >
          <Container
            ref={ref}
            position={'relative'}
            maxWidth='8xl'
          >
            <Flex
              alignItems='center'
              width={'100%'}
              justifyContent='space-between'
              flex={1}
              py={4}
              height={props.height}
            >
              <Link
                unstyled
                asChild
              >
                <NextLink href={'/'}>
                  <Box asChild>
                    <NextImage
                      src={props.logoImageSrc}
                      alt={props.logoImageSrc}
                      width={210}
                      height={70}
                      style={{
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                </NextLink>
              </Link>

              <DesktopNavbarMenu
                items={items}
                navbarFlexRef={ref}
              />

              <MobileNavbarMenu
                items={items}
                navbarFlexRef={ref}
              />
            </Flex>
          </Container>
        </Box>
      </Flex>
    </nav>
  );
};

interface DesktopNavbarMenuProps {
  items: NavbarMenuItem[];
  navbarFlexRef: React.RefObject<HTMLElement>;
}

const DesktopNavbarMenu: React.FC<DesktopNavbarMenuProps> = (props) => {
  return (
    <Tabs.Root
      display={{ base: 'none', lg: 'flex' }}
      variant={'plain'}
      value={props.items.find((item) => item.active)?.label}
    >
      <Tabs.List>
        <For each={props.items}>
          {(item) =>
            !item.children ? (
              <Link
                asChild
                unstyled
                key={`desktop-menu-item-${item.label}`}
              >
                <NextLink href={item.pathname}>
                  <Tabs.Trigger
                    key={item.label}
                    value={item.label}
                  >
                    <Text
                      color={'gray.900'}
                      fontWeight={'semibold'}
                      textTransform={'uppercase'}
                      fontSize={{ base: 'sm', xl: 'lg' }}
                    >
                      {item.label}
                    </Text>
                  </Tabs.Trigger>
                </NextLink>
              </Link>
            ) : (
              <MenuRoot
                key={`desktop-menu-item-${item.label}`}
                positioning={{
                  placement: 'bottom',
                  strategy: 'absolute',

                  offset: {
                    mainAxis: 10,
                    crossAxis: 0,
                  },
                }}
              >
                <MenuTrigger>
                  <Tabs.Trigger
                    key={item.label}
                    value={item.label}
                    asChild
                  >
                    <HStack>
                      <Text
                        color={'gray.900'}
                        fontWeight={'semibold'}
                        textTransform={'uppercase'}
                        fontSize={{ base: 'sm', xl: 'lg' }}
                      >
                        {item.label}
                      </Text>

                      <LuChevronDown />
                    </HStack>
                  </Tabs.Trigger>
                </MenuTrigger>

                <MenuContent>
                  <For each={item.children ?? []}>
                    {(child) => (
                      <MenuItem
                        asChild
                        value={child.label}
                        key={`desktop-menu-item-${item.label}-child-${child.label}`}
                        px={4}
                      >
                        <Link
                          asChild
                          unstyled
                        >
                          <NextLink href={child.pathname}>
                            <Text
                              color={'gray.900'}
                              fontWeight={'medium'}
                              textTransform={'uppercase'}
                              fontSize={{ base: 'sm', xl: 'md' }}
                            >
                              {child.label}
                            </Text>
                          </NextLink>
                        </Link>
                      </MenuItem>
                    )}
                  </For>
                </MenuContent>
              </MenuRoot>
            )
          }
        </For>

        <Tabs.Indicator
          boxShadow={'none'}
          borderBottomColor={'border.subtle'}
          borderBottomRadius={'2px'}
          borderBottomWidth={'2px'}
          animation={'fade-in'}
        />
      </Tabs.List>
    </Tabs.Root>
  );
};

interface MobileNavbarMenuProps {
  items: NavbarMenuItem[];
  navbarFlexRef: React.RefObject<HTMLElement>;
}

const MobileNavbarMenu: React.FC<MobileNavbarMenuProps> = (props) => {
  const [open, setOpen] = React.useState<boolean>(false);

  const forceClose =
    useBreakpointValue<boolean>({
      base: false,
      lg: true,
    }) ?? false;

  return (
    <Collapsible.Root
      display={{ base: 'flex', lg: 'none' }}
      animation={'ease'}
      onOpenChange={(e) => setOpen(e.open)}
      open={forceClose ? false : open}
    >
      <Collapsible.Trigger>{open ? <LuX size={30} /> : <LuMenu size={30} />}</Collapsible.Trigger>

      <Portal container={props.navbarFlexRef}>
        <Collapsible.Content>
          <AccordionRoot collapsible>
            <For each={props.items}>
              {(item) => (
                <AccordionItem
                  key={`mobile-navbar-${item.label}`}
                  value={item.label}
                >
                  {!item.children ? (
                    <Link
                      asChild
                      unstyled
                    >
                      <NextLink href={item.pathname}>
                        <AccordionItemTrigger
                          disableItemIncidator={!item.children}
                          onClick={() => {
                            !item.children ? setOpen(false) : undefined;
                          }}
                        >
                          <Text
                            color={'gray.900'}
                            fontWeight={'semibold'}
                            textTransform={'uppercase'}
                            fontSize={{ base: 'sm', xl: 'lg' }}
                          >
                            {item.label}
                          </Text>
                        </AccordionItemTrigger>
                      </NextLink>
                    </Link>
                  ) : (
                    <AccordionItemTrigger
                      disableItemIncidator={!item.children}
                      onClick={() => {
                        !item.children ? setOpen(false) : undefined;
                      }}
                    >
                      <Text
                        color={'gray.900'}
                        fontWeight={'semibold'}
                        textTransform={'uppercase'}
                        fontSize={{ base: 'sm', xl: 'lg' }}
                      >
                        {item.label}
                      </Text>
                    </AccordionItemTrigger>
                  )}

                  <AccordionItemContent display={!item.children ? 'none' : undefined}>
                    <VStack
                      gap={6}
                      align={'start'}
                      paddingLeft={4}
                      textAlign={'start'}
                      width={'full'}
                    >
                      <For each={item.children ?? []}>
                        {(child) => (
                          <Link
                            key={`mobile-navbar-item-${item.label}-child-${child.label}`}
                            asChild
                            unstyled
                            onClick={() => {
                              setOpen(false);
                            }}
                          >
                            <NextLink href={child.pathname}>
                              <Text
                                color={'gray.900'}
                                fontWeight={'semibold'}
                                textTransform={'uppercase'}
                                fontSize={'sm'}
                              >
                                {child.label}
                              </Text>
                            </NextLink>
                          </Link>
                        )}
                      </For>
                    </VStack>
                  </AccordionItemContent>
                </AccordionItem>
              )}
            </For>
          </AccordionRoot>
        </Collapsible.Content>
      </Portal>
    </Collapsible.Root>
  );
};
