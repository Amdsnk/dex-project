const { ethers } = require("hardhat");

async function main() {
  console.log("Starting DEX deployment...");

  // Deploy Factory
  const Factory = await ethers.getContractFactory("DEXFactory");
  const factory = await Factory.deploy();
  await factory.deployed();
  console.log("Factory deployed to:", factory.address);

  // Deploy Router
  const Router = await ethers.getContractFactory("DEXRouter");
  const router = await Router.deploy(factory.address);
  await router.deployed();
  console.log("Router deployed to:", router.address);

  // Verify contracts on Etherscan
  if (network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await factory.deployTransaction.wait(6);
    await router.deployTransaction.wait(6);

    await hre.run("verify:verify", {
      address: factory.address,
      constructorArguments: [],
    });

    await hre.run("verify:verify", {
      address: router.address,
      constructorArguments: [factory.address],
    });
  }

  console.log("Deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
