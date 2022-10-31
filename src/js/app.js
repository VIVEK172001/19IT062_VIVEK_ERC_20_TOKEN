function readTextFile(file, callback) {
  fetch(file)
    .then((res) => res.json())
    .then((data) => callback(data))
    .catch((err) => console.log(err));
}

const id = (_id) => {
  return document.getElementById(_id);
};

async function getAccount() {
  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  console.log(accounts);
  const account = accounts[0];
  return account;
}

const showLoading = (show) => {
  if (show) {
    id("loader").style.display = "flex";
    id("content").style.display = "none";
  } else {
    id("loader").style.display = "none";
    id("content").style.display = "block";
  }
};

const App = {
  loading: true,
  web3Provider: null,
  web3: null,
  account: "0x0",
  contracts: {},
  tokenPrice: null,
  tokensSold: null,
  tokensAvailable: 750000,
  balance: null,

  init: () => {
    console.log("App initialized...");
    return App.initWeb3();
  },
  initWeb3: () => {
    if (typeof window.ethereum !== "undefined") {
      console.log("metamask found");
      App.web3Provider = window.ethereum;
      App.web3 = new Web3(window.ethereum);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://127.0.0.1:7545"
      );
      App.web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: () => {
    readTextFile("TokenSale.json", async function (text) {
      App.account = await getAccount();
      console.log(`your Account: ${App.account}`);

      App.contracts.TokenSale = TruffleContract(text);
      App.contracts.TokenSale.setProvider(App.web3Provider);

      readTextFile("Vivek_19IT062.json", async function (text) {

        App.contracts.Vivek_19IT062 = TruffleContract(text);
        App.contracts.Vivek_19IT062.setProvider(App.web3Provider);
        App.listenForEvents();

        App.render();
      });
    });
  },

  render: async () => {
    let tokensale = await App.contracts.TokenSale.deployed();
    App.tokenPrice = await tokensale.tokenPrice();
    App.tokensSold = await tokensale.tokensSold();
    console.log(`TokenSale Address: ${tokensale.address}`);
    console.log(`Token Price: ${App.tokenPrice}`);
    console.log(`Token Sold: ${App.tokensSold}`);

    let token = await App.contracts.Vivek_19IT062.deployed();
    App.balance = await token.balanceOf(App.account);
    console.log(`Vivek_19IT062 Address: ${token.address}`);
    console.log(`Your Balance: ${App.balance}`);

    id("accountAddress").innerText = App.account;
    id("token-price").innerText = App.web3.fromWei(App.tokenPrice, "ether");
    id("token-sold").innerText = App.tokensSold;
    id("progress-bar").style = `width: ${
      (App.tokensSold / App.tokensAvailable) * 100
    }%`;
    id("balance").innerText = App.balance.toNumber();
    id(
      "avatar"
    ).src = `https://avatars.dicebear.com/api/bottts/${App.account}.svg`;

    App.loading = false;
    showLoading(false);
  },

  listenForEvents: async () => {
    let contract = await App.contracts.TokenSale.deployed();
    contract
      .Sell(
        {},
        {
          fromblock: 0,
          toblock: "latest",
        }
      )
      .watch((err, evnt) => {
        console.log("event triggered", evnt);
        App.render();
        showLoading(false);
      });
  },


  buyTokens: async () => {
    showLoading(true);
    try {
      let numberOfTokens = Number(id("numberOfToken").value);
      let contract = await App.contracts.TokenSale.deployed();
      let res = await contract.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000,
      });
      console.log("Tokens bought...");
      id("form").reset();
    } catch (err) {
      console.log(err);
      showLoading(false);
    }
  },
};

window.addEventListener("load", () => {
  id("content").style.display = "none";
  App.init();
});
