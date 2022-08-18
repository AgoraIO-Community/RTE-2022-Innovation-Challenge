import Secret3 from "~/abis/Secret3.json";

const chainIdMap = {
  "secret3.nfttop.best": "0x13881",
};
const gitBranch = import.meta.env.VITE_VERCEL_GIT_COMMIT_REF;
export const CHAIN_ID = chainIdMap[gitBranch] || "0x13881";
export const CHAIN_MAP = {
  "0x13881": {
    chainId: "0x13881",
    chainName: "Polygon Testnet Mumbai",
    blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: [
      "https://matic-mumbai.chainstacklabs.com",
      "https://rpc-mumbai.maticvigil.com",
      "https://matic-testnet-archive-rpc.bwarelabs.com",
    ],
  },
};

export const CHAIN_CONTRACT_MAP = {
  Secret3: {
    "0x13881": "0xCD8eC2f6787458C4476931623a71B97D85dAEedD",
  },
};

export const CHAIN_CONTRACT_ABI_MAP = {
  Secret3,
};
