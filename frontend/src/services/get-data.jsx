import React, { useEffect, useState } from "react";
import axios from "axios";

export const FetchProducts = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/products");
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const FetchCategories = async () => {
    try {
    const response = await axios.get("http://127.0.0.1:8000/categories");
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const FilteredByCategory = async (category) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/categories/${category}/products`);
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const SearchProducts = async (query) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/search?q=`, { params: { q: query } });
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
  {console.log(response.data);}
};