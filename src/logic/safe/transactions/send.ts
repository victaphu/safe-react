import Safe from '@gnosis.pm/safe-core-sdk';
import { SafeTransaction, TransactionOptions, TransactionResult } from '@gnosis.pm/safe-core-sdk-types';

export const getApprovalTransaction = async (
  safeSdk: Safe,
  txHash: string,
  options: TransactionOptions
): Promise<TransactionResult> => {
  try {
    const txResult = await safeSdk.approveTransactionHash(txHash, options)
    return txResult
  } catch (err) {
    console.error(`Error while approving transaction: ${err}`)
    throw err
  }
}

export const getExecutionTransaction = async (
  safeSdk: Safe,
  safeTransaction: SafeTransaction,
  options: TransactionOptions
): Promise<TransactionResult> => {
  try {
    /*
        const safeTransactionData: SafeTransactionData = {
      to,
      value,
      data,
      operation,
      safeTxGas: Number(safeTxGas),
      baseGas: Number(baseGas),
      gasPrice: Number(gasPrice),
      gasToken,
      refundReceiver,
      nonce
    }
    const safeTransaction = await safeSdk.createTransaction(safeTransactionData)
    safeTransaction.addSignature()
    */
    const txResult = await safeSdk.executeTransaction(safeTransaction, options)
    return txResult
  } catch (err) {
    console.error(`Error while creating transaction: ${err}`)

    throw err
  }
}
