import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Grid, Card, CardMedia, CardContent, CardActions } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { buyWithCrypto, buyWithStripe } from '../services/paymentService';

interface Item {
  itemId: number;
  name: string;
  description: string;
  price: number;
  itemType: string;
  metadata: string;
  owner: string;
}

const ItemModel: React.FC<{ metadata: string }> = ({ metadata }) => {
  const { scene } = useGLTF(metadata);
  return <primitive object={scene} scale={[0.5, 0.5, 0.5]} />;
};

const Marketplace: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', itemType: '', metadata: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      // Call the canister to get items
      const response = await fetch('/api/get-items'); // Replace with actual canister call
      const data = await response.json();
      setItems(data);
    };
    fetchItems();
  }, []);

  const handleCreateItem = async () => {
    if (!auth.currentUser) {
      navigate('/login-signup');
      return;
    }

    // Call the canister to create an item
    await fetch('/api/create-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newItem, price: parseFloat(newItem.price) }),
    });
    setNewItem({ name: '', description: '', price: '', itemType: '', metadata: '' });
    // Refresh items
    const response = await fetch('/api/get-items');
    setItems(await response.json());
  };

  const handleBuy = async (item: Item, paymentMethod: 'crypto' | 'stripe') => {
    if (!auth.currentUser) {
      navigate('/login-signup');
      return;
    }

    if (paymentMethod === 'crypto') {
      await buyWithCrypto(item, auth.currentUser.uid);
    } else {
      await buyWithStripe(item);
    }
    // Refresh items
    const response = await fetch('/api/get-items');
    setItems(await response.json());
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4">Nimbus Marketplace</Typography>

      <Typography variant="h6" sx={{ marginTop: 2 }}>Create New Item</Typography>
      <TextField
        label="Name"
        value={newItem.name}
        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Description"
        value={newItem.description}
        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Price (ICP)"
        type="number"
        value={newItem.price}
        onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Item Type"
        value={newItem.itemType}
        onChange={(e) => setNewItem(prev => ({ ...prev, itemType: e.target.value }))}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Metadata URL (3D Model)"
        value={newItem.metadata}
        onChange={(e) => setNewItem(prev => ({ ...prev, metadata: e.target.value }))}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" onClick={handleCreateItem} sx={{ marginTop: 2 }}>
        Create Item
      </Button>

      <Typography variant="h6" sx={{ marginTop: 4 }}>Items for Sale</Typography>
      <Grid container spacing={2}>
        {items.map(item => (
          <Grid item xs={12} sm={6} md={4} key={item.itemId}>
            <Card>
              <Box sx={{ height: 200 }}>
                <Canvas>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[0, 1, 1]} intensity={0.5} />
                  <ItemModel metadata={item.metadata} />
                  <OrbitControls />
                </Canvas>
              </Box>
              <CardContent>
                <Typography variant="h6">{item.name}</Typography>
                <Typography variant="body2">{item.description}</Typography>
                <Typography variant="body1">Price: {item.price} ICP</Typography>
              </CardContent>
              <CardActions>
                <Button onClick={() => handleBuy(item, 'crypto')}>Buy with Crypto</Button>
                <Button onClick={() => handleBuy(item, 'stripe')}>Buy with Stripe</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Marketplace;
