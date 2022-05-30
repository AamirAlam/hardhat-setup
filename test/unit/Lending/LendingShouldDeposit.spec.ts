import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

export const shouldDeposit = (): void => {
  //   // to silent warning for duplicate definition of Transfer event
  //   ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.OFF);

  context(`#deposit`, async function () {
    it(`should revert if amount is not greater than 0`, async function () {
      const amount = ethers.constants.Zero;
      // await expect(
      //   this.lending
      //     .connect(this.signers.alice)
      //     .deposit(this.mocks.mockUsdc.address, amount)
      // ).to.be.reverted; // check revered

      await expect(
        this.lending
          .connect(this.signers.alice)
          .deposit(this.mocks.mockUsdc.address, amount)
      ).to.be.revertedWith("NeedsMoreThanZero"); // check revered wih proper message
    });

    it("should emit proper event", async function () {
      const amount = ethers.constants.One;
      await expect(
        this.lending
          .connect(this.signers.alice)
          .deposit(this.mocks.mockUsdc.address, amount)
      )
        .to.emit(this.lending, "Deposit")
        .withArgs(
          this.signers.alice.address,
          this.mocks.mockUsdc.address,
          amount
        );
    });
    it("should update storage variable properly", async function () {
      const previousAccountsToDeposits: BigNumber =
        await this.lending.s_accountToTokenDeposits(
          this.signers.alice.address,
          this.mocks.mockUsdc.address
        );
      const amount = parseEther("1");
      await this.lending
        .connect(this.signers.alice)
        .deposit(this.mocks.mockUsdc.address, amount);
      const currentAccountsToDeposits: BigNumber =
        await this.lending.s_accountToTokenDeposits(
          this.signers.alice.address,
          this.mocks.mockUsdc.address
        );

      assert(
        currentAccountsToDeposits.eq(previousAccountsToDeposits.add(amount)),
        "Should update correct value to accountToDeposit"
      );
    });

    it("should revert with TransactionFailed error", async function () {
      await this.mocks.mockUsdc.mock.transferFrom.returns(false);
      const amount = parseEther("1");

      await expect(
        this.lending
          .connect(this.signers.alice)
          .deposit(this.mocks.mockUsdc.address, amount)
      ).to.be.revertedWith("TransferFailed");
    });
  });
};
