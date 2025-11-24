// addressController.js

const { db } = require('../../../config/firebaseConfig');

// Add a new address
const addAddress = async (req, res) => {
  try {
    const userId = req.user && (req.user.uid || req.user.userId);
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ message: "Address is required." });
    }

    const userRef = db.collection('User').doc(userId);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ message: "User not found." });
    }

    // Add address to user's existing addresses
    const userData = userSnapshot.data();
    const updatedAddresses = [...userData.addresses, address];

    await userRef.update({ addresses: updatedAddresses });

    res.status(201).json({ message: "Address added successfully.", data: updatedAddresses });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ message: "Failed to add address." });
  }
};

// Update an address
const updateAddress = async (req, res) => {
  try {
  const userId = req.user && (req.user.uid || req.user.userId);
    const { addressId, updatedAddress } = req.body;

    if (!addressId || !updatedAddress) {
      return res.status(400).json({ message: "AddressId and updatedAddress are required." });
    }

    const userRef = db.collection('User').doc(userId);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ message: "User not found." });
    }

    const userData = userSnapshot.data();
    const updatedAddresses = userData.addresses.map((addr, idx) =>
      idx === addressId ? updatedAddress : addr
    );

    await userRef.update({ addresses: updatedAddresses });

    res.status(200).json({ message: "Address updated successfully.", data: updatedAddresses });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ message: "Failed to update address." });
  }
};

// Delete an address
const deleteAddress = async (req, res) => {
  try {
  const userId = req.user && (req.user.uid || req.user.userId);
    const { addressId } = req.body;

    if (!addressId) {
      return res.status(400).json({ message: "AddressId is required." });
    }

    const userRef = db.collection('User').doc(userId);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ message: "User not found." });
    }

    const userData = userSnapshot.data();
    const updatedAddresses = userData.addresses.filter((_, idx) => idx !== addressId);

    await userRef.update({ addresses: updatedAddresses });

    res.status(200).json({ message: "Address deleted successfully.", data: updatedAddresses });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Failed to delete address." });
  }
};

// View all addresses
const viewAddresses = async (req, res) => {
  try {
    const userId = req.user && (req.user.uid || req.user.userId);

    const userRef = db.collection('User').doc(userId);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ message: "User not found." });
    }

    const userData = userSnapshot.data();
    res.status(200).json({ message: "success", data: userData.addresses });
  } catch (error) {
    console.error("Error viewing addresses:", error);
    res.status(500).json({ message: "Failed to retrieve addresses." });
  }
};

module.exports = { addAddress, updateAddress, deleteAddress, viewAddresses };