import { IClientMeta } from '@walletconnect/types'
import { WalletModule } from 'bnc-onboard/dist/src/interfaces'
import UAParser from 'ua-parser-js'

import { APP_VERSION, PUBLIC_URL } from 'src/utils/constants'
import { ChainId } from 'src/config/chain'
import { getWCWalletInterface, getWalletConnectProvider } from 'src/logic/wallets/walletConnect/utils'

// Modified version of the built in WC module in Onboard v1.35.5
// https://github.com/blocknative/onboard/blob/release/1.35.5/src/modules/select/wallets/wallet-connect.ts

export const PAIRING_MODULE_NAME = 'Safe Mobile'

const safeMobileIcon = `
    <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M18 2.25H9C7.14487 2.25 5.625 3.76875 5.625 5.625V21.375C5.625 23.2313 7.14487 24.75 9 24.75H18C19.8562 24.75 21.375 23.2313 21.375 21.375V5.625C21.375 3.76875 19.8562 2.25 18 2.25ZM18 4.5C18.6098 4.5 19.125 5.01525 19.125 5.625V21.375C19.125 21.9848 18.6098 22.5 18 22.5H9C8.39025 22.5 7.875 21.9848 7.875 21.375V5.625C7.875 5.01525 8.39025 4.5 9 4.5H18Z" fill="#008C73"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5 18.8511C12.7237 18.8511 12.0938 19.4811 12.0938 20.2573C12.0938 21.0336 12.7237 21.6636 13.5 21.6636C14.2762 21.6636 14.9062 21.0336 14.9062 20.2573C14.9062 19.4811 14.2762 18.8511 13.5 18.8511Z" fill="#008C73"/>
    </svg>
`

let client = ''
const getClientMeta = (): IClientMeta => {
  // Only instantiate parser if no app or client is set
  if (!client) {
    const parser = new UAParser()
    const browser = parser.getBrowser()
    const os = parser.getOS()

    client = `${browser.name} ${browser.major} (${os.name})`
  }

  const app = `Safe Web v${APP_VERSION}`
  const logo = `${location.origin}${PUBLIC_URL}/resources/logo_120x120.png`

  return {
    name: app,
    description: `${client};${app}`,
    url: 'https://gnosis-safe.io/app',
    icons: [logo],
  }
}

// Note: this shares a lot of similarities with the patchedWalletConnect module
const getPairingModule = (chainId: ChainId): WalletModule => {
  const STORAGE_ID = 'SAFE__pairingProvider'
  const clientMeta = getClientMeta()

  return {
    name: PAIRING_MODULE_NAME,
    svg: safeMobileIcon,
    wallet: async ({ resetWalletState }) => {
      const provider = getWalletConnectProvider(chainId, {
        storageId: STORAGE_ID,
        qrcode: false, // Don't show QR modal
        clientMeta,
      })

      // WalletConnect overrides the clientMeta, so we need to set it back
      ;(provider.wc as any).clientMeta = clientMeta
      ;(provider.wc as any)._clientMeta = clientMeta

      const onDisconnect = () => {
        resetWalletState({ disconnected: true, walletName: PAIRING_MODULE_NAME })
      }

      provider.wc.on('disconnect', onDisconnect)

      window.addEventListener('unload', onDisconnect, { once: true })

      // Establish WC connection
      provider.enable()

      return {
        provider,
        interface: {
          ...getWCWalletInterface(provider),
          name: PAIRING_MODULE_NAME,
        },
      }
    },
    type: 'sdk',
    desktop: true,
    mobile: false,
    // Must be preferred to position 1st in list (to hide via CSS)
    preferred: true,
  }
}

export default getPairingModule
