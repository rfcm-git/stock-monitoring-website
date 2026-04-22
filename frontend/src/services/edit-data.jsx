import axios from "axios";

const EditProduct = async (productId, productData) => {
  try {
    const response = await axios.patch(
      `http://127.0.0.1:8000/product/${productId}`,
      productData
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default EditProduct;