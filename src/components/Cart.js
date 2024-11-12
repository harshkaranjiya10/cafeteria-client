import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Divider, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();  // Initialize useNavigate for page navigation

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
  }, []);

  const handleRemoveFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item._id !== itemId);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartItems(updatedCart);
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    const updatedCart = cartItems.map(item => 
      item._id === itemId ? { ...item, quantity: newQuantity } : item
    );
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartItems(updatedCart);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };
  
  const handleProceedToCheckout = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    // Pass cart items to the payment page
    localStorage.setItem("cartItemsForPayment", JSON.stringify(cart));
    navigate('/payment');
  };
  
  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', marginTop: 4 }}>
        Your Cart
      </Typography>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <Grid item key={item._id} xs={12} sm={6} md={4}>
              <Card sx={{ boxShadow: 3, transition: '0.3s' }}>
                <CardContent>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                  <Typography variant="h6">${item.price}</Typography>

                  {/* Quantity Input */}
                  <TextField
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item._id, Math.max(1, e.target.value))}
                    sx={{ mt: 2, width: '100%' }}
                    inputProps={{ min: 1 }}
                  />

                  {/* Remove Button */}
                  <Button
                    onClick={() => handleRemoveFromCart(item._id)}
                    variant="contained"
                    color="error"
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    <DeleteIcon /> Remove
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', width: '100%' }}>
            Your cart is empty.
          </Typography>
        )}
      </Grid>
      
      {cartItems.length > 0 && (
        <>
          <Divider sx={{ mt: 4 }} />
          <Typography variant="h5" sx={{ mt: 2, textAlign: 'right' }}>
            Total: ${calculateTotal()}
          </Typography>

          {/* Checkout Button */}
          <Button
             onClick={handleProceedToCheckout} // Now handle checkout and store items for Payment
             variant="contained"
             color="secondary"
             fullWidth
             sx={{ mt: 1 }}      
          >
            Proceed to Checkout
          </Button>
        </>
      )}
    </Container>
  );
};

export default Cart;
