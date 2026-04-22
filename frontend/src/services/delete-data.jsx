import axios from "axios";

const DeleteProduct = async (productId) => {
  try {
    const response = await axios.delete(
      `http://127.0.0.1:8000/product/${productId}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default DeleteProduct;