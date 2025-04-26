const main = document.getElementById("pizza-wrapper");
const basket = document.getElementById("basket");
const basketTitleCount = document.getElementById("basket-title-count");

let totalItemCount = 0;
const pizzaQuantities = {};

fetch("http://51.38.232.174:3001/products")
	.then((res) => res.json())
	.then((data) => {
		for (let i = 0; i < data.length; i++) {
			const { name, price, image } = data[i];
			itemCreator(name, price, image);
		}
	});

function createElement(tag, jsp = {}) {
	const element = document.createElement(tag);

	for (const test in jsp) {
		element[test] = jsp[test];
	}
	return element;
}

function updateCounter() {
	basketTitleCount.textContent = `Votre panier (${totalItemCount})`;
}

function itemCreator(name, price, image) {
	const { pizzaItem, addToCart } = createPizzaItem(name, price, image);
	main.appendChild(pizzaItem);
	setupAddToCartButton(addToCart, name, price);
}

function createPizzaItem(name, price, image) {
	const pizzaItem = createElement("div");
	pizzaItem.classList.add("pizza-item");
	
	const pizzaImg = createElement("img");
	pizzaImg.src = image;
	pizzaImg.classList.add("pizza-picture");
	
	const addToCart = createElement("span");
	addToCart.classList.add("add-to-cart-btn");
	
	const cartIcon = createElement("img");
	cartIcon.src = "../images/carbon_shopping-cart-plus.svg";

	addToCart.appendChild(cartIcon);
	addToCart.innerHTML += "Ajouter au panier";

	const pizzaInfos = createElement("ul");
	pizzaInfos.classList.add("pizza-infos");
	
	const nameLi = createElement("li");
	nameLi.classList.add("pizza-name");
	nameLi.textContent = name;
	
	const priceLi = createElement("li");
	priceLi.classList.add("pizza-price");
	priceLi.textContent = `${price}$`;

	pizzaInfos.append(nameLi, priceLi);
	pizzaItem.append(pizzaImg, addToCart, pizzaInfos);

	return { pizzaItem, addToCart };
}

function setupAddToCartButton(addToCart, name, price) {
	let currentItemCounter = 0;

	addToCart.addEventListener("click", function() {
		if (currentItemCounter === 0) transformButtonToCounter(addToCart);
	});

	function transformButtonToCounter(button) {
		button.innerHTML = "";
		button.style.cssText = `
			background-color: var(--tia-maria);
			border-color: var(--tia-maria);
			color: var(--fantasy);
			gap: 15px;
			max-width: 200px;
			min-width: 150px;
			display: flex;
			align-items: center;
			justify-content: space-between;
		`;

		const btnMinus = createElement("div");
		btnMinus.classList.add("amount-organizer");
		
		const btnPlus = createElement("div");
		btnPlus.classList.add("amount-organizer");
		
		const counterText = createElement("p");
		counterText.classList.add("item-counter");
		counterText.textContent = currentItemCounter;

		const minus = createElement("p");
		minus.textContent = "-";
		
		const plus = createElement("p");
		plus.textContent = "+";

		btnMinus.appendChild(minus);
		btnPlus.appendChild(plus);

		button.append(btnMinus, counterText, btnPlus);

		btnPlus.addEventListener("click", function() {
			currentItemCounter++;
			totalItemCount++;

			if (!pizzaQuantities[name]) {
				pizzaQuantities[name] = { quantity: 0, price, resetCounter: null };
			}

			pizzaQuantities[name].quantity++;
			pizzaQuantities[name].resetCounter = function() {
				currentItemCounter = 0;
				counterText.textContent = currentItemCounter;
			};

			counterText.textContent = currentItemCounter;
			updateCounter();
			updateBasketDisplay();

			if (totalItemCount === 1) {
				basket.classList.remove("empty-basket");
				basket.classList.add("baskets-with-pizza");
			}
		});

		btnMinus.addEventListener("click", function() {
			if (currentItemCounter > 0) {
				currentItemCounter--;
				totalItemCount--;
				pizzaQuantities[name].quantity--;

				if (pizzaQuantities[name].quantity === 0) delete pizzaQuantities[name];

				counterText.textContent = currentItemCounter;
				updateCounter();
				updateBasketDisplay();

				if (totalItemCount === 0) {
					basket.classList.remove("baskets-with-pizza");
					basket.classList.add("empty-basket");
				}
			}
		});
	}
}

function updateBasketDisplay() {
	basket.innerHTML = "";

	if (totalItemCount === 0) {
		displayEmptyBasket();
	} else {
		displayBasketItems();

		const totalOrderParagraph = createElement("p");
		totalOrderParagraph.classList.add("total-order");
		
		const totalOrderTitleSpan = createElement("span");
		totalOrderTitleSpan.classList.add("total-order-title");
		totalOrderTitleSpan.textContent = "Order total";
		
		const totalOrderPriceSpan = createElement("span");
		totalOrderPriceSpan.classList.add("total-order-price");

		let totalAmount = 0;
		for (const name in pizzaQuantities) {
			totalAmount += pizzaQuantities[name].price * pizzaQuantities[name].quantity;
		}

		totalOrderPriceSpan.textContent = `$${totalAmount}`;
		totalOrderParagraph.append(totalOrderTitleSpan, totalOrderPriceSpan);

		const deliveryInfo = createElement("p");
		deliveryInfo.classList.add("delivery-info");
		deliveryInfo.textContent = "This is a ";
		
		const carbonNeutral = createElement("span");
		carbonNeutral.textContent = "carbon neutral";
		deliveryInfo.appendChild(carbonNeutral);
		deliveryInfo.innerHTML += " delivery";

		const confirmOrderBtn = createElement("a");
		confirmOrderBtn.classList.add("confirm-order-btn");
		confirmOrderBtn.href = "#";
		confirmOrderBtn.textContent = "Confirm order";
		confirmOrderBtn.addEventListener("click", createOrderConfirmationModal);

		basket.append(totalOrderParagraph, deliveryInfo, confirmOrderBtn);
	}
}

