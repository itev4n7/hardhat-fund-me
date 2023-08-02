import { ethers, getNamedAccounts } from "hardhat"

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe: any = await ethers.getContract("FundMe")
    console.log("Funding contract...")
    const txRes = await fundMe.fund({ value: ethers.parseEther("0.1") })
    await txRes.wait(1)
    console.log("Funded!")
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })
