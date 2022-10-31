async function main() {
  const Vivek_19IT062 = await ethers.getContractFactory("Vivek_19IT062");
  const TokenSale = await ethers.getContractFactory("TokenSale");
  var tokenPrice = 1000000000000000; // in wei

  // Start deployment, returning a promise that resolves to a contract object
  const krutik19it035 = await Vivek_19IT062.deploy(1000000);
  console.log(
    "[Vivek_19IT062] Contract deployed to address: ",
    vivek19it062.address
  );
  console.log(vivek19it062);

  const tokensale = await TokenSale.deploy(vivek19it062.address, tokenPrice);
  console.log("[TokenSale] Contract deployed to address: ", tokensale.address);
  console.log(tokensale);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/* 
[Krutik_19IT035] Contract deployed to address:  0x176fC30745CfFfe3bbfB31Aa8293d0dF22333A68
[TokenSale] Contract deployed to address:  0xEd358c6ef16661d7fE43257C53B88BCC903fBF5a
*/
