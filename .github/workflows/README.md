The workflows within this folder represent the different stages of the ci/cd pipeline for the project. Each workflow is triggered by specific events and performs a series of steps to ensure the codebase is in a healthy state.

## Workflows

<!-- TODO: Change the filenames to match accordingly -->

- **[eslint.yml](eslint.yml)**: This workflow is triggered on every push to the repository. It runs a series of checks pertaining to linting. It ensures that the codebase follows the project's coding standards. Eslint and Prettier are ran in this workflow. While eslint checks for errors and warnings in the codebase, prettier ensures that the codebase is formatted correctly. On Github, when you make a push to the repository, this workflow will run and check the codebase for any linting issues. Due to the nature of the project, this workflow wll not fail the requirements for merging a pull request. It will only provide feedback on the codebase. Be sure to read the output of the workflow to see if there are any issues that need to be addressed. It is recommended to address the issues found by the linter before merging to main.

We purposefully, turned off "@typescript-eslint/no-explicit-any" rule in the eslint configuration file. This is because we are using the `any` type in the project. This is a temporary solution and should be removed once the project is refactored to use TypeScript properly. When we created this workflow, the project showed hundreds of errors and warnings. We decided to turn off this rule to make it easier to address the other issues. While not ideal, this is a temporary solution to make the project more manageable. It is recommended to address explicit any rules when there is extra time.

- **[sonarqube.yml](sonarqube.yml)**: This workflow is triggered on every push to the main branch. This workflow will run SonarQube to analyze the codebase for potential issues and vulnerabilities. It ensures that the code is of high quality and meets the project's standards. This workflow will fail if the codebase does not meet the project's standards. Be sure to read the output of the workflow to see if there are any issues that need to be addressed. While this workflow can fail merges to main, someone with high enough permissions can force a merge. It is recommended to address the issues found by SonarQube before merging to main.

### Thought Process:

- SonarQube: This step runs SonarQube to analyze the codebase for potential issues and vulnerabilities. It ensures that the code is of high quality and meets the project's standards.
- Linting: This step runs a linter to check the code for potential issues and ensure that it follows the project's coding standards.
  This is done using eslint, prettier and stylelint.
- Testing: This step runs the project's test suite to ensure that the code is working as expected. It helps to catch potential issues early in the development process.

Documentation for this workflow can be found [here](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions).
