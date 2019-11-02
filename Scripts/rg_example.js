function updateField() {
    let sizeX = inputSizeX.value, sizeY = inputSizeY.value;
    let startX = inputStartX.value, startY = inputStartY.value;
    let endX = inputEndX.value, endY = inputEndY.value;
    chainField.generate_table(sizeX, sizeY, [startX, startY], [endX, endY], cfKnightGame);
}

updateField();
