# Lottery Smart Contract

Lottery smart contract created by solidity.

## Contract rules
1. The contract has 1 manager who manages the lottery
2. The manager can only pick the winner and cannot participate in the lottery
3. The lottery can only be entered with a minimum of 0.02 ether
4. The manager can only pick the winner if the participant already exists
5. Participants and balance will be reset when the winner has been drawn and get the balance available in the contract

## Test the Contract

```
git clone git@github.com:sustiono/lottery-smart-contract.git
cd lottery-smart-contract && yarn
cp .evn.example .env (open .env  file and replace the contents with yours)
yarn test
```
## Technologies
1. Solidity
2. Web3 JS
3. Technology