# CHAINLINK README

### PLEASE READ THE ENTIRE CONTENTS OF THE README BEFORE CONTRIBUTING

<a id="contents"></a>

## Contents

- [Description](#description)
- [CHAINLINK Links](#chainlinklinks)
- [READMEs](#readmes)
- [Tech Stack](#techstack)
- [Dev Environment Setup](#devenvironment)
- [Pull Request/Contribution Guidelines](#guidelines)

<a id="description"></a>

## Description [`⇧`](#contents)

CONNEXX-CHAINLINK is a website for bikers that would like to plan group cycling sessions. CHAINLINK's main focus is the pre-ride aspect of transportation apps. It allows users to create group rides and invite specific people to their group rides.

<a id="chainlinklinks"></a>

## CHAINLINK Links [`⇧`](#contents)

Production site: https://chainlink.connexx-ai.com

Dev site: https://dev.chainlink.connexx-ai.com

*When running the development site and the production site, you must create a new account for each site.* 

<a id="readmes"></a>

## Links to other ReadMe [`⇧`](#contents)

[Github/Workflow](./.github/workflows/README.md)

[Client](./ChainLink-Client/README.md)

[Server](./ChainLink-Server/README.md)

<a id="techstack"></a>

## Tech Stack [`⇧`](#contents)

- React.js client
- Node.js server on AWS EC2
- Apollo Graphql
- MongoDB

<a id="devenvironment"></a>

## Dev Environment [`⇧`](#contents)

`npm install` in both client and server directories.

### Connect to database

1. Install MongoDB locally
2. Create a `.env` file in `/Chainlink-Server`, and copy the contents of `/Chainlink-Server/.env.example` into the file. Change the following variables:

   > `SECRET`: Set to the private value stored on the Atlas backend.  
   > `MONGODB`: Set to the MongoDB connection URI.

3. Create a `.env` file in `/Chainlink-Client`, and copy the contents of `/Chainklink-Client/.env.example` into the file.

### Start server

From /ChainLink-Server

`npm run start`

### Start client

From /ChainLink-Client

`npm run dev`

### Unit Tests

To see more about unit tests and how make new or edit them, see extended Documentations on Doc
https://docs.google.com/document/d/16Fp5jeCvegvXW0t8ZyvFFtjf0gpY09XBIArlS9qdcG0/edit?usp=sharing

### Troubleshooting

If there are any issues with the commands above, make sure you have the proper Node.js version installed. To check what version is installed run `node -v`. Make sure you have the latest version of node installed [Node installation guide](https://nodejs.org/en/download/).

<a id="guidelines"></a>

## Pull Request/Contribution Guidelines [`⇧`](#contents)

### **_IMPORTANT_**

1. Create separate branches for different features/tests
2. Keep pull requests centralized on one issue/feature
3. Use prettier/eslinting to clean up code and for formatting
4. Use meaningful variable names and file names
5. Write unit tests for each feature before merging with main branch
6. Before merging to main branch, pass SonarQube tests with an 80% or more
7. Update/Create READMEs with any information regarding setup or documentation on APIs
