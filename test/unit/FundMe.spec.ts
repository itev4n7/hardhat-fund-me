import { expect } from "chai"
import { deployments, ethers, getNamedAccounts } from "hardhat"

describe("FundMe @unit", async function () {
    const sendValue = ethers.parseEther("0.5")
    let fundMe: any
    let deployer: any
    let mockV3Aggregator: any
    this.beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const responce = await fundMe.getPriceFeed()
            expect(responce).to.eq(mockV3Aggregator.target)
        })
    })

    describe("fund", async function () {
        it("fails if don't enough ETH", async function () {
            const errorMessage = "Didn't send enough."
            await expect(fundMe.fund()).to.be.revertedWith(errorMessage)
        })

        it("update the amount funded data", async function () {
            await fundMe.fund({ value: sendValue })
            const responce = await fundMe.getAddressToAmountFunded(deployer)
            expect(responce).to.eq(sendValue.toString())
        })

        it("adds funder to funders array", async function () {
            await fundMe.fund({ value: sendValue })
            const founder = await fundMe.getFunder(0)
            expect(founder).to.eq(deployer)
        })
    })
    describe("withdraw", async function () {
        this.beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })

        it("withdraw ETH from a single founder", async function () {
            const startingFundMeBalance =
                await fundMe.runner.provider.getBalance(fundMe.target)
            const startingDeployerBalance =
                await fundMe.runner.provider.getBalance(deployer)
            const txRes = await fundMe.withdraw()
            const txReceipt = await txRes.wait()
            const { gasUsed, gasPrice } = txReceipt
            const gasCost = gasUsed * gasPrice
            const endingFundMeBalance = await fundMe.runner.provider.getBalance(
                fundMe.target
            )
            const enidngDeployerBalance =
                await fundMe.runner.provider.getBalance(deployer)
            expect(endingFundMeBalance).to.eq(0)
            expect(
                (startingFundMeBalance + startingDeployerBalance).toString()
            ).to.eq((enidngDeployerBalance + gasCost).toString())
        })

        it("allow us to withdraw with multiple funders", async function () {
            const accounts = await ethers.getSigners()
            for (let id = 1; id < 6; id++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[id]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance =
                await fundMe.runner.provider.getBalance(fundMe.target)
            const startingDeployerBalance =
                await fundMe.runner.provider.getBalance(deployer)
            const txRes = await fundMe.withdraw()
            const txReceipt = await txRes.wait()
            const { gasUsed, gasPrice } = txReceipt
            const gasCost = gasUsed * gasPrice
            const endingFundMeBalance = await fundMe.runner.provider.getBalance(
                fundMe.target
            )
            const enidngDeployerBalance =
                await fundMe.runner.provider.getBalance(deployer)
            expect(endingFundMeBalance).to.eq(0)
            expect(
                (startingFundMeBalance + startingDeployerBalance).toString()
            ).to.eq((enidngDeployerBalance + gasCost).toString())
            await expect(fundMe.getFunder(0)).to.be.reverted
            for (let id = 1; id < 6; id++) {
                expect(
                    await fundMe.getAddressToAmountFunded(accounts[id].address)
                ).to.eq(0)
            }
        })

        it("cheaperWithdraw with multiple funders", async function () {
            const accounts = await ethers.getSigners()
            for (let id = 1; id < 6; id++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[id]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance =
                await fundMe.runner.provider.getBalance(fundMe.target)
            const startingDeployerBalance =
                await fundMe.runner.provider.getBalance(deployer)
            const txRes = await fundMe.cheaperWithdraw()
            const txReceipt = await txRes.wait()
            const { gasUsed, gasPrice } = txReceipt
            const gasCost = gasUsed * gasPrice
            const endingFundMeBalance = await fundMe.runner.provider.getBalance(
                fundMe.target
            )
            const enidngDeployerBalance =
                await fundMe.runner.provider.getBalance(deployer)
            expect(endingFundMeBalance).to.eq(0)
            expect(
                (startingFundMeBalance + startingDeployerBalance).toString()
            ).to.eq((enidngDeployerBalance + gasCost).toString())
            await expect(fundMe.getFunder(0)).to.be.reverted
            for (let id = 1; id < 6; id++) {
                expect(
                    await fundMe.getAddressToAmountFunded(accounts[id].address)
                ).to.eq(0)
            }
        })

        it("only allows the owner to withdraw", async function () {
            const errorMessage = "FundMe__NotOwner"
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(
                attackerConnectedContract.withdraw()
            ).to.be.revertedWithCustomError(
                attackerConnectedContract,
                errorMessage
            )
        })
    })
})
