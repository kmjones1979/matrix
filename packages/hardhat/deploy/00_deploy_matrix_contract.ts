import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the MatrixContract contract
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployMatrixContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("MatrixContract", {
    from: deployer,
    args: [deployer], // Set deployer as the oracle
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const matrixContract = await hre.ethers.getContract("MatrixContract", deployer);
  console.log("MatrixContract deployed to:", await matrixContract.getAddress());

  // Simply log success without trying to access specific properties
  console.log("MatrixContract deployed successfully with deployer as oracle!");
};

export default deployMatrixContract;

// Tags help identify which scripts should run in which order
deployMatrixContract.tags = ["MatrixContract"];
