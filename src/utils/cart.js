export function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

export function addToCart(book) {
  const cart = getCart();
  cart.push(book);
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem("cart");
}