function displayEmptyBasket() {
	const img = createElement("img");
	img.src = "../images/pizza.png";
	const text = createElement("p");
	text.textContent = "Votre panier est vide...";
	basket.append(img, text);
}

function displayBasketItems() {
	for (const name in pizzaQuantities) {
		const { quantity, price } = pizzaQuantities[name];
		const item = createBasketItem(name, quantity, price);
		basket.appendChild(item);
	}
}

function createBasketItem(name, quantity, price) {
	const item = createElement("li");
	item.classList.add("basket-product-item");
	
	const title = createElement("span");
	title.classList.add("basket-product-item-name");
	title.textContent = name;

	const details = createElement("span");
	details.classList.add("basket-product-details");

	const qtySpan = createElement("span");
	qtySpan.classList.add("basket-product-details-quantity");
	qtySpan.textContent = `${quantity}x`;

	const unitSpan = createElement("span");
	unitSpan.classList.add("basket-product-details-unit-price");
	unitSpan.textContent = `@${price}`;

	const totalSpan = createElement("span");
	totalSpan.classList.add("basket-product-details-total-price");
	totalSpan.textContent = `$${price * quantity}`;

	details.append(qtySpan, unitSpan, totalSpan);

	const removeIcon = createElement("img");
	removeIcon.src = "../images/remove-icon.svg";
	removeIcon.alt = "";
	removeIcon.classList.add("basket-product-remove-icon");

	removeIcon.addEventListener("click", function() {
		if (pizzaQuantities[name]) {
			if (pizzaQuantities[name].resetCounter) {
				let resetFunc = pizzaQuantities[name].resetCounter;
				resetFunc();
			}
		}

		delete pizzaQuantities[name];

		let newTotal = 0;
		for (let pizzaName in pizzaQuantities) {
			newTotal = newTotal + pizzaQuantities[pizzaName].quantity;
		}
		totalItemCount = newTotal;

		updateCounter();
		
		updateBasketDisplay();

		if (totalItemCount === 0) {

			basket.classList.remove("baskets-with-pizza");
			basket.classList.add("empty-basket");
		}
	});

	item.append(title, details, removeIcon);
	return item;
}

function createOrderConfirmationModal() {
	const wrapper = createElement("div");
	wrapper.classList.add("order-modal-wrapper");
	
	const modal = createElement("div");
	modal.classList.add("order-modal");
	
	const checkImg = createElement("img");
	checkImg.src = "../images/carbon_checkmark-outline.svg";
	checkImg.alt = "";
	
	const title = createElement("p");
	title.classList.add("order-modal-title");
	title.textContent = "Order Confirmed";
	
	const subtitle = createElement("p");
	subtitle.classList.add("order-modal-subtitle");
	subtitle.textContent = "We hope you enjoy your food!";
	
	const orderList = createElement("ul");
	orderList.classList.add("order-detail");

	let totalPrice = 0;
	for (const name in pizzaQuantities) {
		const { quantity, price } = pizzaQuantities[name];
		const item = createElement("li");
		item.classList.add("order-detail-product-item");

		const img = createElement("img");
		img.src = "https://cdn.dummyjson.com/recipe-images/1.webp";
		img.alt = "";
		img.classList.add("order-detail-product-image");

		const productName = createElement("span");
		productName.classList.add("order-detail-product-name");
		productName.textContent = name;
		
		const productQuantity = createElement("span");
		productQuantity.classList.add("order-detail-product-quantity");
		productQuantity.textContent = `${quantity}x`;
		
		const unitPrice = createElement("span");
		unitPrice.classList.add("order-detail-product-unit-price");
		unitPrice.textContent = `@ $${price}`;
		
		const productTotal = createElement("span");
		productTotal.classList.add("order-detail-product-total-price");
		productTotal.textContent = `$${price * quantity}`;

		item.append(img, productName, productQuantity, unitPrice, productTotal);
		orderList.appendChild(item);
		totalPrice += price * quantity;
	}

	const totalLine = createElement("li");
	totalLine.classList.add("order-detail-total-price");
	
	const totalTitle = createElement("span");
	totalTitle.classList.add("total-order-title");
	totalTitle.textContent = "Order total";
	
	const totalAmount = createElement("span");
	totalAmount.classList.add("total-order-price");
	totalAmount.textContent = `$${totalPrice}`;
	
	totalLine.append(totalTitle, totalAmount);
	orderList.appendChild(totalLine);

	const newOrderBtn = createElement("a");
	newOrderBtn.classList.add("new-order-btn");
	newOrderBtn.href = "#";
	newOrderBtn.textContent = "Start ne	 order";
	newOrderBtn.addEventListener("click", function() {
		location.reload();
	});

	modal.append(checkImg, title, subtitle, orderList, newOrderBtn);
	wrapper.appendChild(modal);
	document.body.appendChild(wrapper);
}