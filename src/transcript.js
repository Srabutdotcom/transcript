//@ts-self-types="../type/transcript.d.ts"
import { sha256, sha384 } from "./dep.ts";

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
   #clientFinishedMsg = null;

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
      handshake = sanitize(handshake)
      const type = handshake[0];

      switch (type) {
         case 1: { // ClientHello
            if (this.#clientHelloMsg) throw new Error(`Duplicate ClientHelloMsg`);
            this.#clientHelloMsg = handshake;
            console.log('clientHelloMsg received');
            break;
         }
         case 2: { // ServerHello
            if (isHRR(handshake)) {
               if (this.#helloRetryRequestMsg) throw new Error(`Duplicate HelloRetryRequestMsg`);
               const cipher = handshake[39 + handshake[38] + 1]; // the last value of Cipher
               const hash = cipher == 2 ? sha384 : sha256;
               const hashClientHello1 = hash.create().update(this.#clientHelloMsg).digest();
               const n = hashClientHello1.length;
               this.#message_hash = new Uint8Array(hashClientHello1.length + 4);
               this.#message_hash[0] = 254;
               this.#message_hash[1] = n < 65536 ? 0 : (n >> 16) & 0xFF;
               this.#message_hash[2] = n < 256 ? 0 : (n >> 8) & 0xFF;
               this.#message_hash[3] = n & 0xFF;
               this.#message_hash.set(hashClientHello1, 4)

               this.#handshakes[0] = this.#message_hash;
               this.#helloRetryRequestMsg = handshake;
               this.#clientHelloMsg = null;
               console.log(`HelloRetryRequestMsg received and message_hash created`)
               break;
            }
            if (this.#serverHelloMsg) throw new Error(`Duplicate ServerHello message`);
            this.#serverHelloMsg = handshake;
            console.log(`serverHelloMsg received`);
            break;
         }
         case 8: { // EncryptedExtensions
            if (this.#encryptExtsMsg) throw new Error(`Duplicate EncryptedExtensions message`);
            this.#encryptExtsMsg = handshake;
            console.log('encryptExtsMsg received');
            break;
         }
         case 11: { // Certificate
            if (this.#certificateMsg) throw new Error(`Duplicate Certificate message`);
            this.#certificateMsg = handshake;
            console.log('certificateMsg received');
            break;
         }
         case 15: { // CertificateVerify
            if (this.#certificateVerifyMsg) throw new Error(`Duplicate CertificateVerify message`);
            this.#certificateVerifyMsg = handshake;
            console.log('certificateVerifyMsg received');
            break;
         }
         case 20: { // Finished
            if (!this.#serverFinishedMsg) {
               this.#serverFinishedMsg = handshake;
               console.log('serverFinishedMsg received');
               break;
            }
            if (!this.#clientFinishedMsg) {
               this.#clientFinishedMsg = handshake;
               console.log('clientFinishedMsg received');
               break;
            }
         }
      }
      this.#handshakes.push(handshake)
   }
   get byte() {
      const r = new Uint8Array(this.#handshakes.reduce((s, a) => s + a.length, 0));
      let p = 0
      for (const i of this.#handshakes) {
         r.set(i, p);
         p += i.length;
      }
      return r
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
   get handshakes(){ 
      return this.#handshakes 
   }
}

function isHRR(message) {
   return message.subarray(6, 38).toString() == "207,33,173,116,229,154,97,17,190,29,140,2,30,101,184,145,194,162,17,22,122,187,140,94,7,158,9,226,200,168,51,156"
}

function sanitize(handshake) {
   if (!(handshake instanceof Uint8Array)) throw new TypeError(`Expected Uint8Array but got ${typeof handshake}`);
   const types = [1, 2, 4, 5, 8, 11, 13, 15, 20, 24, 254];
   if (!types.includes(handshake[0])) throw new TypeError(`Unknown type - ${handshake[0]}`);
   const offset = 1;
   const lengthOf = (handshake[offset] << 16) | (handshake[offset + 1] << 8) | handshake[offset + 2];
   if (handshake.length < lengthOf + 4) throw new RangeError(`Expected length ${lengthOf} but got ${handshake.length}`);
   if (handshake.length > lengthOf + 4) return handshake.subarray(0, lengthOf + 4);
   return handshake;
}