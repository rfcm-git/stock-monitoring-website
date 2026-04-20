import React, { useEffect, useState } from "react";
import axios from "axios";

const FetchProducts = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    axios
    .get("http://127.0.0.1:8000/products")
    .then(response => setData(response.data))
    .catch(error => console.log(error));
    }, []);
    return data;
  };

export default FetchProducts;