const { run } = require("hardhat");

async function verify(contractAddress, args) {
  console.log("Verfying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified...");
    } else {
      console.log("Not Verified...", e);
    }
  }
}

module.exports = { verify };
