var TokenSale = artifacts.require("./TokenSale.sol");
var Vivek_19IT062 = artifacts.require("./Vivek_19IT062.sol");

contract("TokenSale", async (accounts) => {
  var contract;
  var tokenContract;
  var admin = accounts[0];
  var tokensAvailable = 750000;
  var tokenPrice = 1000000000000000; // in wei
  let buyer = accounts[1];

  it("initialize the contract with the correct values", async () => {
    contract = await TokenSale.deployed();
    let address = await contract.address;
    assert.notEqual(address, 0x0, "has contract address");

    let address2 = await contract.tokenContract();
    assert.notEqual(address2, 0x0, "has token contract address");

    let price = await contract.tokenPrice();
    assert.equal(price, tokenPrice, "token price is correct");
  });

  it("facilitates token buying", async () => {
    tokenContract = await Vivek_19IT062.deployed();
    contract = await TokenSale.deployed();

    // Provision 75% tokens to the token sale
    let receipt1 = await tokenContract.transfer(
      contract.address,
      tokensAvailable,
      { from: admin }
    );

    let numberOfTokens = 10;
    let value = numberOfTokens * tokenPrice;
    let receipt = await contract.buyTokens(numberOfTokens, {
      from: buyer,
      value: value,
    });

    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(receipt.logs[0].event, "Sell", "should be the Sell event");
    assert.equal(
      receipt.logs[0].args._buyer,
      buyer,
      "log the account that purchased the tokens"
    );
    assert.equal(
      receipt.logs[0].args._amount,
      numberOfTokens,
      "log the number of tokens purchased"
    );

    let amount = await contract.tokensSold();
    assert.equal(
      amount.toNumber(),
      numberOfTokens,
      "increments the number of token sold"
    );

    let balanceOfBuyer = await tokenContract.balanceOf(buyer);
    assert.equal(balanceOfBuyer.toNumber(), numberOfTokens);
    let balanceOfContract = await tokenContract.balanceOf(contract.address);
    assert.equal(
      balanceOfContract.toNumber(),
      tokensAvailable - numberOfTokens
    );

    try {
      // try to buy tokens differnt from the ether value
      let res = await contract.buyTokens(numberOfTokens, {
        from: buyer,
        value: 1,
      });
      await assert.fail(res);
    } catch (error) {
      // console.log("[Message]: ", error.message);
      assert(
        error.message.includes("revert"),
        "msg.value must equal number of tokens in wei"
      );
    }
    try {
      // try to buy tokens differnt from the ether value
      let res = await contract.buyTokens(800000, {
        from: buyer,
        value: numberOfTokens * tokenPrice,
      });
      await assert.fail(res);
    } catch (error) {
      // console.log("[Message]: ", error.message);
      assert(
        error?.message.includes("revert"),
        "cannot purchase more tokens than available"
      );
    }
  });

  it("ends token sale", async () => {
    contract = await TokenSale.deployed();
    tokenContract = await Vivek_19IT062.deployed();

    // try to end sale from account other than admin
    try {
      let res = await contract.endSale({ from: buyer });
      await assert.fail(res);
    } catch (error) {
      // console.log("[Message]: ", error.message);
      assert(error?.message.includes("revert"), "must be admin to end sale");
    }

    let receipt = await contract.endSale({ from: admin });
    let balanceOfAdmin = await tokenContract.balanceOf(admin);
    assert.equal(
      balanceOfAdmin.toNumber(),
      999990,
      "retuens all unsold tokens to admin"
    );

    let price = await contract.tokenPrice();
    console.log("[price]: ", price);
    assert.equal(price.toNumber(), 0, "token price was reset");
  });
});
