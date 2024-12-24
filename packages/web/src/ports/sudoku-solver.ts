import { z } from 'zod';

export const sudokuSolverBoardTypeSchema = z.enum([
  '4_regular',
  '5_cross',
  '6_brickwall',
  '6_ladder',
  '7_diagonal',
  '8_brickwall',
  '8_ladder',
  '8_cross',
  '9_regular',
  '10_brickwall',
  '10_ladder',
  '10_ladder_2',
  '10_diagonal',
  '10_diamond',
  '12_cross',
  '12_short_and_long',
  '12_ladder',
  '12_brickwall',
  '16_regular',
]);

export type SudokuSolverBoardType = z.infer<typeof sudokuSolverBoardTypeSchema>;

export const sudokuSolverBoardSchema = z.array(z.array(z.number({ coerce: true }).int()));

export type SudokuSolverBoard = z.infer<typeof sudokuSolverBoardSchema>;

export const sudokuSolverGameSchema = z.object({
  board: sudokuSolverBoardSchema,
  type: sudokuSolverBoardTypeSchema,
});

export type SudokuSolverGame = z.infer<typeof sudokuSolverGameSchema>;

export type SudokuSolverSolveOutput =
  | {
      error: undefined;
      game: SudokuSolverGame;
    }
  | {
      error: 'INVALID_GAME' | 'SOLUTION_NOT_FOUND';
    };

export interface SudokuSolver {
  solve(game: SudokuSolverGame): Promise<SudokuSolverSolveOutput>;
  validate(game: SudokuSolverGame): Promise<boolean>;
}
