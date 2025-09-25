#!/bin/bash

echo "Starting the server..."
cd ChainLink-Server
npm run start &

cd ..

echo "Starting the client in development mode..."
cd ChainLink-Client
npm run dev &

echo "Server and Client are running in development mode."
