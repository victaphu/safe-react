import { SafeTransactionData } from '@gnosis.pm/safe-core-sdk-types'
import { TypedDataUtils } from 'eth-sig-util'

import { getEip712MessageTypes, generateTypedDataFrom } from 'src/logic/safe/transactions/offchainSigner/EIP712Signer'

export const generateSafeTxHash = (safeAddress: string, safeVersion: string, safeTransactionData: SafeTransactionData): string => {
  const typedData = generateTypedDataFrom({ safeAddress, safeVersion, safeTransactionData })

  const messageTypes = getEip712MessageTypes(safeVersion)

  return `0x${TypedDataUtils.sign<typeof messageTypes>(typedData).toString('hex')}`
}
