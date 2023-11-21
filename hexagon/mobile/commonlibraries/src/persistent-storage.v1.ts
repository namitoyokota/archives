import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "react-native-crypto-js"

/**
 * Access persistent storage. All data must be serializable. The data is stored encrypted.
 * TODO - Move this to mobile common lib
 */
export class PersistentStorage$v1 {
  /** Key used to encrypt and decrypt data */
  private static readonly encryptionKey = '960206d1-3219-4f7e-957e-cb95407bf3b7';

  /**
   * Save data into persistent storage
   * @param key Key to store data under. Should start with capability id.
   * @param data The data to store. Must be serializable.
   * @returns
   */
  static async set<T>(key: string, data: string | T): Promise<void> {

    if (!data) {
      // Cannot set null so lets remove the value instead
      return PersistentStorage$v1.removeItem(key);
    }

    const strData = typeof data === 'string' ? data : JSON.stringify(data);

    let encryptedData = CryptoJS.AES.encrypt(strData, this.encryptionKey as string).toString();
    return await AsyncStorage.setItem(key.toString(), encryptedData);
  }

  /**
   * Get data from persistent storage
   * @param keyKey Key to store data under. Should start with capability id.
   * @returns The data stored
   */
  static async get<T>(key: string): Promise<string | T | null> {
    let data = await AsyncStorage.getItem(key.toString());
    if (data === null) {
        return null;
    }
    else {

        let bytes = CryptoJS.AES.decrypt(data, String(this.encryptionKey));
        let unencryptedData = bytes.toString(CryptoJS.enc.Utf8);

        let object: T | null;
        // TRY to parse string as object
        try {
          object = JSON.parse(unencryptedData);
        }catch(er) {
          object = null;
        }

        return object ? object : unencryptedData;
    }
  }

  /**
   * Remove data from persistent storage
   * @param key Key to store data under. Should start with capability id.
   */
  static async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}
