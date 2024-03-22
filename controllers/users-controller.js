const knex = require("knex")(require("../knexfile"));
const { useState } = require('react');

//get all inventories and return
const index = async (_req, res) => {
  try {
    const data = await knex("users")
      .join("warehouses", "warehouses.id", "inventories.warehouse_id")
      .select(
        "inventories.id",
        "warehouses.warehouse_name",
        "inventories.item_name",
        "inventories.description",
        "inventories.category",
        "inventories.status",
        "inventories.quantity"
      );
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error retrieving inventories: ${err}`);
  }
};

module.exports = {
  index
};
