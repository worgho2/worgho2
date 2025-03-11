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
            color: 0,
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

