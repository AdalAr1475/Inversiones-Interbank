// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentSigner {
    address public owner;
    mapping(bytes32 => bool) public signedDocuments;

    event DocumentSigned(bytes32 documentHash, address signer);

    constructor() {
        owner = msg.sender;
    }

    function signDocument(bytes32 documentHash) public {
        require(!signedDocuments[documentHash], "Document already signed");
        signedDocuments[documentHash] = true;
        emit DocumentSigned(documentHash, msg.sender);
    }

    function isSigned(bytes32 documentHash) public view returns (bool) {
        return signedDocuments[documentHash];
    }
}
