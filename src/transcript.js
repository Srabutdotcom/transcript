//@ts-self-types="../type/transcript.d.ts"
import { Cipher, HandshakeType, Uint24, unity } from "./dep.ts";

export class Transcript {
   #handshakes = []
   #message_hash = null;
   #helloRetryRequestMsg = null;
   #clientHelloMsg = null;
   #serverHelloMsg = null;
   #encryptExtsMsg = null;
   #certificateMsg = null;
   #certificateVerifyMsg = null;
   #serverFinishedMsg = null;
   #clientFinishedMsg  = null;

   constructor(...handshakes) {
      for (const handshake of handshakes) {
         this.insert(handshake)
      }
   }
   insertMany(...handshakes) {
      for (const handshake of handshakes) {
         this.insert(handshake)
      }
   }
   insert(handshake) {
      if (!this.#handshakes.length) {
         if (HandshakeType.fromValue(handshake[0]) !== HandshakeType.CLIENT_HELLO) throw Error(`Expected ClientHello`);
         this.#clientHelloMsg = handshake;
         this.#handshakes.push(handshake)
         return
      }
      if (handshake.message.isHRR) {
         const hash = handshake?.message?.cipher?.hash ?? Cipher.from(handshake.subarray(39 + handshake.at(38))).hash
         const hashClientHello1 = hash.create().update(this.#handshakes[0]).digest();
         this.#handshakes[0] = unity(
            HandshakeType.MESSAGE_HASH.byte,
            Uint24.fromValue(hashClientHello1.length),
            hashClientHello1
         )
         this.#handshakes.push(handshake) // HRR
         this.#message_hash = this.#handshakes[0];
         this.#helloRetryRequestMsg = handshake; // HRR
         this.#clientHelloMsg = null;
         return
      }
      switch (handshake?.type ?? HandshakeType.from(handshake)) {
         case HandshakeType.SERVER_HELLO:
            if (this.#serverHelloMsg) throw new Error(`Duplicate ServerHello message`);
            this.#serverHelloMsg = handshake;
            console.log('serverHelloMsg received');
            break;
   
         case HandshakeType.CLIENT_HELLO:
            if (this.#clientHelloMsg) throw new Error(`Duplicate ClientHello message`);
            this.#clientHelloMsg = handshake;
            console.log('clientHelloMsg received');
            break;
   
         case HandshakeType.ENCRYPTED_EXTENSIONS:
            if (this.#encryptExtsMsg) throw new Error(`Duplicate EncryptedExtensions message`);
            this.#encryptExtsMsg = handshake;
            console.log('encryptExtsMsg received');
            break;
   
         case HandshakeType.CERTIFICATE:
            if (this.#certificateMsg) throw new Error(`Duplicate Certificate message`);
            this.#certificateMsg = handshake;
            console.log('certificateMsg received');
            break;
   
         case HandshakeType.CERTIFICATE_VERIFY:
            if (this.#certificateVerifyMsg) throw new Error(`Duplicate CertificateVerify message`);
            this.#certificateVerifyMsg = handshake;
            console.log('certificateVerifyMsg received');
            break;
   
         case HandshakeType.FINISHED:
            if (handshake.isServer) {
               if (this.#serverFinishedMsg) throw new Error('Duplicate server Finished message');
               this.#serverFinishedMsg = handshake;
               console.log('serverFinishedMsg received');
            } else {
               if (this.#clientFinishedMsg) throw new Error('Duplicate client Finished message');
               this.#clientFinishedMsg = handshake;
               console.log('clientFinishedMsg received');
            }
            break;
   
         default:
            console.log('other received');
            break;
      }
      this.#handshakes.push(handshake);
   }
   get byte() {
      return unity(...this.#handshakes)
   }
   get messageHash() {
      return this.#message_hash;
   }
   get helloRetryRequestMsg() {
      return this.#helloRetryRequestMsg;
   }
   get clientHelloMsg() {
      return this.#clientHelloMsg
   }
   get serverHelloMsg() {
      return this.#serverHelloMsg
   }
   get encryptedExtensionsMsg() {
      return this.#encryptExtsMsg
   }
   get certificateMsg() {
      return this.#certificateMsg
   }
   get certificateVerifyMsg() {
      return this.#certificateVerifyMsg
   }
   get serverFinishedMsg() {
      return this.#serverFinishedMsg;
   }
   get clientFinishedMsg() {
      return this.#clientFinishedMsg;
   }
}