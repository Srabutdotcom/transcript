# TLS 1.3 Transcript Holder
@version 0.0.3

A JavaScript class that manages and validates the sequence of handshake messages in a TLS 1.3 protocol exchange.

## Features

- Tracks all handshake messages in proper sequence
- Validates message order and duplicates
- Handles HelloRetryRequest special case
- Provides access to individual message types
- Maintains complete message hash for cryptographic operations

## Usage
```JavaScript
import { Transcript } from '@tls/transcript';

// Create with initial ClientHello
const transcript = new Transcript(clientHello);

// Server responses
transcript.insert(serverHello);
transcript.insert(encryptedExtensions);
transcript.insert(certificate);
transcript.insert(certificateVerify);
transcript.insert(serverFinished);

// Client responses
transcript.insert(clientFinished);

// handshakeContext
const handshakeContext = transcript.byte;
```

### Donation

- [Support the project on PayPal](https://paypal.me/aiconeid)

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.