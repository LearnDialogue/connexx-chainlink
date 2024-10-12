Write-Host "Starting the server..."
Start-Process powershell -ArgumentList "cd ChainLink-Server; npm run start"

Write-Host "Starting the client in development mode..."
Start-Process powershell -ArgumentList "cd ChainLink-Client; npm run dev"

Write-Host "Server and Client are running in development mode."
