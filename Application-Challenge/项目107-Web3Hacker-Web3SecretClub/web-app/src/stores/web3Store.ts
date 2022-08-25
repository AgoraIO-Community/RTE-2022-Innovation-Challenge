import { useWeb3Auth } from '~/composables/useWeb3Auth'
import { isSameAddress } from '~/helpers/web3'
export interface getContractOpts {
  name: string
  isWrite?: Boolean
}

export const web3Store = defineStore('web3Store', () => {
  const {
    isLoading,
    web3Provider,
    rawProvider,
    signer,
    walletAddress,
    doLogin,
    isShowOnboardModal,
    doLogout,
    doOnboard,
    error,
    initContract,
  } = $(web3AuthStore())

  const userNavigation = [
    { name: 'Settings', href: '/settings/Web3Home' },
    { name: 'Sign out', onClick: doLogout },
  ]

  const isOwner = (address) => {
    return isSameAddress(address, walletAddress)
  }

  return $$({
    initContract,
    error,
    walletAddress,
    userNavigation,
    isLoading,
    web3Provider,
    rawProvider,
    isShowOnboardModal,
    signer,
    isOwner,
    doLogin,
    doLogout,
    doOnboard,
  })
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(web3Store, import.meta.hot))
