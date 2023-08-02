import { ethers, getNamedAccounts } from "hardhat"

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe: any = await ethers.getContract("FundMe")
    console.log("Funding...")
    const txRes = await fundMe.withdraw()
    await txRes.wait(1)
    console.log("Got it back!")
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })
