import axios from "axios";

const AddProduct = async (productData) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/product/add",
      productData
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default AddProduct;