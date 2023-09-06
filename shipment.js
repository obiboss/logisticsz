"use strict";

const knex = require("knex");

function createShip(shipment) {
  return knex("shipment").insert(shipment);
}

function getAllShipment() {
  return knex("shipment").select("*");
}

function deleteShipment(id) {
  return knex("shipment").where("id", id).del();
}

function updateShipment(unique_id, shipment) {
  return knex("shipment").where("unique_id", unique_id).update(shipment);
}

module.exports = {
  createShip,
  getAllShipment,
  deleteShipment,
  updateShipment,
};
