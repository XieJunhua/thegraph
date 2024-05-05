import {
  NFT,
  Transfer as TransferEvent,
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
} from "../../generated/templates/NFT/NFT"
import { Transfer, Approval, ApprovalForAll, TokenInfo } from "../../generated/schema"



import { Bytes, dataSource } from '@graphprotocol/graph-ts'

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  updateNFTOwner(entity);
}

function updateNFTOwner(action: Transfer): void {
  let _address = dataSource.address();
  let _tokenId = action.tokenId;

  let nft = NFT.bind(_address);

  let id = _address.concat(Bytes.fromUTF8("#")).concatI32(_tokenId.toI32());

  let tokenInfo = TokenInfo.load(id)

  if (!tokenInfo) {
    tokenInfo = new TokenInfo(id)
  }
  tokenInfo.owner = action.to;
  tokenInfo.blockNumber = action.blockNumber;
  tokenInfo.blockTimestamp = action.blockTimestamp;
  tokenInfo.ca = _address;
  tokenInfo.tokenId = _tokenId;
  tokenInfo.tokenURL = nft.tokenURI(_tokenId);
  tokenInfo.name = nft.name();
  tokenInfo.transactionHash = action.transactionHash;


  tokenInfo.save();
}



export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.owner = event.params.owner
  entity.approved = event.params.approved
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let contract = NFT.bind(event.address)
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
