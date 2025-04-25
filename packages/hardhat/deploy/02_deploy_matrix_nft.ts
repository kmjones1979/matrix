import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the MatrixNFT contract and links it to the MatrixContract
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployMatrixNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy the MatrixNFT contract
  const nftDeployment = await deploy("MatrixNFT", {
    from: deployer,
    args: [], // No constructor args
    log: true,
    autoMine: true,
  });

  console.log(`MatrixNFT deployed to: ${nftDeployment.address}`);

  // Get the previously deployed MatrixContract with type assertion
  const matrixContract = (await hre.ethers.getContract("MatrixContract", deployer)) as any;

  // Get the deployed NFT contract with type assertion
  const nftContract = (await hre.ethers.getContract("MatrixNFT", deployer)) as any;

  // Set the MatrixContract address in the NFT contract
  const setMatrixTx = await nftContract.setMatrixContract(await matrixContract.getAddress());
  await setMatrixTx.wait();
  console.log(`Set MatrixContract address in NFT contract`);

  // Set the NFT contract address in the MatrixContract
  const setNFTTx = await matrixContract.setNFTContract(await nftContract.getAddress());
  await setNFTTx.wait();
  console.log(`Set NFT contract address in MatrixContract`);

  // Enable NFT minting
  const enableMintingTx = await matrixContract.setNFTMintingEnabled(true);
  await enableMintingTx.wait();
  console.log(`Enabled NFT minting in MatrixContract`);
};

export default deployMatrixNFT;

// Tags help identify which scripts should run in which order
deployMatrixNFT.tags = ["MatrixNFT"];
deployMatrixNFT.dependencies = ["MatrixContract"]; // This script depends on MatrixContract being deployed first
