import { Logger } from '../logger';
import { z } from 'zod';
import { SudokuSolver, sudokuSolverGameSchema, SudokuSolverSolveOutput } from '../sudoku-solver';

export const solveSudokuGameInputSchema = z.object({
  board: sudokuSolverGameSchema.shape.board,
  boardType: sudokuSolverGameSchema.shape.type,
});

export type SolveSudokuGameInput = z.infer<typeof solveSudokuGameInputSchema>;

export type SolveSudokuGameOutput = SudokuSolverSolveOutput;

export class SolveSudokuGame {
  constructor(
    private readonly logger: Logger,
    private readonly sudokuSolver: SudokuSolver
  ) {}

  execute = async (input: SolveSudokuGameInput): Promise<SolveSudokuGameOutput> => {
    this.logger.debug('SolveSudokuGame.execute', { input });

    const output = await this.sudokuSolver.solve({
      board: input.board,
      type: input.boardType,
    });
    return output;
  };
}
