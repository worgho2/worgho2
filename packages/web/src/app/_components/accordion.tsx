'use client';

import { Accordion, HStack } from '@chakra-ui/react';
import * as React from 'react';
import { LuChevronDown } from 'react-icons/lu';

interface AccordionItemTriggerProps extends Accordion.ItemTriggerProps {
  indicatorPlacement?: 'start' | 'end';
  disableItemIncidator?: boolean;
}

export const AccordionItemTrigger = React.forwardRef<HTMLButtonElement, AccordionItemTriggerProps>(
  function AccordionItemTrigger(props, ref) {
    const { children, indicatorPlacement = 'end', disableItemIncidator, ...rest } = props;
    return (
      <Accordion.ItemTrigger
        {...rest}
        ref={ref}
      >
        {!disableItemIncidator && indicatorPlacement === 'start' && (
          <Accordion.ItemIndicator rotate={{ base: '-90deg', _open: '0deg' }}>
            <LuChevronDown />
          </Accordion.ItemIndicator>
        )}
        <HStack
          gap='4'
          flex='1'
          textAlign='start'
          width='full'
        >
          {children}
        </HStack>
        {!disableItemIncidator && indicatorPlacement === 'end' && (
          <Accordion.ItemIndicator>
            <LuChevronDown />
          </Accordion.ItemIndicator>
        )}
      </Accordion.ItemTrigger>
    );
  }
);

interface AccordionItemContentProps extends Accordion.ItemContentProps {}

export const AccordionItemContent = React.forwardRef<HTMLDivElement, AccordionItemContentProps>(
  function AccordionItemContent(props, ref) {
    return (
      <Accordion.ItemContent>
        <Accordion.ItemBody
          {...props}
          ref={ref}
        />
      </Accordion.ItemContent>
    );
  }
);

export const AccordionRoot = Accordion.Root;
export const AccordionItem = Accordion.Item;
