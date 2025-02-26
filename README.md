# CHAINLINK README
### PLEASE READ THE ENTIRE CONTENTS OF THE README BEFORE CONTRIBUTING TO THE REPOS 
## Contents 
- [Description](#description)
- [CHAINLINK Links](#chainlinklinks)
- [READMEs](#readmes)
- [Tech Stack](#techstack)
- [Dev Environment Setup](#devenvironment)
- [Pull Request/Contribution Guidelines](#guidelines)

<a id="description"></a>
## Description 
CONNEXX-CHAINLINK is a website for bikers that would like to plan group cycling sessions. CHAINLINK's main focus is the pre-ride aspect of transportation apps. It allows users to create group rides and invite specific people to their group rides.  

<a id="chainlinklinks"></a>
## CHAINLINK Links
Production site: https://chainlink.connexx-ai.com

Dev site: https://dev.chainlink.connexx-ai.com

<a id="readmes"></a>
## Links to other ReadMe
[Github/Workflow](./.github/workflows/README.md)

[Client](./ChainLink-Client/README.md)

[Server](./ChainLink-Server/README.md) 

<a id="techstack"></a>
## Tech Stack
- React.js client
- Node.js server on AWS EC2
- Apollo Graphql
- MongoDB

<a id="devenvironment"></a>
## Dev Environment
`npm install` in both client and server directories.

### Start server
From /ChainLink-Server

`npm run start`

### Start client
From /ChainLink-Client

`npm run dev`

### Troubleshooting
If there are any issues with the commands above, make sure you have the proper Node.js version installed. To check what version is installed run `node -v`. Make sure you have the latest version of node installed [Node installation guide](https://nodejs.org/en/download/).

<a id="guidelines"></a>
## Pull Request/Contribution Guidelines 
### ***IMPORTANT*** 
1. Create separate branches for different features/tests
2. Keep pull requests centralized on one issue/feature
3. Use prettier/eslinting to clean up code and for formatting
4. Use meaningful variable names and file names
5. Write unit tests for each feature before merging with main branch
6. Before merging to main branch, pass SonarQube tests with an 80% or more
7. Update/Create READMEs with any information regarding setup or documentation on APIs  


