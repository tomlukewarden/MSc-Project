export class CoinManager {
  constructor(startingCoins = 0) {
    this._coins = startingCoins;
    this._listeners = [];
  }

  get coins() {
    return this._coins;
  }

  add(amount) {
    this._coins += amount;
    this._notify();
  }

  subtract(amount) {
    if (this._coins >= amount) {
      this._coins -= amount;
      this._notify();
      return true;
    }
    return false;
  }

  set(amount) {
    this._coins = amount;
    this._notify();
  }

  onChange(listener) {
    this._listeners.push(listener);
  }

  _notify() {
    this._listeners.forEach(fn => fn(this._coins));
  }
}