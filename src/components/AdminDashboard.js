import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import {Star, StarBorder,} from "@mui/icons-material";
const AdminDashboard = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [view, setView] = useState("foodItems");
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const savedView = localStorage.getItem("adminDashboardView");
    if (savedView) {
      setView(savedView);
    }
    fetchFoodItems();
    fetchOrders();
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString());
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleViewChange = (newView) => {
    setView(newView);
    localStorage.setItem("adminDashboardView", newView);
  };

  const fetchFoodItems = () => {
    axios
      .get("http://localhost:5000/api/admin/items", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => setFoodItems(response.data))
      .catch((error) => console.error("Error fetching food items:", error));
  };

  const fetchOrders = () => {
    axios
      .get("http://localhost:5000/api/admin/orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => setOrders(response.data))
      .catch((error) => console.error("Error fetching orders:", error));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/upload",
        { name, description, price, imageUrl, category },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.status === 200) {
        alert("Food item uploaded successfully!");
        fetchFoodItems();
        resetFormFields();
      }
    } catch (error) {
      alert(
        `Error uploading food item: ${error.response?.data?.message || error.message}`
      );
      console.error("Error uploading food item:", error);
    }
  };

  const resetFormFields = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setCategory("");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setFoodItems(foodItems.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting food item:", error);
    }
  };

  const handleOrderComplete = (orderId) => {
    axios
      .put(
        `http://localhost:5000/api/admin/complete-order/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then(() => {
        fetchOrders();
        const userId = orders.find((order) => order._id === orderId)?.userId;

        if (userId) {
          axios
            .post(
              "http://localhost:5000/api/user/sendNotification",
              {
                userId: userId,
                message: "Your order has been completed!",
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            )
            .then(() => {
              console.log("Notification sent to user");
              alert("Your order has been completed!");
            })
            .catch((error) => {
              console.error("Error sending notification to user:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error marking order as completed:", error);
      });
  };

  const pendingOrders = orders.filter((order) => order.status === "Pending");
  const completedOrders = orders.filter(
    (order) => order.status === "Completed"
  );

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="h6" gutterBottom>
        {currentDateTime}
      </Typography>{" "}
      {/* Display Date and Time */}
      <Button
        variant="contained"
        onClick={() => handleViewChange("foodItems")}
        sx={{ m: 1 }}
      >
        View All Food Items
      </Button>
      <Button
        variant="contained"
        onClick={() => handleViewChange("upload")}
        sx={{ m: 1 }}
      >
        Upload Item
      </Button>
      <Button
        variant="contained"
        onClick={() => handleViewChange("pendingOrders")}
        sx={{ m: 1 }}
      >
        Pending Orders
      </Button>
      <Button
        variant="contained"
        onClick={() => handleViewChange("completedOrders")}
        sx={{ m: 1 }}
      >
        Order History
      </Button>
      {view === "foodItems" && (
        <FoodItemsSection foodItems={foodItems} handleDelete={handleDelete} />
      )}
      {view === "upload" && (
        <UploadItemForm
          name={name}
          description={description}
          price={price}
          imageUrl={imageUrl}
          category={category}
          setName={setName}
          setDescription={setDescription}
          setPrice={setPrice}
          setImageUrl={setImageUrl}
          setCategory={setCategory}
          handleUpload={handleUpload}
        />
      )}
      {view === "pendingOrders" && (
        <OrdersSection
          orders={pendingOrders}
          handleOrderComplete={handleOrderComplete}
          title="Pending Orders"
        />
      )}
      {view === "completedOrders" && (
        <OrdersSection
          orders={completedOrders}
          title="Order History (Completed Orders)"
        />
      )}
    </Container>
  );
};

const FoodItemsSection = ({ foodItems, handleDelete }) => (
  <div>
    <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
      All Food Items
    </Typography>
    <Grid container spacing={2}>
      {foodItems.length ? (
        foodItems.map((item) => (
          <Grid item key={item._id} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
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
                <Typography variant="h6">{item.name}</Typography>
                <Typography>{item.description}</Typography>
                <Typography>${item.price}</Typography>
                <Typography>{item.category}</Typography>
                <Button
                  onClick={() => handleDelete(item._id)}
                  variant="contained"
                  color="secondary"
                  sx={{ mt: 2 }}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Typography>No food items to display</Typography>
      )}
    </Grid>
  </div>
);

const OrdersSection = ({ orders, handleOrderComplete, title }) => (
  <div>
    <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
      {title}
    </Typography>
    <Grid container spacing={2}>
      {orders.length ? (
        orders.map((order) => (
          <Grid item key={order._id} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                {order.foodItemId?.imageUrl ? (
                  <img
                    src="https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg"
                    alt={order.foodItemId.name || "Food Item"}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "200px",
                      objectFit: "cover",
                      marginBottom: "10px",
                    }}
                  />
                ) : null}
                <Typography variant="h6">
                  {order.foodItemId?.name || "Item Name"}
                </Typography>
                <Typography>Quantity: {order.quantity}</Typography>
                <Typography>Total Price: ${order.totalPrice}</Typography>
                <Typography>Status: {order.status}</Typography>
                <Typography>
                  Ordered by: {order.userId?.username || "Unknown"}
                </Typography>

                {/* Display createdAt (order date and time) */}
                <Typography variant="body2" color="textSecondary">
                  Order Date: {new Date(order.createdAt).toLocaleString()}
                </Typography>

                {/* Display Rating if Order is Completed */}
                {order.status === "Completed" && order.rating ? (
            <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                User Rating:
              </Typography>
              {[...Array(5)].map((_, index) => (
                index < order.rating ? (
                  <Star key={index} color="primary" />
                ) : (
                  <StarBorder key={index} color="primary" />
                )
              ))}
            </Box>
          ) : null}

                {title === "Pending Orders" && (
                  <Button
                    onClick={() => handleOrderComplete(order._id)}
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                  >
                    Mark as Completed
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Typography>No {title.toLowerCase()} to display</Typography>
      )}
    </Grid>
  </div>
);

const UploadItemForm = ({
  name,
  description,
  price,
  imageUrl,
  category,
  setName,
  setDescription,
  setPrice,
  setImageUrl,
  setCategory,
  handleUpload,
}) => (
  <form onSubmit={handleUpload}>
    <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
      Upload a Food Item
    </Typography>
    <TextField
      label="Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      fullWidth
      required
      sx={{ mb: 2 }}
    />
    <TextField
      label="Description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      fullWidth
      required
      sx={{ mb: 2 }}
    />
    <TextField
      label="Price"
      value={price}
      onChange={(e) => setPrice(e.target.value)}
      fullWidth
      required
      sx={{ mb: 2 }}
    />
    <TextField
      label="Image URL"
      value={imageUrl}
      onChange={(e) => setImageUrl(e.target.value)}
      fullWidth
      required
      sx={{ mb: 2 }}
    />
    <TextField
      label="Category"
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      fullWidth
      required
      sx={{ mb: 2 }}
    />
    <Button type="submit" variant="contained" color="primary">
      Upload Item
    </Button>
  </form>
);

export default AdminDashboard;
