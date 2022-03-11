import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types';
import { MultisigTransactionRequest, proposeTransaction, TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { _getChainId } from 'src/config'
import { checksumAddress } from 'src/utils/checksumAddress'
import { GATEWAY_URL } from 'src/utils/constants'
import Safe from '@gnosis.pm/safe-core-sdk';

type ProposeTxBody = Pick<MultisigTransactionRequest, 'sender' | 'origin' | 'signature'> & {
  safeSdk: Safe
  safeTransaction: SafeTransaction
}

const calculateBodyFrom = async ({
  safeSdk,
  safeTransaction,
  sender,
  origin,
  signature,
}: ProposeTxBody): Promise<MultisigTransactionRequest> => {
  const { to, value, data, operation, nonce, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver } = safeTransaction.data
  return {
    to: checksumAddress(to),
    value,
    data,
    operation: Number(operation),
    nonce: nonce.toString(),
    safeTxGas: safeTxGas.toString(),
    baseGas: baseGas.toString(),
    gasPrice: gasPrice.toString(),
    gasToken,
    refundReceiver,
    safeTxHash: await safeSdk.getTransactionHash(safeTransaction),
    sender: checksumAddress(sender),
    origin,
    signature,
  }
}

type SaveTxToHistoryTypes = {
  safeSdk,
  safeTransaction: SafeTransaction,
  sender: string
  origin?: string | null
  signature?: string
}

export const saveTxToHistory = async ({
  safeSdk,
  safeTransaction,
  sender,
  origin,
  signature,
}: SaveTxToHistoryTypes): Promise<TransactionDetails> => {
  const address = checksumAddress(safeSdk.getAddress())
  const body = await calculateBodyFrom({
    safeSdk,
    safeTransaction,
    sender,
    origin: origin ? origin : null,
    signature,
  })
  const txDetails = await proposeTransaction(GATEWAY_URL, _getChainId(), address, body)
  return txDetails
}
