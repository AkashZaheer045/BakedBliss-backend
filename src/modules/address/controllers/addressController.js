// addressController.js

const { models } = require('../../../../config/sequelizeConfig');
const { User } = models;

// Add a new address
const addAddress = async (req, res) => {
  try {
    const userId = req.user && (req.user.uid || req.user.userId);
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ message: "Address is required." });
    }

    const user = await User.findOne({
      where: { user_id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Add address to user's existing addresses
    const currentAddresses = user.addresses || [];
    const updatedAddresses = [...currentAddresses, address];

    await user.update({ addresses: updatedAddresses });

    res.status(201).json({ message: "Address added successfully.", data: updatedAddresses });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ message: "Failed to add address.", error: error.message });
  }
};

// Update an address
const updateAddress = async (req, res) => {
  try {
    const userId = req.user && (req.user.uid || req.user.userId);
    const { addressId, updatedAddress } = req.body;

    if (addressId === undefined || !updatedAddress) {
      return res.status(400).json({ message: "AddressId and updatedAddress are required." });
    }

    const user = await User.findOne({
      where: { user_id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const currentAddresses = user.addresses || [];
    const updatedAddresses = currentAddresses.map((addr, idx) =>
      idx === addressId ? updatedAddress : addr
    );

    await user.update({ addresses: updatedAddresses });

    res.status(200).json({ message: "Address updated successfully.", data: updatedAddresses });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ message: "Failed to update address.", error: error.message });
  }
};

// Delete an address
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user && (req.user.uid || req.user.userId);
    const { addressId } = req.body;

    if (addressId === undefined) {
      return res.status(400).json({ message: "AddressId is required." });
    }

    const user = await User.findOne({
      where: { user_id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const currentAddresses = user.addresses || [];
    const updatedAddresses = currentAddresses.filter((_, idx) => idx !== addressId);

    await user.update({ addresses: updatedAddresses });

    res.status(200).json({ message: "Address deleted successfully.", data: updatedAddresses });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Failed to delete address.", error: error.message });
  }
};

// View all addresses
const viewAddresses = async (req, res) => {
  try {
    const userId = req.user && (req.user.uid || req.user.userId);

    const user = await User.findOne({
      where: { user_id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "success", data: user.addresses || [] });
  } catch (error) {
    console.error("Error viewing addresses:", error);
    res.status(500).json({ message: "Failed to retrieve addresses.", error: error.message });
  }
};

module.exports = { addAddress, updateAddress, deleteAddress, viewAddresses };