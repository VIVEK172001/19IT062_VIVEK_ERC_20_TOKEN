const Vivek_19IT062 = artifacts.require("./Vivek_19IT062.sol");
const TokenSale = artifacts.require("./TokenSale.sol");
// token price is 0.001 ETH
var tokenPrice = 1000000000000000; // in wei

module.exports = async function (deployer) {
  await deployer.deploy(Vivek_19IT062, 1000000);
  await deployer.deploy(TokenSale, Vivek_19IT062.address, tokenPrice);
};
