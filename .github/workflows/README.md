The workflows within this folder represent the different stages of the ci/cd pipeline for the project. Each workflow is triggered by specific events and performs a series of steps to ensure the codebase is in a healthy state.

## Workflows

<!-- TODO: Change the filenames to match accordingly -->

- **[ci.yml](ci.yml)**: This workflow is triggered on every push to the repository. It runs a series of checks, including linting, testing, and building the project. It ensures that the codebase is in a healthy state before it can be merged into the main branch.
- **[cd.yml](cd.yml)**: This workflow is triggered on every push to the main branch. It deploys the project to the production environment. It ensures that the codebase is in a healthy state before it can be deployed to production.

### Thought Process:

- SonarQube: This step runs SonarQube to analyze the codebase for potential issues and vulnerabilities. It ensures that the code is of high quality and meets the project's standards.
- Linting: This step runs a linter to check the code for potential issues and ensure that it follows the project's coding standards.
  This is done using eslint, prettier and stylelint.
- Testing: This step runs the project's test suite to ensure that the code is working as expected. It helps to catch potential issues early in the development process.
- Building: This step builds the project to ensure that it can be successfully built and deployed.

Documentation for this workflow can be found [here](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions).
