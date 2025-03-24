use crate::{board_type::BoardType, graph::Graph, node::Node};
use std::{cell::RefCell, rc::Rc};

pub struct Game {
    board: Rc<RefCell<Vec<Vec<i8>>>>,
    board_type: BoardType,
}

impl Game {
    pub fn new(board: Vec<Vec<i8>>, board_type: BoardType) -> Game {
        if board_type.get_order() != board.len().try_into().unwrap() {
            panic!("Board size does not match board type");
        }

        for i in 0..board.len() {
            for j in 0..board.len() {
                if board[i][j] < -1 || board[i][j] > board.len().try_into().unwrap() {
                    panic!("Board contains invalid values");
                }
            }
        }

        Game {
            board: Rc::new(RefCell::new(board)),
            board_type,
        }
    }

    pub fn get_board(&self) -> Vec<Vec<i8>> {
        self.board.borrow().clone()
    }

    pub fn solve(&self) -> bool {
        let graph = Graph::new(
            self.board.clone(),
            self.board_type.get_edge_model(),
            self.board_type.get_order(),
        );

        self.run(Rc::new(RefCell::new(graph)))
    }

    fn run(&self, graph: Rc<RefCell<Graph>>) -> bool {
        let node = self.get_next_node(graph.clone());

        match node {
            None => true,
            Some(node) => {
                let colors = node.borrow().get_available_colors();

                for color in colors.iter() {
                    node.borrow_mut().set_color(*color);

                    if self.run(graph.clone()) {
                        return true;
                    } else {
                        node.borrow_mut().unset_color();
                    }
                }

                false
            }
        }
    }

    // Get the reference to the node without color and highest saturation
    fn get_next_node(&self, graph: Rc<RefCell<Graph>>) -> Option<Rc<RefCell<Node>>> {
        let mut max_saturation = -1;
        let mut max_saturation_node: Option<Rc<RefCell<Node>>> = None;

        for node in graph.borrow().nodes.iter() {
            if !node.borrow().has_color() {
                let saturation = node.borrow().get_saturation();
                if saturation > max_saturation {
                    max_saturation = saturation;
                    max_saturation_node = Some(node.clone());
                }
            }
        }

        max_saturation_node
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[wasm_bindgen_test::wasm_bindgen_test]
    fn test_4_regular() {
        let board = vec![
            vec![4, 1, 3, -1],
            vec![3, -1, 1, 4],
            vec![2, 3, 4, -1],
            vec![1, -1, 2, 3],
        ];

        let board_type = BoardType::B4Regular;

        let game = Game::new(board, board_type);

        let success = game.solve();

        let expected_board = vec![
            vec![4, 1, 3, 2],
            vec![3, 2, 1, 4],
            vec![2, 3, 4, 1],
            vec![1, 4, 2, 3],
        ];

        assert_eq!(success, true);
        assert_eq!(game.get_board(), expected_board);
    }
}
