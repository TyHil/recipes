const text = (value) => ({
    type: "text",
    value,
});
const ingredient = (name, quantity, units) => ({
    type: "ingredient",
    name,
    quantity,
    units,
});
const cookware = (name, quantity) => ({
    type: "cookware",
    name,
    quantity,
});
const timer = (name, quantity, units) => ({
    type: "timer",
    name,
    quantity,
    units,
});
