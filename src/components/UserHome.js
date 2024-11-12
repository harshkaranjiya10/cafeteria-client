import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Snackbar,
  Box,
  Rating,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link } from "react-router-dom";

const UserHome = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [ratings, setRatings] = useState({}); // Store ratings per order

  useEffect(() => {
    fetchFoodItems();
    fetchPurchasedItems();
  }, []);

  const fetchFoodItems = () => {
    axios
      .get("http://localhost:5000/api/user/items", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        setFoodItems(response.data);
      })
      .catch((error) => {
        console.error("Error fetching food items:", error);
      });
  };

  const fetchPurchasedItems = () => {
    axios
      .get("http://localhost:5000/api/user/purchasedItems", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        setPurchasedItems(response.data);
        
        // Initialize ratings from completed orders with existing ratings
        const initialRatings = {};
        response.data.forEach((order) => {
          if (order.status === "Completed" && order.rating) {
            initialRatings[order._id] = order.rating;
          }
        });
        setRatings(initialRatings);
      })
      .catch((error) => {
        console.error("Error fetching purchased items:", error);
      });
  };
  

  const handleAddToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const itemIndex = cart.findIndex((cartItem) => cartItem._id === item._id);

    if (itemIndex === -1) {
      item.quantity = 1;
      cart.push(item);
      setSnackbarMessage(`${item.name} added to cart`);
    } else {
      cart[itemIndex].quantity += 1;
      setSnackbarMessage(`${item.name} quantity increased`);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0)); // Update cart count
    setOpenSnackbar(true);
  };

  // Format the date
  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    return new Date(date).toLocaleDateString("en-IN", options);
  };

  const handleRating = (orderId, newRating) => {
    axios
      .post(
        `http://localhost:5000/api/user/rateOrder/${orderId}`,
        { rating: newRating },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((response) => {
        setSnackbarMessage("Rating submitted successfully!");
        setOpenSnackbar(true);
      })
      .catch((error) => {
        console.error("Error submitting rating:", error);
      });
  };

  
  const handleRatingChange = (orderId, newRating) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [orderId]: newRating,
    }));
  };
  
  const handleSubmitFeedback = (orderId) => {
    const rating = ratings[orderId];
    if (!rating) return;
  
    axios
      .post(`http://localhost:5000/api/user/rateOrder/${orderId}`, { rating }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => {
        setSnackbarMessage("Feedback submitted successfully!");
        setOpenSnackbar(true);
      })
      .catch((error) => {
        console.error("Error submitting feedback:", error);
      });
  };
  


  return (
    <Container>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: "center", marginTop: 4 }}
      >
        Welcome to Our Cafeteria
      </Typography>

      {/* Cart Icon */}
      <Link to="/cart">
        <IconButton
          aria-label="view cart"
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            backgroundColor: "#1976d2",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
        >
          <ShoppingCartIcon />
          <Typography
            variant="body1"
            sx={{ position: "absolute", top: 5, left: 25 }}
          >
            {cartCount}
          </Typography>
        </IconButton>
      </Link>

      {/* Food Items Display */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        {foodItems.map((item) => (
          <Grid
            item
            key={item._id}
            xs={12}
            sm={6}
            md={4}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Card
              sx={{
                width: "100%",
                maxWidth: 345,
                boxShadow: 3,
                transition: "0.3s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {item.description}
                </Typography>
                <Typography variant="h6">${item.price}</Typography>

                {/* Image Display */}
                {item.imageUrl ? (
                  <img
                    src="https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg"
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "200px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ marginTop: 1 }}
                  >
                    No image available
                  </Typography>
                )}

                <Button
                  onClick={() => handleAddToCart(item)}
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Add to Cart
                </Button>

                <Button
                  onClick={() => {
                    localStorage.setItem("buyNowItem", JSON.stringify(item)); // Save single item to local storage
                    window.location.href = "/payment"; // Redirect to payment page
                  }}
                  variant="contained"
                  color="secondary"
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Purchased Items Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Your Purchased Items
        </Typography>

        {purchasedItems.length > 0 ? (
          <Grid container spacing={3}>
            {purchasedItems.map((order) => (
              <Grid item key={order._id} xs={12} sm={6} md={4}>
                <Card sx={{ width: "100%", boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6">
                      {order.foodItemId?.name || "Item Name"}
                    </Typography>
                    <Typography>Quantity: {order.quantity}</Typography>
                    <Typography>Total Price: ${order.totalPrice}</Typography>
                    <Typography>Status: {order.status}</Typography>
                    <Typography>Ordered on: {formatDate(order.createdAt)}</Typography>
                    {order.status === "Completed" && (
                      <>
                        <Typography>Rate your order:</Typography>
                        <Rating
                          name={`rating-${order._id}`}
                          value={ratings[order._id] || 0}
                          onChange={(event, newRating) => handleRatingChange(order._id, newRating)}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleSubmitFeedback(order._id)}
                          sx={{ mt: 1 }}
                        >
                          Submit Feedback
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>No purchased items available.</Typography>
        )}
      </Box>

      {/* Snackbar for feedback */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default UserHome;
