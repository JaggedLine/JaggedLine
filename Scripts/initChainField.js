let personalFieldStyle = {
	node_radius: 10,
	node_color: 'rgba(0, 96, 57, 1)',
    used_node_color: 'rgba(50, 50, 255, 1)',
    delete_node_color: 'rgba(255, 110, 110, 0.9)',
    first_delete_node_color: 'rgba(255, 110, 110, 0.9) url("Images/cross.png")',

    node_border_radius: 0,
    node_border_color: 'transparent',
    used_node_border_color: 'black',

    clickable_node_radius: 20,

	segment_height: 10,
    segment_color: 'rgba(64, 64, 255, 0.9)',
    delete_segment_color: 'rgba(255, 127, 127, 0.9)',

    show_grid: false,
    grid_width: 4,
    grid_color: '#ffc79b',

    // background_color: '#fffefe',
    background_border: 10,

    minGridStep: 40,
    maxGridStep: 60,
}

let chainField = new ChainField(personalFieldStyle);

chainField.onchange = function() {
    if (this.win) {
        this.make_busy()
        setTimeout(prompt, 300, 'Вы победили! Настало время ввести ваше имя (прозвище, кличку)...')
    }
    data.setAttribute('score', this.lines_cnt);
    data.setAttribute('points', JSON.stringify(this.points));
    data.setAttribute('field_size_x', this.sizeX);
    data.setAttribute('field_size_y', this.sizeY);
}
