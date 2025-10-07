import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001; // Different port to issuance service
const WORKER_ID = process.env.WORKER_ID || 'worker-1';

// URL of the issuance service, should be configured according to your deployment
const ISSUANCE_SERVICE_URL = process.env.ISSUANCE_SERVICE_URL || 'http://issuance-service:3000';

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.post('/verify', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Credential must have an id field' });
    }

    // Call the issuance service to verify credential existence and details
    const response = await axios.get(`${ISSUANCE_SERVICE_URL}/credentials/${id}`);

    if (response.status === 200) {
      // Credential found - respond with verification details
      return res.status(200).json({
        message: 'Credential is valid',
        issuedBy: WORKER_ID,
        credentialId: id,
        ...response.data,
      });
    } else {
      return res.status(404).json({ message: 'Credential not found' });
    }
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ message: 'Credential not found' });
    }
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Credential Verification Service running on port ${PORT}, worker: ${WORKER_ID}`);
});

export { app };
