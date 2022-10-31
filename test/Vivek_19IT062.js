let Vivek_19IT062 = artifacts.require("./Vivek_19IT062.sol");

contract("Vivek_19IT062", (accounts) => {
  it("initializes the contract with correct values", async () => {
    let contract = await Vivek_19IT062.deployed();
    let name = await contract.name();
    let symbol = await contract.symbol();
    let standard = await contract.standard();

    assert.equal(name, "Vivek_19IT062", "Check Name of Token");
    assert.equal(symbol, "VM62", "Check Symbol of Token");
    assert.equal(standard, "Vivek_19IT062 v1.0", "Check Standard of Token");
  });

  it("check/allocates totalSupply onDeployment", async () => {
    let contract = await Vivek_19IT062.deployed();
    let totalSupply = await contract.totalSupply();

    assert.equal(
      totalSupply.toNumber(),
      1000000,
      "check totalSupply onDeployment"
    );

    let adminAccount = await contract.balanceOf(accounts[0]);
    assert.equal(
      adminAccount.toNumber(),
      1000000,
      "allocates initial supply to admin"
    );
  });

  it("transfer token ownership", async () => {
    let contract = await Vivek_19IT062.deployed();
    try {
      const res = await contract.transfer.call(accounts[1], 999999999999999);
      await assert.fail(res);
    } catch (error) {
      // console.log("[Message]: ", error.message);
      assert(
        error.message.includes("revert"),
        "error message must contain revert"
      );
    }
    const receipt = await contract.transfer(accounts[1], 250000, {
      from: accounts[0],
    });

    let success = await contract.transfer.call(accounts[1], 250000, {
      from: accounts[0],
    });
    assert.equal(success, true, "it returns true");

    let balanceOf1 = await contract.balanceOf(accounts[1]);
    assert.equal(
      balanceOf1.toNumber(),
      250000,
      "adds amount to the receiving account"
    );
    let balanceOf0 = await contract.balanceOf(accounts[0]);
    assert.equal(
      balanceOf0.toNumber(),
      750000,
      "deducts amount from the sending account"
    );

    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(
      receipt.logs[0].event,
      "Transfer",
      "should be the transfer event"
    );
    assert.equal(
      receipt.logs[0].args._from,
      accounts[0],
      "log the account the tokens are trasgerred from"
    );
    assert.equal(
      receipt.logs[0].args._to,
      accounts[1],
      "log the account the tokens are trasgerred to"
    );
    assert.equal(
      receipt.logs[0].args._value.toNumber(),
      250000,
      "log the transfer amount"
    );
  });

  it("Approves tokens for delegate transfer", async () => {
    const contract = await Vivek_19IT062.deployed();
    let success = await contract.approve.call(accounts[1], 100);
    assert.equal(success, true, "it return true");

    let receipt = await contract.approve(accounts[1], 100);
    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(
      receipt.logs[0].event,
      "Approval",
      "should be the Approval event"
    );
    assert.equal(
      receipt.logs[0].args._owner,
      accounts[0],
      "log the account the tokens are authorized by"
    );
    assert.equal(
      receipt.logs[0].args._spender,
      accounts[1],
      "log the account the tokens are authorized to"
    );
    assert.equal(
      receipt.logs[0].args._value.toNumber(),
      100,
      "log the Approval amount"
    );

    let allowance = await contract.allowance(accounts[0], accounts[1]);
    assert.equal(
      allowance.toNumber(),
      100,
      "stores the allowance for delegate transfer"
    );
  });

  it("handles delegated token transfers", async () => {
    const contract = await Vivek_19IT062.deployed();
    fromAccount = accounts[2];
    toAccount = accounts[3];
    spendingAccount = accounts[4];
    try {
      // transfer some tokens to fromAccount
      await contract.transfer(fromAccount, 100, {
        from: accounts[0],
      });
      // Approve spendingAccount to spend 10 tokens from fromAccount
      await contract.approve(spendingAccount, 10, {
        from: fromAccount,
      });
      // Try transferring something large than the sender's balance
      let res = await contract.transferFrom.call(fromAccount, toAccount, 9999, {
        from: spendingAccount,
      });
      await assert.fail(res);
    } catch (error) {
      // console.log("[Message]: ", error.message);
      assert(
        error.message.includes("revert"),
        "cannot transfer value larger than balance"
      );
    }
    try {
      let res = await contract.transferFrom.call(fromAccount, toAccount, 20, {
        from: spendingAccount,
      });
      assert.fail(res);
    } catch (error) {
      assert(
        error.message.includes("revert"),
        "cannot transfer value larger than approved amount"
      );
    }
    let success = await contract.transferFrom.call(fromAccount, toAccount, 10, {
      from: spendingAccount,
    });
    assert.equal(success, true);
    let receipt = await contract.transferFrom(fromAccount, toAccount, 10, {
      from: spendingAccount,
    });
    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(
      receipt.logs[0].event,
      "Transfer",
      "should be the Transfer event"
    );
    assert.equal(
      receipt.logs[0].args._from,
      fromAccount,
      "log the account the tokens are fransfered from"
    );
    assert.equal(
      receipt.logs[0].args._to,
      toAccount,
      "log the account the tokens are transfered to"
    );
    assert.equal(
      receipt.logs[0].args._value.toNumber(),
      10,
      "log the transfer amount"
    );

    let balanceOfFromAccount = await contract.balanceOf(fromAccount);
    assert.equal(
      balanceOfFromAccount.toNumber(),
      90,
      "deducts the amount from the sending account"
    );

    let balanceofToAccount = await contract.balanceOf(toAccount);
    assert.equal(
      balanceofToAccount.toNumber(),
      10,
      "deducts the amount from the receiving account"
    );

    let allowance = await contract.allowance(fromAccount, spendingAccount);
    assert.equal(
      allowance.toNumber(),
      0,
      "deducts the amount from the allowance"
    );
  });
});
