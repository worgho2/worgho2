use std::{cell::RefCell, rc::Rc};

use crate::node::Node;

pub struct Graph {
    pub nodes: Vec<Rc<RefCell<Node>>>,
}

impl Graph {
    pub fn new(
        board: Rc<RefCell<Vec<Vec<i32>>>>,
        edge_model: Vec<Vec<Vec<(i32, i32)>>>,
        order: i32,
    ) -> Graph {
        let node_matrix: Vec<Vec<Rc<RefCell<Node>>>> = (0..order)
            .map(|i| {
                (0..order)
                    .map(|j| Rc::new(RefCell::new(Node::new(i, j, order, board.clone()))))
                    .collect()
            })
            .collect();

        for i in 0..order {
            for j in 0..order {
                let mut node = node_matrix[i as usize][j as usize].borrow_mut();
                let edge_list = edge_model[i as usize][j as usize].clone();

                for (neighbor_i, neighbor_j) in edge_list {
                    let neighbor = node_matrix[neighbor_i as usize][neighbor_j as usize].clone();
                    node.add_neighbor(neighbor);
                }

                let color = board.borrow()[i as usize][j as usize];
                node.set_color(color);
            }
        }

        Graph {
            nodes: node_matrix.iter().flatten().map(Rc::clone).collect(),
        }
    }
}
