export const secret3Store = defineStore('secret3Store', () => {
  const { initContract, walletAddress } = $(web3AuthStore())
  const { getJson } = $(useNFTStorage())
  let navigation = $ref([])
  let secondaryNavigation = $ref([])
  let items = $ref([])

  const sidebarOpen = $ref(false)
  const dialogCreateCategoryShow = $ref(false)
  const dialogCreateItemShow = $ref(false)

  const getMyOwnClub = async() => {
    const contractReader = await initContract('Secret3')
    const {
      tokenIds,
      tokenURIs,
      totalMintCounts,
      mintMetadataCIDList,
    } = await contractReader.getTokenListByOwner(walletAddress)
    navigation = tokenURIs.map((cid, index) => {
      return {
        tokenId: tokenIds[index].toString(),
        cid,
        totalMintCount: totalMintCounts[index],
        mintMetadataCIDList: mintMetadataCIDList[index],
      }
    })
    const myTokenIds = tokenIds.map(item => item.toString())

    const allToken = await contractReader.getTokenList(0, 100)
    secondaryNavigation = allToken.tokenURIs.map((cid, index) => {
      return {
        tokenId: index,
        cid,
        totalMintCount: allToken.totalMintCounts[index],
        mintMetadataCIDList: allToken.mintMetadataCIDList[index],
      }
    }).filter((item) => {
      const isNotMy = !myTokenIds.includes(item.tokenId.toString())
      return isNotMy
    })
  }

  const getClubInfo = async(club) => {
    // console.log('====> club :', club)
    const data = await getJson(club.cid)
    const index = navigation.findIndex(item => item.cid === club.cid)
    if (index !== -1) {
      navigation[index] = {
        ...club,
        ...data,
      }
    }

    const index2 = secondaryNavigation.findIndex(item => item.cid === club.cid)
    if (index2 !== -1) {
      secondaryNavigation[index2] = {
        ...club,
        ...data,
      }
    }
  }

  const getClubItems = async(tokenId) => {
    const contractReader = await initContract('Secret3')
    items = await contractReader.getTokenItems(tokenId, 0, 1000)
  }

  watchEffect(async() => {
    if (!walletAddress) return
    await getMyOwnClub()
  })

  return $$({
    items,
    getClubInfo,
    getClubItems,
    getMyOwnClub,
    sidebarOpen,
    dialogCreateCategoryShow,
    dialogCreateItemShow,
    navigation,
    secondaryNavigation,
  })
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(secret3Store, import.meta.hot))
