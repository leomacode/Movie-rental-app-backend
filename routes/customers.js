const express = require("express");
const router = express.Router();
const { Customer, isValid } = require("../models/customer");
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find();
    res.send(customers);
  } catch (err) {
    console.log(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).send("Customer with this ID was not found");
  } else {
    res.send(customer);
  }
});

router.post("/", auth, async (req, res) => {
  const { error } = isValid(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  const { isGold, name, phone } = req.body;

  let customer = new Customer({
    isGold: isGold,
    name: name,
    phone: phone
  });

  try {
    customer = await customer.save();
  } catch (err) {
    console.log(err.message);
  }

  if (!customer) {
    return res.status(404).send("Customer with this ID was not found");
  } else {
    res.send(customer);
  }
});

router.put("/:id", auth, async (req, res) => {
  const { isGold, name, phone } = req.body;
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      isGold: isGold,
      name: name,
      phone: phone
    },
    { new: true }
  );
  if (!customer) {
    return res.status(404).send("Customer with this ID was not found");
  } else {
    res.send(customer);
  }
});

router.delete("/:id", auth, async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) {
    return res.status(404).send("Customer with this ID was not found");
  } else {
    res.send(customer);
  }
});

module.exports = router;
