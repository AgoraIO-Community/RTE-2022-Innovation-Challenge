import { Core } from '@self.id/core'
import { Caip10Link } from '@ceramicnetwork/stream-caip10-link'
import { BigNumber } from 'ethers'

import { CERAMIC_initProfileFieldsKeyMap } from '~/config/CERAMIC'
const core = new Core({ ceramic: 'testnet-clay' })
export const useCeramic = (address: string) => {
  address = unref(address)
  const profile = $ref({ ...CERAMIC_initProfileFieldsKeyMap })
  const index = parseInt(address.replace('0x', ''), 16) % 8 + 1
  console.log('====> index :', index)
  profile.banner = `/tmp/banners/cover-${index}.jpg`
  return $$({
    profile,
  })
}
