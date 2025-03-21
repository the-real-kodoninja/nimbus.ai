# Contributing to nimbus.ai ☁️

We welcome contributions from visionaries, innovators, and dreamers to help us realize the ambitious goals of nimbus.ai, the embodiment of Aviyon's mission.

## Getting Started

1.  **Fork the Repository:** Start by forking the nimbus.ai repository to your own GitHub account.
2.  **Clone Your Fork:** Clone your forked repository to your local machine:

    ```bash
    git clone [https://github.com/the-real-kodoninja/nimbus.ai.git](https://www.google.com/search?q=hhttps://github.com/the-real-kodoninja/nimbus.ai.git)
    cd nimbus.ai
    ```

3.  **Create a Branch:** Create a new branch for your contributions:

    ```bash
    git checkout -b feature/your-feature-name
    ```

    Replace `feature/your-feature-name` with a descriptive name for your branch.

## Making Changes

1.  **Make Your Changes:** Implement your feature, fix a bug, or improve the documentation.
2.  **Test Your Changes:** If you're adding code, ensure you've written appropriate tests and that all tests pass:

    ```bash
    # Example test commands (adjust as needed)
    # For Python:
    pytest api/python/tests/
    # For Rust:
    cargo test --workspace
    # For Motoko:
    dfx test api/motoko/tests/
    ```

3.  **Format Your Code:** Follow the project's coding style and formatting conventions.

    * For Python, use `black` and `flake8`:

        ```bash
        pip install black flake8
        black api/python/src/
        flake8 api/python/src/
        ```

    * For Rust, use `cargo fmt`:

        ```bash
        cargo fmt --all
        ```

    * For Motoko, ensure your code is formatted according to the project's conventions.

4.  **Commit Your Changes:** Commit your changes with a clear and descriptive commit message:

    ```bash
    git add .
    git commit -m "Add your feature/fix/improvement"
    ```

5.  **Push Your Changes:** Push your changes to your remote branch:

    ```bash
    git push origin feature/your-feature-name
    ```

## Submitting a Pull Request

1.  **Create a Pull Request:** Go to your forked repository on GitHub and create a new pull request from your branch to the `main` branch of the original nimbus.ai repository.
2.  **Describe Your Changes:** Provide a clear and detailed description of your changes in the pull request.
3.  **Code Review:** Your pull request will be reviewed by the project maintainers. Be prepared to address any feedback or make necessary changes.
4.  **Merge:** Once your pull request is approved, it will be merged into the `main` branch.

## Coding Standards

* Follow the project's coding style and formatting conventions.
* Write clear and concise code.
* Add comments to explain complex logic.
* Write tests for all new features and bug fixes.
* Ensure that all tests pass before submitting a pull request.
* Keep commit messages clear and descriptive.

## Documentation

* Update the documentation (`docs/`) to reflect any changes you make.
* Add comments to your code to explain its functionality.
* Use Markdown for documentation.

## Reporting Issues

If you find a bug or have a suggestion, please open an issue on GitHub. Provide as much detail as possible, including steps to reproduce the issue.

## Community

We encourage you to engage with the nimbus.ai community. Share your ideas, ask questions, and help others.

## License

By contributing to nimbus.ai, you agree that your contributions will be licensed under the MIT License.

## Thank You

Thank you for your contributions to nimbus.ai! Your help is invaluable in realizing the vision of Aviyon.