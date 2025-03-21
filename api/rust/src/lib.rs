// This file defines the library components of the Rust application, exporting functions and types that can be used in other Rust files or projects.

pub mod utils;

// Example function that can be used in other parts of the project
pub fn example_function() -> &'static str {
    "Hello from nimbus.ai Rust library!"
}