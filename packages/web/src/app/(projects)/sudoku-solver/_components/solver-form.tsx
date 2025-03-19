'use client';

import { Button } from '@/app/_components/button';
import { Field } from '@/app/_components/field';
import {
  Box,
  Card,
  Container,
  createListCollection,
  Flex,
  FlexProps,
  For,
  Group,
  Input,
  Link,
  List,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { useInView } from 'motion/react';
import { SudokuSolverBoardType } from '@/ports/sudoku-solver';
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/app/_components/select';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  SolveSudokuGame,
  SolveSudokuGameInput,
  solveSudokuGameInputSchema,
} from '@/ports/use-cases/solve-sudoku-game';
import { ConsoleLogger } from '@/infrastructure/logger/console-logger';
import { RustSudokuSolver } from '@/infrastructure/sudoku-solver/rust-sudoku-solver';
import { toaster } from '@/app/_components/toaster';
import { useColorModeValue } from '@/app/_components/color-mode';

export interface SolverFormProps extends FlexProps {}

export const SolverForm: React.FC<SolverFormProps> = ({ ...flexProps }) => {
  const flexRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(flexRef, { once: true });
  const dataState = inView ? 'open' : 'closed';

  const formMethods = useForm<SolveSudokuGameInput>({
    defaultValues: {
      board: undefined,
      boardType: undefined,
    },
    resolver: zodResolver(solveSudokuGameInputSchema),
  });

  const logger = new ConsoleLogger();
  const sudokuSolver = new RustSudokuSolver();
  const solveSudokuGame = new SolveSudokuGame(logger, sudokuSolver);

  const onSubmit: SubmitHandler<SolveSudokuGameInput> = async (data, event) => {
    event?.preventDefault();

    const output = await solveSudokuGame.execute({
      board: data.board,
      boardType: data.boardType,
    });

    if (output.error === 'INVALID_GAME') {
      formMethods.setError('board', {
        message: 'The game is invalid, please check the board and try again.',
      });

      return;
    }

    if (output.error === 'SOLUTION_NOT_FOUND') {
      toaster.create({
        id: 'solution-not-found',
        title: 'Solution not found',
        description: `The solution was not found, please check the board and try again.`,
        duration: 2000,
        type: 'error',
      });

      return;
    }

    if (output.error !== undefined) {
      toaster.create({
        id: 'solution-not-found',
        title: output.error,
        description: `Not expected error, please tell me what happened!`,
        duration: 2000,
        type: 'error',
      });

      return;
    }

    toaster.create({
      id: 'solution-found',
      title: 'Solution Found',
      description: `Check out the board`,
      duration: 2000,
      type: 'success',
    });

    formMethods.setValue('board', output.game.board);
  };

  const boardTypeWatch = formMethods.watch('boardType');

  const boardTypeSelectData = React.useMemo<BoardTypeSelectData | undefined>(
    () => boardTypeSelectDataCollection.find(boardTypeWatch) ?? undefined,
    [boardTypeWatch]
  );

  return (
    <Flex
      ref={flexRef}
      width={'100%'}
      {...flexProps}
    >
      <Container
        maxW={'8xl'}
        opacity={0}
        data-state={dataState}
        _open={{
          animationName: 'slide-from-right, fade-in',
          animationDuration: '0.5s, 0.3s',
          animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1), ease-in-out',
          animationFillMode: 'forwards',
        }}
      >
        <Card.Root maxW={'8xl'}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Card.Header>
              <Card.Title>Sudoku Solver</Card.Title>

              <Card.Description
                lineHeight={'taller'}
                as={'div'}
              >
                This is a project powered by a <b>rust-generated WebAssembly</b> executing a{' '}
                <b>(Dsatur Graph Coloring + Backtracking)</b> algorithm to solve up to 16 sudoku
                game variations.
                <br />
                <br />
                Implementation Reference:
                <List.Root>
                  <List.Item>
                    <Link
                      asChild
                      wordBreak={'break-word'}
                    >
                      <NextLink
                        href='https://github.com/worgho2/worgho2/tree/main/packages/sudoku-solver'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        Rust-generated WebAssembly lib
                      </NextLink>
                    </Link>
                  </List.Item>

                  <List.Item>
                    <Link
                      asChild
                      wordBreak={'break-word'}
                    >
                      <NextLink
                        href='https://github.com/worgho2/worgho2/tree/main/packages/web/src/app/(projects)/sudoku-solver'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        Solver Page
                      </NextLink>
                    </Link>
                  </List.Item>
                </List.Root>
                <br />
                <b>
                  ATTENTION: Trying to find a solution for an empty board will take a long time due
                  the algorithm structure, so it&apos;s recommended to start with a board with a few
                  numbers.
                </b>
                <br />
                <br />
                <b>WIP: Input validation and feasibility check.</b>
              </Card.Description>
            </Card.Header>

            <Card.Body mt={6}>
              <Field
                label={'Board Type'}
                required
                invalid={formMethods.formState.errors.boardType !== undefined}
                errorText={formMethods.formState.errors.boardType?.message}
              >
                <Controller
                  control={formMethods.control}
                  name='boardType'
                  render={({ field }) => (
                    <SelectRoot
                      multiple={false}
                      name={field.name}
                      value={[field.value]}
                      onValueChange={({ value, items }) => {
                        if (items.length > 0 && items[0] !== null) {
                          formMethods.setValue(
                            'board',
                            Array.from({ length: items[0].dimension }, () =>
                              Array.from(
                                { length: items[0].dimension },
                                () => '' as unknown as number
                              )
                            )
                          );
                        }
                        field.onChange(value[0]);
                      }}
                      onInteractOutside={() => field.onBlur()}
                      collection={boardTypeSelectDataCollection}
                      size='lg'
                      width='100%'
                      positioning={{ sameWidth: true }}
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder='Select the board type' />
                      </SelectTrigger>

                      <SelectContent>
                        {boardTypeSelectDataCollection.items.map((item) => (
                          <SelectItem
                            item={item}
                            key={item.id}
                            justifyContent='flex-start'
                          >
                            <Box asChild>
                              <NextImage
                                src={`/images/sudoku/${item.id}.png`}
                                alt={item.id}
                                width={100}
                                height={100}
                                style={{
                                  objectFit: 'contain',
                                }}
                              />
                            </Box>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  )}
                />
              </Field>

              <Field
                mt={6}
                label={'Board'}
                required={false}
                invalid={formMethods.formState.errors.board !== undefined}
                errorText={formMethods.formState.errors.board?.message}
              >
                {!!boardTypeSelectData ? (
                  <Flex
                    maxW={'100%'}
                    direction={'column'}
                    overflow={{
                      base: 'scroll',
                      lg: 'hidden',
                    }}
                  >
                    <For each={Array.from({ length: boardTypeSelectData.dimension }, () => '')}>
                      {(row, rowIndex) => (
                        <Group
                          key={rowIndex}
                          attached
                        >
                          <For
                            each={Array.from({ length: boardTypeSelectData.dimension }, () => '')}
                          >
                            {(column, columnIndex) => {
                              const borderLeft =
                                !!boardTypeSelectData.borderLeft[`${rowIndex},${columnIndex}`] ||
                                columnIndex === 0;
                              const borderRight = columnIndex === boardTypeSelectData.dimension - 1;
                              const borderTop =
                                !!boardTypeSelectData.borderTop[`${rowIndex},${columnIndex}`] ||
                                rowIndex === 0;
                              const borderBottom = rowIndex === boardTypeSelectData.dimension - 1;

                              return (
                                <Input
                                  key={`${rowIndex}_${columnIndex}`}
                                  minH={'30px'}
                                  minW={'30px'}
                                  height={{
                                    base: '30px',
                                    md: '40px',
                                    lg: '50px',
                                  }}
                                  aspectRatio={1}
                                  textAlign={'center'}
                                  borderRadius={0}
                                  _focusVisible={{
                                    outline: 'none',
                                    borderColor: 'border.success',
                                  }}
                                  borderLeft={
                                    borderLeft
                                      ? useColorModeValue('2px solid black', '2px solid white')
                                      : undefined
                                  }
                                  borderTop={
                                    borderTop
                                      ? useColorModeValue('2px solid black', '2px solid white')
                                      : undefined
                                  }
                                  borderRight={
                                    borderRight
                                      ? useColorModeValue('2px solid black', '2px solid white')
                                      : undefined
                                  }
                                  borderBottom={
                                    borderBottom
                                      ? useColorModeValue('2px solid black', '2px solid white')
                                      : undefined
                                  }
                                  {...formMethods.register(`board.${rowIndex}.${columnIndex}`)}
                                />
                              );
                            }}
                          </For>
                        </Group>
                      )}
                    </For>
                  </Flex>
                ) : (
                  <Text>Select a board type</Text>
                )}
              </Field>
            </Card.Body>

            <Card.Footer justifyContent='flex-end'>
              <Button
                variant='outline'
                onClick={() => {
                  formMethods.reset();
                }}
                disabled={formMethods.formState.isSubmitting}
              >
                Reset
              </Button>

              <Button
                type='submit'
                variant='solid'
                loading={formMethods.formState.isSubmitting}
                loadingText='Solving...'
              >
                Solve
              </Button>
            </Card.Footer>
          </form>
        </Card.Root>
      </Container>
    </Flex>
  );
};

interface BoardTypeSelectData {
  id: SudokuSolverBoardType;
  name: string;
  dimension: number;
  borderLeft: Record<`${number},${number}`, boolean | undefined>;
  borderTop: Record<`${number},${number}`, boolean | undefined>;
}

const boardTypeSelectDataCollection = createListCollection<BoardTypeSelectData>({
  items: [
    {
      id: '4_regular',
      name: '4x4 Regular',
      dimension: 4,
      borderLeft: {
        '0,2': true,
        '1,2': true,
        '2,2': true,
        '3,2': true,
      },
      borderTop: {
        '2,0': true,
        '2,1': true,
        '2,2': true,
        '2,3': true,
      },
    },
    {
      id: '5_cross',
      name: '5x5 Cross',
      dimension: 5,
      borderLeft: {
        '2,1': true,
        '1,2': true,
        '3,2': true,
        '3,3': true,
        '4,2': true,
        '0,3': true,
        '1,3': true,
        '2,4': true,
      },
      borderTop: {
        '1,2': true,
        '2,0': true,
        '2,1': true,
        '2,3': true,
        '3,1': true,
        '4,2': true,
        '3,3': true,
        '3,4': true,
      },
    },
    {
      id: '6_brickwall',
      name: '6x6 Brickwall',
      dimension: 6,
      borderLeft: {
        '0,3': true,
        '1,3': true,
        '2,3': true,
        '3,3': true,
        '4,3': true,
        '5,3': true,
      },
      borderTop: {
        '2,0': true,
        '2,1': true,
        '2,2': true,
        '2,3': true,
        '2,4': true,
        '2,5': true,
        '4,0': true,
        '4,1': true,
        '4,2': true,
        '4,3': true,
        '4,4': true,
        '4,5': true,
      },
    },
    {
      id: '6_ladder',
      name: '6x6 Ladder',
      dimension: 6,
      borderLeft: {
        '0,4': true,
        '2,4': true,
        '4,4': true,
        '1,2': true,
        '3,2': true,
        '5,2': true,
      },
      borderTop: {
        '2,0': true,
        '2,1': true,
        '2,2': true,
        '2,3': true,
        '2,4': true,
        '2,5': true,
        '4,0': true,
        '4,1': true,
        '4,2': true,
        '4,3': true,
        '4,4': true,
        '4,5': true,
        '1,2': true,
        '1,3': true,
        '3,2': true,
        '3,3': true,
        '5,2': true,
        '5,3': true,
      },
    },
    {
      id: '7_diagonal',
      name: '7x7 Diagonal',
      dimension: 7,
      borderLeft: {
        '2,1': true,
        '5,1': true,
        '6,1': true,
        '0,2': true,
        '3,2': true,
        '4,2': true,
        '4,4': true,
        '5,4': true,
        '0,6': true,
        '1,6': true,
        '6,5': true,
        '4,6': true,
        '2,5': true,
        '3,5': true,
        '1,3': true,
        '2,3': true,
      },
      borderTop: {
        '1,2': true,
        '2,0': true,
        '2,3': true,
        '2,4': true,
        '3,1': true,
        '3,2': true,
        '4,4': true,
        '4,5': true,
        '5,1': true,
        '5,2': true,
        '5,3': true,
        '5,6': true,
        '6,4': true,
        '2,5': true,
      },
    },
    {
      id: '8_brickwall',
      name: '8x8 Brickwall',
      dimension: 8,
      borderLeft: {
        '0,4': true,
        '1,4': true,
        '2,4': true,
        '3,4': true,
        '4,4': true,
        '5,4': true,
        '6,4': true,
        '7,4': true,
      },
      borderTop: {
        '2,0': true,
        '2,1': true,
        '2,2': true,
        '2,3': true,
        '2,4': true,
        '2,5': true,
        '2,6': true,
        '2,7': true,
        '4,0': true,
        '4,1': true,
        '4,2': true,
        '4,3': true,
        '4,4': true,
        '4,5': true,
        '4,6': true,
        '4,7': true,
        '6,0': true,
        '6,1': true,
        '6,2': true,
        '6,3': true,
        '6,4': true,
        '6,5': true,
        '6,6': true,
        '6,7': true,
      },
    },
    {
      id: '8_ladder',
      name: '8x8 Ladder',
      dimension: 8,
      borderLeft: {
        '0,2': true,
        '1,2': true,
        '2,2': true,
        '3,2': true,
        '4,2': true,
        '5,2': true,
        '6,2': true,
        '7,2': true,
        '0,6': true,
        '1,6': true,
        '2,6': true,
        '3,6': true,
        '4,6': true,
        '5,6': true,
        '6,6': true,
        '7,6': true,
      },
      borderTop: {
        '2,2': true,
        '2,3': true,
        '2,4': true,
        '2,5': true,
        '4,0': true,
        '4,1': true,
        '4,2': true,
        '4,3': true,
        '4,4': true,
        '4,5': true,
        '4,6': true,
        '4,7': true,
        '6,2': true,
        '6,3': true,
        '6,4': true,
        '6,5': true,
      },
    },
    {
      id: '8_cross',
      name: '8x8 Cross',
      dimension: 8,
      borderLeft: {
        '2,2': true,
        '5,2': true,
        '0,3': true,
        '1,3': true,
        '6,3': true,
        '7,3': true,
        '3,4': true,
        '4,4': true,
        '0,5': true,
        '1,5': true,
        '6,5': true,
        '7,5': true,
        '2,6': true,
        '5,6': true,
      },
      borderTop: {
        '2,2': true,
        '2,5': true,
        '3,0': true,
        '3,1': true,
        '3,2': true,
        '3,3': true,
        '3,4': true,
        '3,5': true,
        '3,6': true,
        '3,7': true,
        '5,0': true,
        '5,1': true,
        '5,2': true,
        '5,3': true,
        '5,4': true,
        '5,5': true,
        '5,6': true,
        '5,7': true,
        '6,2': true,
        '6,5': true,
      },
    },
    {
      id: '9_regular',
      name: '9x9 Regular',
      dimension: 9,
      borderLeft: {
        '0,3': true,
        '1,3': true,
        '2,3': true,
        '3,3': true,
        '4,3': true,
        '5,3': true,
        '6,3': true,
        '7,3': true,
        '8,3': true,
        '0,6': true,
        '1,6': true,
        '2,6': true,
        '3,6': true,
        '4,6': true,
        '5,6': true,
        '6,6': true,
        '7,6': true,
        '8,6': true,
      },
      borderTop: {
        '3,0': true,
        '3,1': true,
        '3,2': true,
        '3,3': true,
        '3,4': true,
        '3,5': true,
        '3,6': true,
        '3,7': true,
        '3,8': true,
        '6,0': true,
        '6,1': true,
        '6,2': true,
        '6,3': true,
        '6,4': true,
        '6,5': true,
        '6,6': true,
        '6,7': true,
        '6,8': true,
      },
    },
    {
      id: '10_brickwall',
      name: '10x10 Brickwall',
      dimension: 10,
      borderLeft: {
        '0,5': true,
        '1,5': true,
        '2,5': true,
        '3,5': true,
        '4,5': true,
        '5,5': true,
        '6,5': true,
        '7,5': true,
        '8,5': true,
        '9,5': true,
      },
      borderTop: {
        '2,0': true,
        '2,1': true,
        '2,2': true,
        '2,3': true,
        '2,4': true,
        '2,5': true,
        '2,6': true,
        '2,7': true,
        '2,8': true,
        '2,9': true,
        '4,0': true,
        '4,1': true,
        '4,2': true,
        '4,3': true,
        '4,4': true,
        '4,5': true,
        '4,6': true,
        '4,7': true,
        '4,8': true,
        '4,9': true,
        '6,0': true,
        '6,1': true,
        '6,2': true,
        '6,3': true,
        '6,4': true,
        '6,5': true,
        '6,6': true,
        '6,7': true,
        '6,8': true,
        '6,9': true,
        '8,0': true,
        '8,1': true,
        '8,2': true,
        '8,3': true,
        '8,4': true,
        '8,5': true,
        '8,6': true,
        '8,7': true,
        '8,8': true,
        '8,9': true,
      },
    },
    {
      id: '10_ladder',
      name: '10x10 Ladder',
      dimension: 10,
      borderLeft: {
        '3,1': true,
        '6,1': true,
        '0,3': true,
        '1,3': true,
        '2,3': true,
        '3,3': true,
        '4,3': true,
        '5,3': true,
        '6,3': true,
        '7,3': true,
        '8,3': true,
        '9,3': true,
        '0,8': true,
        '1,8': true,
        '2,8': true,
        '3,8': true,
        '4,8': true,
        '5,8': true,
        '6,8': true,
        '7,8': true,
        '8,8': true,
        '9,8': true,
      },
      borderTop: {
        '2,3': true,
        '2,4': true,
        '2,5': true,
        '2,6': true,
        '2,7': true,
        '3,1': true,
        '3,2': true,
        '4,0': true,
        '4,3': true,
        '4,4': true,
        '4,5': true,
        '4,6': true,
        '4,7': true,
        '5,8': true,
        '5,9': true,
        '6,0': true,
        '6,3': true,
        '6,4': true,
        '6,5': true,
        '6,6': true,
        '6,7': true,
        '7,1': true,
        '7,2': true,
        '8,3': true,
        '8,4': true,
        '8,5': true,
        '8,6': true,
        '8,7': true,
      },
    },
    {
      id: '10_ladder_2',
      name: '10x10 Ladder 2',
      dimension: 10,
      borderLeft: {
        '3,1': true,
        '6,1': true,
        '0,3': true,
        '1,3': true,
        '2,3': true,
        '3,3': true,
        '4,3': true,
        '5,3': true,
        '6,3': true,
        '7,3': true,
        '8,3': true,
        '9,3': true,
        '2,4': true,
        '7,4': true,
        '2,6': true,
        '7,6': true,
        '0,7': true,
        '1,7': true,
        '2,7': true,
        '3,7': true,
        '4,7': true,
        '5,7': true,
        '6,7': true,
        '7,7': true,
        '8,7': true,
        '9,7': true,
        '3,9': true,
        '6,9': true,
      },
      borderTop: {
        '2,3': true,
        '2,6': true,
        '3,1': true,
        '3,2': true,
        '3,4': true,
        '3,5': true,
        '3,7': true,
        '3,8': true,
        '4,0': true,
        '4,9': true,
        '5,3': true,
        '5,4': true,
        '5,5': true,
        '5,6': true,
        '6,0': true,
        '6,9': true,
        '7,1': true,
        '7,2': true,
        '7,4': true,
        '7,5': true,
        '7,7': true,
        '7,8': true,
        '8,3': true,
        '8,6': true,
      },
    },
    {
      id: '10_diagonal',
      name: '10x10 Diagonal',
      dimension: 10,
      borderLeft: {
        '3,1': true,
        '5,1': true,
        '7,1': true,
        '9,1': true,
        '2,2': true,
        '4,2': true,
        '6,2': true,
        '8,2': true,
        '1,3': true,
        '3,3': true,
        '5,3': true,
        '7,3': true,
        '0,4': true,
        '2,4': true,
        '4,4': true,
        '6,4': true,
        '0,5': true,
        '1,5': true,
        '2,5': true,
        '3,5': true,
        '4,5': true,
        '5,5': true,
        '6,5': true,
        '7,5': true,
        '8,5': true,
        '9,5': true,
        '3,6': true,
        '5,6': true,
        '7,6': true,
        '9,6': true,
        '2,7': true,
        '4,7': true,
        '6,7': true,
        '8,7': true,
        '1,8': true,
        '3,8': true,
        '5,8': true,
        '7,8': true,
        '0,9': true,
        '2,9': true,
        '4,9': true,
        '6,9': true,
      },
      borderTop: {
        '9,1': true,
        '9,6': true,
        '8,0': true,
        '8,2': true,
        '8,5': true,
        '8,7': true,
        '7,1': true,
        '7,3': true,
        '7,6': true,
        '7,8': true,
        '6,0': true,
        '6,2': true,
        '6,4': true,
        '6,5': true,
        '6,7': true,
        '6,9': true,
        '5,1': true,
        '5,3': true,
        '5,6': true,
        '5,8': true,
        '4,0': true,
        '4,2': true,
        '4,4': true,
        '4,5': true,
        '4,7': true,
        '4,9': true,
        '3,1': true,
        '3,3': true,
        '3,6': true,
        '3,8': true,
        '2,2': true,
        '2,4': true,
        '2,7': true,
        '2,9': true,
        '1,3': true,
        '1,8': true,
      },
    },
    {
      id: '10_diamond',
      name: '10x10 Diamond',
      dimension: 10,
      borderLeft: {
        '3,1': true,
        '6,1': true,
        '2,2': true,
        '7,2': true,
        '1,3': true,
        '8,3': true,
        '0,4': true,
        '1,4': true,
        '2,4': true,
        '3,4': true,
        '4,4': true,
        '5,4': true,
        '6,4': true,
        '7,4': true,
        '8,4': true,
        '9,4': true,
        '0,6': true,
        '1,6': true,
        '2,6': true,
        '3,6': true,
        '4,6': true,
        '5,6': true,
        '6,6': true,
        '7,6': true,
        '8,6': true,
        '9,6': true,
        '1,7': true,
        '8,7': true,
        '2,8': true,
        '7,8': true,
        '3,9': true,
        '6,9': true,
      },
      borderTop: {
        '1,3': true,
        '1,6': true,
        '2,2': true,
        '2,7': true,
        '3,1': true,
        '3,8': true,
        '4,0': true,
        '4,9': true,
        '5,0': true,
        '5,1': true,
        '5,2': true,
        '5,3': true,
        '5,4': true,
        '5,5': true,
        '5,6': true,
        '5,7': true,
        '5,8': true,
        '5,9': true,
        '6,0': true,
        '6,9': true,
        '7,1': true,
        '7,8': true,
        '8,2': true,
        '8,7': true,
        '9,3': true,
        '9,6': true,
      },
    },
    {
      id: '12_brickwall',
      name: '12x12 Brickwall',
      dimension: 12,
      borderLeft: {
        '0,4': true,
        '0,8': true,
        '1,4': true,
        '1,8': true,
        '2,4': true,
        '2,8': true,
        '3,4': true,
        '3,8': true,
        '4,4': true,
        '4,8': true,
        '5,4': true,
        '5,8': true,
        '6,4': true,
        '6,8': true,
        '7,4': true,
        '7,8': true,
        '8,4': true,
        '8,8': true,
        '9,4': true,
        '9,8': true,
        '10,4': true,
        '10,8': true,
        '11,4': true,
        '11,8': true,
      },
      borderTop: {
        '3,0': true,
        '3,1': true,
        '3,2': true,
        '3,3': true,
        '3,4': true,
        '3,5': true,
        '3,6': true,
        '3,7': true,
        '3,8': true,
        '3,9': true,
        '3,10': true,
        '3,11': true,
        '6,0': true,
        '6,1': true,
        '6,2': true,
        '6,3': true,
        '6,4': true,
        '6,5': true,
        '6,6': true,
        '6,7': true,
        '6,8': true,
        '6,9': true,
        '6,10': true,
        '6,11': true,
        '9,0': true,
        '9,1': true,
        '9,2': true,
        '9,3': true,
        '9,4': true,
        '9,5': true,
        '9,6': true,
        '9,7': true,
        '9,8': true,
        '9,9': true,
        '9,10': true,
        '9,11': true,
      },
    },
    {
      id: '12_cross',
      name: '12x12 Cross',
      dimension: 12,
      borderLeft: {
        '0,3': true,
        '1,3': true,
        '2,3': true,
        '3,3': true,
        '6,4': true,
        '7,4': true,
        '8,4': true,
        '9,4': true,
        '10,4': true,
        '11,4': true,
        '0,6': true,
        '1,6': true,
        '2,6': true,
        '3,6': true,
        '4,6': true,
        '5,6': true,
        '6,6': true,
        '7,6': true,
        '8,6': true,
        '9,6': true,
        '10,6': true,
        '11,6': true,
        '0,8': true,
        '1,8': true,
        '2,8': true,
        '3,8': true,
        '4,8': true,
        '5,8': true,
        '8,9': true,
        '9,9': true,
        '10,9': true,
        '11,9': true,
      },
      borderTop: {
        '3,8': true,
        '3,9': true,
        '3,10': true,
        '3,11': true,
        '4,0': true,
        '4,1': true,
        '4,2': true,
        '4,3': true,
        '4,4': true,
        '4,5': true,
        '6,0': true,
        '6,1': true,
        '6,2': true,
        '6,3': true,
        '6,4': true,
        '6,5': true,
        '6,6': true,
        '6,7': true,
        '6,8': true,
        '6,9': true,
        '6,10': true,
        '6,11': true,
        '8,6': true,
        '8,7': true,
        '8,8': true,
        '8,9': true,
        '8,10': true,
        '8,11': true,
        '9,0': true,
        '9,1': true,
        '9,2': true,
        '9,3': true,
      },
    },
    {
      id: '12_ladder',
      name: '12x12 Ladder',
      dimension: 12,
      borderLeft: {
        '0,3': true,
        '0,9': true,
        '1,3': true,
        '1,9': true,
        '2,3': true,
        '2,9': true,
        '3,3': true,
        '3,9': true,
        '4,3': true,
        '4,9': true,
        '5,3': true,
        '5,9': true,
        '6,3': true,
        '6,9': true,
        '7,3': true,
        '7,9': true,
        '8,3': true,
        '8,9': true,
        '9,3': true,
        '9,9': true,
        '10,3': true,
        '10,9': true,
        '11,3': true,
        '11,9': true,
      },
      borderTop: {
        '2,3': true,
        '2,4': true,
        '2,5': true,
        '2,6': true,
        '2,7': true,
        '2,8': true,
        '6,3': true,
        '6,4': true,
        '6,5': true,
        '6,6': true,
        '6,7': true,
        '6,8': true,
        '10,3': true,
        '10,4': true,
        '10,5': true,
        '10,6': true,
        '10,7': true,
        '10,8': true,
        '4,0': true,
        '4,1': true,
        '4,2': true,
        '4,3': true,
        '4,4': true,
        '4,5': true,
        '4,6': true,
        '4,7': true,
        '4,8': true,
        '4,9': true,
        '4,10': true,
        '4,11': true,
        '8,0': true,
        '8,1': true,
        '8,2': true,
        '8,3': true,
        '8,4': true,
        '8,5': true,
        '8,6': true,
        '8,7': true,
        '8,8': true,
        '8,9': true,
        '8,10': true,
        '8,11': true,
      },
    },
    {
      id: '12_short_and_long',
      name: '12x12 Short and long',
      dimension: 12,
      borderLeft: {
        '0,2': true,
        '0,6': true,
        '0,8': true,
        '1,2': true,
        '1,6': true,
        '1,8': true,
        '2,2': true,
        '2,6': true,
        '2,8': true,
        '3,2': true,
        '3,6': true,
        '3,8': true,
        '4,2': true,
        '4,6': true,
        '4,8': true,
        '5,2': true,
        '5,6': true,
        '5,8': true,
        '6,4': true,
        '6,6': true,
        '6,10': true,
        '7,4': true,
        '7,6': true,
        '7,10': true,
        '8,4': true,
        '8,6': true,
        '8,10': true,
        '9,4': true,
        '9,6': true,
        '9,10': true,
        '10,4': true,
        '10,6': true,
        '10,10': true,
        '11,4': true,
        '11,6': true,
        '11,10': true,
      },
      borderTop: {
        '3,2': true,
        '3,3': true,
        '3,4': true,
        '3,5': true,
        '3,8': true,
        '3,9': true,
        '3,10': true,
        '3,11': true,
        '6,0': true,
        '6,1': true,
        '6,2': true,
        '6,3': true,
        '6,4': true,
        '6,5': true,
        '6,6': true,
        '6,7': true,
        '6,8': true,
        '6,9': true,
        '6,10': true,
        '6,11': true,
        '9,0': true,
        '9,1': true,
        '9,2': true,
        '9,3': true,
        '9,6': true,
        '9,7': true,
        '9,8': true,
        '9,9': true,
      },
    },
    {
      id: '16_regular',
      name: '16x16 Regular',
      dimension: 16,
      borderLeft: {
        '0,4': true,
        '1,4': true,
        '2,4': true,
        '3,4': true,
        '4,4': true,
        '5,4': true,
        '6,4': true,
        '7,4': true,
        '8,4': true,
        '9,4': true,
        '10,4': true,
        '11,4': true,
        '12,4': true,
        '13,4': true,
        '14,4': true,
        '15,4': true,
        '0,8': true,
        '1,8': true,
        '2,8': true,
        '3,8': true,
        '4,8': true,
        '5,8': true,
        '6,8': true,
        '7,8': true,
        '8,8': true,
        '9,8': true,
        '10,8': true,
        '11,8': true,
        '12,8': true,
        '13,8': true,
        '14,8': true,
        '15,8': true,
        '0,12': true,
        '1,12': true,
        '2,12': true,
        '3,12': true,
        '4,12': true,
        '5,12': true,
        '6,12': true,
        '7,12': true,
        '8,12': true,
        '9,12': true,
        '10,12': true,
        '11,12': true,
        '12,12': true,
        '13,12': true,
        '14,12': true,
        '15,12': true,
      },
      borderTop: {
        '4,0': true,
        '4,1': true,
        '4,2': true,
        '4,3': true,
        '4,4': true,
        '4,5': true,
        '4,6': true,
        '4,7': true,
        '4,8': true,
        '4,9': true,
        '4,10': true,
        '4,11': true,
        '4,12': true,
        '4,13': true,
        '4,14': true,
        '4,15': true,
        '8,0': true,
        '8,1': true,
        '8,2': true,
        '8,3': true,
        '8,4': true,
        '8,5': true,
        '8,6': true,
        '8,7': true,
        '8,8': true,
        '8,9': true,
        '8,10': true,
        '8,11': true,
        '8,12': true,
        '8,13': true,
        '8,14': true,
        '8,15': true,
        '12,0': true,
        '12,1': true,
        '12,2': true,
        '12,3': true,
        '12,4': true,
        '12,5': true,
        '12,6': true,
        '12,7': true,
        '12,8': true,
        '12,9': true,
        '12,10': true,
        '12,11': true,
        '12,12': true,
        '12,13': true,
        '12,14': true,
        '12,15': true,
      },
    },
  ],
  itemToString: (item) => item.name,
  itemToValue: (item) => item.id,
});
