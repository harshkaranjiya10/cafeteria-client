import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Snackbar, Grid, Card, CardContent } from '@mui/material';
import axios from 'axios';

const Payment = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [buyNowItem, setBuyNowItem] = useState(null);

  useEffect(() => {
    const singleItem = JSON.parse(localStorage.getItem("buyNowItem"));
    if (singleItem) {
      setBuyNowItem(singleItem); // Set buy now item if available
      localStorage.removeItem("buyNowItem"); // Clear the item from storage after setting
    } else {
      const storedCartItems = JSON.parse(localStorage.getItem("cartItemsForPayment")) || [];
      setCartItems(storedCartItems);
    }
  }, []);

  const handlePaymentSubmit = () => {
    if (cardNumber && cardExpiry && cardCVV) {
      setPaymentSuccess(true);
      setSnackbarMessage('Payment completed successfully!');

      // Place order based on whether it's a Buy Now item or cart items
      const orderPromises = (buyNowItem ? [buyNowItem] : cartItems).map((item) => {
        const orderDetails = {
          foodItemId: item._id,
          userId: localStorage.getItem('userId'),
          adminId: item.adminId,
          quantity: item.quantity || 1,
          totalPrice: item.price * (item.quantity || 1),
        };

        return axios.post('http://localhost:5000/api/user/placeOrder', orderDetails, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      });

      // Clear cart or buy now item data after payment
      Promise.all(orderPromises)
        .then(() => {
          setSnackbarMessage('Orders successfully placed!');
          localStorage.removeItem('cartItemsForPayment');
        })
        .catch((error) => {
          console.error('Error placing orders:', error);
          setSnackbarMessage('Error placing orders. Please try again.');
        });
    } else {
      setSnackbarMessage('Please enter valid card details.');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', marginTop: 4 }}>
        Payment Page
      </Typography>

      {!paymentSuccess && (
        <div>
          <TextField
            label="Card Number"
            variant="outlined"
            fullWidth
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Expiry Date (MM/YY)"
            variant="outlined"
            fullWidth
            value={cardExpiry}
            onChange={(e) => setCardExpiry(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="CVV"
            variant="outlined"
            fullWidth
            type="password"
            value={cardCVV}
            onChange={(e) => setCardCVV(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            onClick={handlePaymentSubmit}
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Complete Payment
          </Button>
        </div>
      )}

      {paymentSuccess && (
        <div>
          <Typography variant="h5" sx={{ mt: 4, textAlign: 'center' }}>
            Payment successful! Here are your purchased items:
          </Typography>
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {(buyNowItem ? [buyNowItem] : cartItems).map((item) => (
              <Grid item key={item._id} xs={12} sm={6} md={4}>
                <Card sx={{ boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                    <Typography variant="h6">${item.price * (item.quantity || 1)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))} 
          </Grid>
        </div>
      )}

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default Payment;
