export interface NetworkConfig {
    [index: number]: {
        name: string
        ethUsdPriceFeed: string
        blockConfirmations: number
    }
}
export const networkConfig: NetworkConfig = {
    80001: {
        name: "mumbai",
        ethUsdPriceFeed: "0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676",
        blockConfirmations: 6,
    },
    // 1337: {
    //     name: "hardhat",
    //     ethUsdPriceFeed: "none",
    //     blockConfirmations: 0,
    // },
}
export const developmentChains = ["hardhat", "localhost"]
export const DECIMALS = 8
export const INITIAL_ANSWER = 2000_00000000
