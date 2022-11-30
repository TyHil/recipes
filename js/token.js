export const text = (value) => ({
    type: "text",
    value,
});
export const ingredient = (name, quantity, units) => ({
    type: "ingredient",
    name,
    quantity,
    units,
});
export const cookware = (name, quantity) => ({
    type: "cookware",
    name,
    quantity,
});
export const timer = (name, quantity, units) => ({
    type: "timer",
    name,
    quantity,
    units,
});
