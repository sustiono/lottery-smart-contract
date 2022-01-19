const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const { abi, evm } = require("../compile");

let lottery;
let accounts;
let manager;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ from: accounts[0], gas: "1000000" });

  manager = await lottery.methods.manager().call({ from: manager });
});

describe("Lottery Contract", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("allows one account to enter lottery", async () => {
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether"),
    });

    const players = await lottery.methods
      .getPlayers()
      .call({ from: accounts[1] });

    assert.equal(accounts[1], players[0]);
    assert.equal(1, players.length);
  });

  it("allows multiple accounts to enter lottery", async () => {
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei("0.02", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[3],
      value: web3.utils.toWei("0.02", "ether"),
    });

    const players = await lottery.methods
      .getPlayers()
      .call({ from: accounts[1] });

    assert.equal(accounts[1], players[0]);
    assert.equal(accounts[2], players[1]);
    assert.equal(accounts[3], players[2]);
    assert.equal(3, players.length);
  });

  it("restrict manager to enter lottery", async () => {
    try {
      await lottery.methods.enter().send({
        from: manager,
        value: web3.utils.toWei("0.02", "ether"),
      });
      assert(false);
    } catch (error) {
      const players = await lottery.methods
        .getPlayers()
        .call({ from: manager });
      assert(error);
      assert.equal(0, players.length);
    }
  });

  it("require a minimum amount of ether to enter lottery", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[1],
        value: 0,
      });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("only manager can call pickWinner", async () => {
    try {
      await lottery.methods.pickWinner().send({ from: accounts[1] });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("only can pickWinner if players not empty", async () => {
    try {
      await lottery.methods.pickWinner().send({ from: manager });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("can get players", async () => {
    const players = await lottery.methods.getPlayers().call({ from: manager });
    assert.equal(0, players.length);
  });

  it("can get balance", async () => {
    await lottery.methods.enter().send({
      from: accounts[1],
      value: 250,
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: 250,
    });

    const balance = await lottery.methods.getBalance().call({ from: manager });
    assert.equal(500, balance);
  });

  it("sends money to the winner and resets the players array and contract balance", async () => {
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("3", "ether"),
    });

    const initialBalance = await web3.eth.getBalance(accounts[1]);
    await lottery.methods.pickWinner().send({ from: manager });
    const finalBalance = await web3.eth.getBalance(accounts[1]);
    const diffrence = finalBalance - initialBalance;
    const balance = await lottery.methods.getBalance().call({ from: manager });
    const players = await lottery.methods.getPlayers().call({ from: manager });

    assert(diffrence > web3.utils.toWei("1.8", "ether"));
    assert.equal(0, balance);
    assert.equal(0, players);
  });
});
