/**
 * Represents the sequence of handshake messages exchanged during a TLS 1.3 session.
 * Automatically tracks and guards against duplicates of critical handshake types.
 */
export class Transcript {
   /**
    * Create a new Transcript with optional initial handshake messages.
    * @param handshakes One or more handshake messages to insert.
    */
   constructor(...handshakes: Uint8Array[]);
 
   /**
    * Insert multiple handshake messages into the transcript.
    * @param handshakes One or more handshake messages.
    */
   insertMany(...handshakes: Uint8Array[]): void;
 
   /**
    * Insert a single handshake message into the transcript.
    * Automatically handles message hash replacement during HelloRetryRequest.
    * Guards against duplicate insertion of key messages.
    * @param handshake A single handshake message.
    */
   insert(handshake: Uint8Array & { type?: number, isServer?: boolean, isHRR?: boolean }): void;
 
   /**
    * Get the complete serialized transcript as a single Uint8Array.
    */
   get byte(): Uint8Array;
 
   /**
    * Get the injected message_hash (used in HelloRetryRequest).
    */
   get messageHash(): Uint8Array | null;
 
   /**
    * Get the HelloRetryRequest message (if present).
    */
   get helloRetryRequestMsg(): Uint8Array | null;
 
   /**
    * Get the ClientHello message.
    */
   get clientHelloMsg(): Uint8Array | null;
 
   /**
    * Get the ServerHello message.
    */
   get serverHelloMsg(): Uint8Array | null;
 
   /**
    * Get the EncryptedExtensions message.
    */
   get encryptedExtensionsMsg(): Uint8Array | null;
 
   /**
    * Get the Certificate message (if present).
    */
   get certificateMsg(): Uint8Array | null;
 
   /**
    * Get the CertificateVerify message (if present).
    */
   get certificateVerifyMsg(): Uint8Array | null;
 
   /**
    * Get the Finished message from the server.
    */
   get serverFinishedMsg(): Uint8Array | null;
 
   /**
    * Get the Finished message from the client.
    */
   get clientFinishedMsg(): Uint8Array | null;
 }
 