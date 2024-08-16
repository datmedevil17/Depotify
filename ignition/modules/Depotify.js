
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");



module.exports = buildModule("Depotify", (m) => {


  const Depotify = m.contract("Depotify", []);

  return { Depotify };
});