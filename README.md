# MTP_Application
This code is a web-based page for querying from the ledger
To use the application, run index.js

    To run the code, follow the below commands: The chaincode file is assumed to be present in the folder named atcc.
    ./network.sh down
    cd ../atcc
    GO111MODULE=on go mod vendor
    cd ../test-network
    ./network.sh up createChannel -c mychannel -ca -s couchdb
    ./network.sh deployCC -ccn basic -ccp ../atcc -ccl go
    export PATH=${PWD}/../bin:$PATH
    export FABRIC_CFG_PATH=$PWD/../config/
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051

    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"WriteLog","Args":["123","456", "nik", "here"]}'


    peer chaincode query -C mychannel -n basic -c '{"Args":["QueryLogByIP", "123"]}'
