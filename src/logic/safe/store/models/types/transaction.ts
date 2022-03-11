import Safe from '@gnosis.pm/safe-core-sdk';
import { SafeTransactionData } from '@gnosis.pm/safe-core-sdk-types';

export enum PendingActionType {
  CONFIRM = 'confirm',
  REJECT = 'reject',
}
export type PendingActionValues = PendingActionType[keyof PendingActionType]
