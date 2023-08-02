import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { expect } from "chai"

describe("FundMe @staging", async function () {
    const sendValue = ethers.parseEther("0.5")
    let fundMe: any
    let deployer: any

    this.beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
    })

    it("allow people to fund and withdraw", async function () {
        await fundMe.fund({ value: sendValue })
        await fundMe.withdraw()
        const endingBalance = await fundMe.runner.provider.getBalance(
            fundMe.target
        )
        expect(endingBalance.toString()).to.eq("0")
    })
})
