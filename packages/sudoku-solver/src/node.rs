use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

pub struct Node {
    index: String,
    i: i32,
    j: i32,
    order: i32,
    color: i32,
    saturation: i32,
    neighbors: HashMap<String, Rc<RefCell<Node>>>,
    board: Rc<RefCell<Vec<Vec<i32>>>>,
}

impl Node {
    pub fn new(i: i32, j: i32, order: i32, board: Rc<RefCell<Vec<Vec<i32>>>>) -> Node {
        Node {
            index: format!("{}_{}", i, j),
            i,
            j,
            order,
            color: -1,
            saturation: 0,
            neighbors: HashMap::new(),
            board,
        }
    }

    pub fn get_index(&self) -> String {
        self.index.clone()
    }

    pub fn get_color(&self) -> i32 {
        self.color.clone()
    }

    pub fn get_saturation(&self) -> i32 {
        self.saturation
    }

    pub fn set_color(&mut self, new_color: i32) {
        if new_color == -1 {
            return;
        }

        self.color = new_color;
        self.board.borrow_mut()[self.i as usize][self.j as usize] = new_color;
        self.increase_neighbours_saturation();
    }

    pub fn unset_color(&mut self) {
        self.color = -1;
        self.board.borrow_mut()[self.i as usize][self.j as usize] = -1;
        self.decrease_neighbours_saturation();
    }

    pub fn has_color(&self) -> bool {
        self.color != -1
    }

    pub fn get_available_colors(&self) -> Vec<i32> {
        let mut available_colors_hash_set = HashMap::new();

        for i in 1..=self.order {
            available_colors_hash_set.insert(i, true);
        }

        for (_, node) in self.neighbors.iter() {
            println!("node: {}", node.borrow().get_index());
            if node.borrow().has_color() {
                available_colors_hash_set.remove(&node.borrow().get_color());
            }
        }

        available_colors_hash_set.keys().cloned().collect()
    }

    pub fn increase_saturation(&mut self) {
        self.saturation += 1;
    }

    pub fn decrease_saturation(&mut self) {
        self.saturation -= 1;
    }

    pub fn increase_neighbours_saturation(&mut self) {
        for (_, node) in self.neighbors.iter() {
            node.borrow_mut().increase_saturation();
        }
    }

    pub fn decrease_neighbours_saturation(&mut self) {
        for (_, node) in self.neighbors.iter() {
            node.borrow_mut().decrease_saturation();
        }
    }

    pub fn add_neighbor(&mut self, node: Rc<RefCell<Node>>) {
        let index = node.borrow().get_index();
        self.neighbors.insert(index, node);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[wasm_bindgen_test::wasm_bindgen_test]
    fn test_node_creation() {
        let board = Rc::new(RefCell::new(vec![vec![-1, 1], vec![-1, -1]]));
        let order: i32 = 2;
        let node1 = Node::new(0, 0, order, board.clone());

        assert_eq!(node1.get_index(), "0_0");
        assert_eq!(node1.get_color(), -1);
        assert_eq!(node1.get_saturation(), 0);
        assert_eq!(node1.has_color(), false);
        assert_eq!(node1.get_available_colors().contains(&1), true);
        assert_eq!(node1.get_available_colors().contains(&2), true);
        assert_eq!(node1.get_available_colors().len(), 2);

        let node2 = Node::new(0, 1, order, board.clone());

        assert_eq!(node2.get_index(), "0_1");
        assert_eq!(node2.get_color(), -1);
        assert_eq!(node2.get_saturation(), 0);
        assert_eq!(node2.has_color(), false);
        assert_eq!(node2.get_available_colors().contains(&1), true);
        assert_eq!(node2.get_available_colors().contains(&2), true);
        assert_eq!(node2.get_available_colors().len(), 2);

        let node3 = Node::new(1, 0, order, board.clone());

        assert_eq!(node3.get_index(), "1_0");
        assert_eq!(node3.get_color(), -1);
        assert_eq!(node3.get_saturation(), 0);
        assert_eq!(node3.has_color(), false);
        assert_eq!(node3.get_available_colors().contains(&1), true);
        assert_eq!(node3.get_available_colors().contains(&2), true);
        assert_eq!(node3.get_available_colors().len(), 2);

        let node4 = Node::new(1, 1, order, board.clone());

        assert_eq!(node4.get_index(), "1_1");
        assert_eq!(node4.get_color(), -1);
        assert_eq!(node4.get_saturation(), 0);
        assert_eq!(node4.has_color(), false);
        assert_eq!(node4.get_available_colors().contains(&1), true);
        assert_eq!(node4.get_available_colors().contains(&2), true);
        assert_eq!(node4.get_available_colors().len(), 2);
    }

    #[test]
    #[wasm_bindgen_test::wasm_bindgen_test]
    fn test_node_coloring() {
        let board = Rc::new(RefCell::new(vec![vec![-1, -1], vec![-1, -1]]));
        let order: i32 = 2;
        let node1 = Rc::new(RefCell::new(Node::new(0, 0, order, board.clone())));
        let node2 = Rc::new(RefCell::new(Node::new(0, 1, order, board.clone())));

        node1.borrow_mut().add_neighbor(node2.clone());
        node2.borrow_mut().add_neighbor(node1.clone());

        assert_eq!(node1.borrow().get_color(), -1);
        assert_eq!(node1.borrow().has_color(), false);
        assert_eq!(node2.borrow().get_color(), -1);
        assert_eq!(node2.borrow().has_color(), false);

        node1.borrow_mut().set_color(1);

        assert_eq!(node1.borrow().get_color(), 1);
        assert_eq!(node1.borrow().has_color(), true);
        assert_eq!(node1.borrow().get_saturation(), 0);
        assert_eq!(node2.borrow().get_color(), -1);
        assert_eq!(node2.borrow().has_color(), false);
        assert_eq!(node2.borrow().get_available_colors().contains(&2), true);
        assert_eq!(node2.borrow().get_available_colors().len(), 1);
        assert_eq!(node2.borrow().get_saturation(), 1);
        assert_eq!(board.borrow()[0][0], 1);

        node2.borrow_mut().set_color(2);

        assert_eq!(node2.borrow().get_color(), 2);
        assert_eq!(node2.borrow().has_color(), true);
        assert_eq!(node1.borrow().get_saturation(), 1);
        assert_eq!(board.borrow()[0][1], 2);

        node1.borrow_mut().unset_color();

        assert_eq!(node1.borrow().get_color(), -1);
        assert_eq!(node1.borrow().has_color(), false);
        assert_eq!(node2.borrow().get_saturation(), 0);
        assert_eq!(board.borrow()[0][0], -1);

        node2.borrow_mut().unset_color();

        assert_eq!(node2.borrow().get_color(), -1);
        assert_eq!(node2.borrow().has_color(), false);
        assert_eq!(node1.borrow().get_saturation(), 0);
        assert_eq!(board.borrow()[0][1], -1);
    }
}
