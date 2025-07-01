import { saveToLocal, loadFromLocal } from "../utils/localStorage";

export class CoinManager {
  constructor(startingCoins = 0, saveKey = "coins") {
    this._coins = Math.max(0, Math.floor(startingCoins));
    this._listeners = [];
    this._saveKey = saveKey;
  }

  get coins() {
    return this._coins;
  }

  add(amount) {
    const amt = Math.max(0, Math.floor(amount));
    if (amt > 0) {
      this._coins += amt;
      this._notify();
      this._save();
    }
  }

  subtract(amount) {
    const amt = Math.max(0, Math.floor(amount));
    if (this._coins >= amt) {
      this._coins -= amt;
      this._notify();
      this._save();
      return true;
    }
    return false;
  }

  set(amount) {
    this._coins = Math.max(0, Math.floor(amount));
    this._notify();
    this._save();
  }

  onChange(listener) {
    this._listeners.push(listener);
    // Immediately call with current value
    listener(this._coins);
    // Return an unsubscribe function
    return () => {
      this._listeners = this._listeners.filter(fn => fn !== listener);
    };
  }

  _notify() {
    this._listeners.forEach(fn => fn(this._coins));
  }

  _save() {
    saveToLocal(this._saveKey, this._coins);
  }

  static load(saveKey = "coins") {
    const coins = loadFromLocal(saveKey) || 0;
    return new CoinManager(coins, saveKey);
  }
}