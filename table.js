let xxx;
let yyy = false;

function segments_intersect(x1, y1, x2, y2, x3, y3, x4, y4) // true if intersects
{
	let a = vector_mul(x2 - x1, y2 - y1, x3 - x1, y3 - y1) * vector_mul(x2 - x1, y2 - y1, x4 - x1, y4 - y1);
	let b = vector_mul(x4 - x3, y4 - y3, x1 - x3, y1 - y3) * vector_mul(x4 - x3, y4 - y3, x2 - x3, y2 - y3);
	if (a <= 0 && b <= 0)
	{
		if (a == 0 && b == 0) 
		{
			// оставим на потом)
			return false;
		}
		return true;
	}
	return false;
}

function vector_mul(x1, y1, x2, y2) 
{
	return x1*y2 - x2*y1;
}

function addElement(parent, tag, style, opt)
{
	elem = d.createElement(tag);
	for (let prop in opt) {
		elem.setAttribute(prop, opt[prop]);
	}
	let styleText = '';
	for (let prop in style) {
		styleText += ' ' + prop + ': ' + style[prop] + ';'
	}
	elem.style.cssText = styleText;
	parent.append(elem);
	return elem;
}


class Table {
	constructor(opt = {}) 
	{
		this.sizeX = 0;
		this.sizeY = 0;
		this.points = new Array();
		this.games_cnt = 0;

		this.id = opt.id === undefined ? 'main' : opt.id;
		this.sz = opt.sz || 60;

		this.segment_height = opt.segment_height || 15;
		this.segment_color = opt.segment_color || 'skyblue';

		this.node_radius = opt.node_radius || 15;
		this.node_color = opt.node_color || 'green';
		this.used_node_color = opt.used_node_color || this.node_color;
		this.start_node_color = opt.start_node_color || 'red';
		this.end_node_color = opt.end_node_color || 'black';

		this.covered_node = 0;
		this.hover_node_color = 'grey';
		this.delete_node_color = opt.delete_node_color || this.node_color;
		this.first_delete_node_color = opt.first_delete_node_color || this.delete_node_color;
		this.delete_segment_color = opt.delete_segment_color || this.segment_color;

		this.show_score = opt.show_score === undefined ? true : opt.show_score;

		let table = this;
		this.draw_segment_animations = {
			no_animation: function (x1, y1, x2, y2) // real coordinates 
				{	
					let xc = (x1 + x2) / 2, yc = (y1 + y2) / 2;
					let len = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.segment_height;
					let ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
					addElement(segments, 'div',
						{
							background: table.segment_color,
							transform: `rotate(${ang}deg)`,
							width: `${len}px`,
							height: `${table.segment_height}px`,
							top: `${yc + table.node_radius - table.segment_height / 2}px`,
							left: `${xc - len / 2 + table.node_radius}px`,
							'border-radius': `${table.segment_height / 2}px`
						},
						{
							id: `segment_${table.id}_${table.lines_cnt()}`,
							class: `segment`
						});
				},
			linear_animation: function (x1, y1, x2, y2) 
				{
					table.busy = true;
					let ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
					let segment = addElement(segments, 'div', 
						{
							background: table.segment_color,
							transform: 'rotate(' + ang + 'deg)',
							height: `${table.segment_height}px`,
							'border-radius': `${table.segment_height / 2}px`
						}, {
							id: 'segment_' + table.id + '_' + table.lines_cnt(),
							class: 'segment'
						});

					function timer(t) {
						if (t >= 1.05) {
							table.busy = false;
							return;
						}
						setTimeout(() => timer(t + 0.1), 20);
						let xc = x1 * (1 - t) + ((x1 + x2) / 2) * t, yc = y1 * (1 - t) + ((y1 + y2) / 2) * t;
						let len = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.segment_height) * t;
						segment.style.width = len + 'px';
						segment.style.top = yc + table.node_radius - table.segment_height / 2 + 'px';
						segment.style.left = (xc - len / 2 + table.node_radius) + 'px';
					} 
					timer(0);
				},
			lesha_animation: function (x1, y1, x2, y2) 
				{
					table.busy = true;
					let ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
					let segment = addElement(segments, 'div', 
						{
							background: table.segment_color,
							transform: 'rotate(' + ang + 'deg)',
							height: table.segment_height
						}, {
							id: 'segment_' + table.id + '_' + table.lines_cnt(),
							class: 'segment'
						});

					function timer(t) {
						if (t >= 1.05) {
							table.busy = false;
							return;
						}
						setTimeout(() => timer(t + 0.05), 10);
						let xc = x1 * (1 - t) + ((x1 + x2) / 2) * t, yc = y1 * (1 - t) + ((y1 + y2) / 2) * t;
						let len1 = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.segment_height) * 1;
						let len2 = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.segment_height) * t;
						segment.style.width = len2 + 'px';
						segment.style.top = yc + table.node_radius - table.segment_height / 2 + 'px';
						segment.style.left = (xc - len1 / 2 + table.node_radius) + 'px';
					} 
					timer(0);
				}
			};

		this.destroy_segment_animation = {
			no_animation: function (N) 
				{
					segments.removeChild(table.segment(table.lines_cnt() - 1));
					table.update_score();
					table.update_screen();
					if (N > 1) {table.destroy_segment_animation.no_animation(N - 1);}
				},
			linear_animation: function (N, past = 0) 
				{
					table.busy = true;
					let segment = table.segment((table.lines_cnt() - 1));
					let x2 = table.points[table.lines_cnt()][0] * table.sz, y2 = table.points[table.lines_cnt()][1] * table.sz;
					let x1 = table.points[table.lines_cnt() - 1][0] * table.sz, y1 = table.points[table.lines_cnt() - 1][1] * table.sz;		

					function timer(t) {
						if (t <= 0) {
							segments.removeChild(table.segment(table.lines_cnt() - 1));
							let xy = table.points.pop();
							table.node(xy[1], xy[0]).style.background = table.node_color;
							table.update_score();
							table.update_screen();
							if (N > 1) {
								table.destroy_segment_animation.linear_animation(N - 1, past + 1);
							} else {
								table.busy = false;
							}
							return;
						}
						setTimeout(() => timer(t - 0.1 * (1 + Math.min(N - t, past + t))), 20);
						let xc = x1 * (1 - t) + ((x1 + x2) / 2) * t, yc = y1 * (1 - t) + ((y1 + y2) / 2) * t;
						let len = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.segment_height) * t;
						segment.style.width = len + 'px';
						segment.style.top = yc + table.node_radius - table.segment_height / 2 + 'px';
						segment.style.left = (xc - len / 2 + table.node_radius) + 'px';
					} 
					timer(1);
				},
			lesha_animation: function (N, past = 0) 
				{
					table.busy = true;
					let segment = table.segment((table.lines_cnt() - 1));
					let x2 = table.points[table.lines_cnt()][0] * table.sz, y2 = table.points[table.lines_cnt()][1] * table.sz;
					let x1 = table.points[table.lines_cnt() - 1][0] * table.sz, y1 = table.points[table.lines_cnt() - 1][1] * table.sz;		

					function timer(t) {
						if (t <= 0) {
							segments.removeChild(table.segment(table.lines_cnt() - 1));
							table.points.pop();
							table.update_score();
							this.update_screen();
							if (N > 1) {
								table.destroy_segment_animation.lesha_animation(N - 1, past + 1);
							} else {
								table.busy = false;
							}
							return;
						}
						setTimeout(() => timer(t - 0.05 * (1 + Math.min(N - t, past + t))), 10);
						let xc = x1 * (1 - t) + ((x1 + x2) / 2) * t, yc = y1 * (1 - t) + ((y1 + y2) / 2) * t;
						let len = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.width) * t;
						segment.style.top = yc + table.node_radius - table.segment_height / 2 + 'px';
						segment.style.width = len + 'px';
					} 
					timer(1);
				},

			};
		}

	make_busy() {
		this.busy = true;
	}

	not_busy() {
		this.busy = false;
	}

	segment(n) 
	{
		return d.getElementById('segment_'+this.id+'_'+n);
	}

	node(x, y)
	{
		return d.getElementById('node_'+this.id+'_'+x+'_'+y);
	}

	update_screen()
	{
		for (let x = 0; x < this.sizeX; ++x) {
			for (let y = 0; y < this.sizeY; ++y) {
				this.node(y, x).style.background = this.node_color;
			}
		}
		for (let point of this.points) {
			this.node(point[1], point[0]).style.background = this.used_node_color;
		}
		for (let n = 0; n < this.lines_cnt(); n++) {
			this.segment(n).style.background = this.segment_color;
		}
		if(this.covered_node) {
			let n = this.find_node(this.covered_node[0], this.covered_node[1]);
			if (n != this.points.length - 1) {
				let x = this.covered_node[0], y = this.covered_node[1];
				if (n == -1) {
					this.node(y, x).style.background = this.hover_node_color;
				} else {
					n++;
					this.node(y, x).style.background = this.first_delete_node_color;
					for (;n < this.points.length; n++) {
						this.node(this.points[n][1], this.points[n][0]).style.background = this.delete_node_color;
						this.segment(n-1).style.background = this.delete_segment_color;
					}
				}
			}
		}
		if (this.start_point) {this.node(this.start_point[1], this.start_point[0]).style.background = this.start_node_color};
		if (this.end_point) {this.node(this.end_point[1], this.end_point[0]).style.background = this.end_node_color};
	}

	lines_cnt()
	{
		return this.points.length - 1;
	}

	update_score()
	{
		if (this.show_score) {
			score.innerHTML = this.lines_cnt();
		}
	}

	find_node(x, y)
	{
		for (let i = 0; i < this.points.length; i++) {
			let node = this.points[i];
			if (node[0] == x && node[1] == y) {
				return i;
			}
		}
		return -1;
	}

	clear_table() 
	{
		let for_delete = [];
		for (let child of segments.children) {
			if (child.getAttribute('id').startsWith('segment_' + this.id + '_')) {
				for_delete.push(child)
			}
		}
		for (let child of for_delete) {
			segments.removeChild(child);
		}
		this.points = [this.start_point];
		this.update_score();
		this.update_screen();
	}

	delete_table()
	{
		this.clear_table();
		let for_delete = []
		for (let child of nodes.children) {
			if (child.getAttribute('id').startsWith('node_' + this.id + '_')) {
				for_delete.push(child)
			}
		}
		for (let child of for_delete) {
			nodes.removeChild(child);
		}

	}

	generate_table(x, y, f_click = f_click_1, start_point = [0, 0], end_point = [x - 1, y - 1])
	{
		let for_delete = [];
		for (let child of segments.children) {
			if (child.getAttribute('id').startsWith('segment_' + this.id + '_')) {
				for_delete.push(child)
			}
		}
		for (let child of for_delete) {
			segments.removeChild(child);
		}
		for_delete = []
		for (let child of nodes.children) {
			if (child.getAttribute('id').startsWith('node_' + this.id + '_')) {
				for_delete.push(child)
			}
		}
		for (let child of for_delete) {
			nodes.removeChild(child);
		}

		this.start_point = start_point;
		this.end_point = end_point;
		this.points = [start_point];
		this.sizeX = x; this.sizeY = y;

		this.busy = false;

		for (let i = 0; i < y; ++i)	{
			for (let j = 0; j < x; ++j) {
				let y_pos = i * this.sz, x_pos = j * this.sz;
				let node = addElement(nodes, 'div', 
					{
						top: `${y_pos}px`, 
						left: `${x_pos}px`,
						background: this.node_color,
						width: `${this.node_radius*2}px`,
						height: `${this.node_radius*2}px`
					}, {
						id: `node_${this.id}_${i}_${j}`, 
						class: 'node'
					});
				let table = this
				node.onmouseover = function() {table.covered_node = [j, i]; table.update_screen()};
				node.onmouseout = function() {table.covered_node = 0; table.update_screen()};
				// nodes.innerHTML += '<div id="node_' + i + '_' + j + '" class="node" style="top: ' + y_pos + 'px; left: ' + x_pos + 'px"></div>';
			}
		}
		for (let i = 0; i < y; ++i) {
			for (let j = 0; j < x; ++j) {
				let table = this;
				this.node(i, j).onclick = function() {if (!table.busy) f_click(j, i, table)};
			}
		}
		this.node(start_point[1], start_point[0]).style.background = this.start_node_color;
		this.node(end_point[1], end_point[0]).style.background = this.end_node_color;
	}

	add_segment(x, y, animation_mode = this.draw_segment_animations.no_animation)
	{
		let last_x = this.points[this.lines_cnt()][0];
		let last_y = this.points[this.lines_cnt()][1];	
		animation_mode(last_x * this.sz, last_y * this.sz, x * this.sz, y * this.sz);
		this.points.push([x, y]);
		this.update_screen();
		this.update_score();

	}

	destroy_segments(x, y, animation_mode = this.destroy_segment_animation.no_animation)
	{
		for (let n = 0; n < this.lines_cnt(); ++n) {				
			if (x == this.points[n][0] && y == this.points[n][1]) {
				animation_mode(this.lines_cnt() - n);
				return true;
			}
		}
		this.update_score();
		this.update_screen();
		return false;
	}

}

function f_click_1(j, i, table)
{
	let last_x = table.points[table.lines_cnt()][0];
	let last_y = table.points[table.lines_cnt()][1];
	len = table.lines_cnt();

	if (table.destroy_segments(j, i, table.destroy_segment_animation.linear_animation)) {return;}

	for (let n = 1; n <= len; ++n) {
		if (segments_intersect(j, i, last_x, last_y, table.points[n-1][0], table.points[n-1][1], table.points[n][0], table.points[n][1])) {
			// alert('Intersection!!');
			return;
		}
	}

	if ((i - last_y) ** 2 + (j - last_x) ** 2 - 5) {
		// alert('Distance should be ~' + Math.sqrt(5) + '!');
		return;
	}

	table.add_segment(j, i, table.draw_segment_animations.linear_animation);

	if (i == table.end_point[1] && j == table.end_point[0]) {
		setTimeout(function() {
			alert(student_name.value + ', your score is ' + table.lines_cnt());

			let tr = addElement(scores, 'tr');
			addElement(tr, 'td', {'text-align': 'center'}, {id: `game_${table.games_cnt}`}).innerHTML = table.games_cnt;
			addElement(tr, 'td', {}, {}).innerHTML = student_name.value;
			let td = addElement(tr, 'td', {'text-align': 'center'}, {});
			td.innerHTML = table.lines_cnt();
			addElement(td, 'button',
				{
					float: 'right',
					'background': 'white url(eye.png)',
					'background-size': '100%',
					width: '30px',
					height: '30px'
				}, {
					id: `show_path_${table.games_cnt++}`
				});
			
			d.getElementById('game_'+(table.games_cnt-1)).setAttribute('jagged_line', JSON.stringify({x: table.sizeX, y: table.sizeY, points: table.points}));
			for (let i = 0; i < table.games_cnt; i++) {
				d.getElementById('show_path_'+i).addEventListener('mousedown', function() {xxx = showPath(i); yyy = true;})
			}
			d.addEventListener('mouseup', function() {if(yyy) {hidePath(xxx); yyy=false}})
			student_name.value = student_name.value == 'Vanyok' ? 'Feduk' : student_name.value == 'Feduk' ? 'Lesha' : 'Vanyok';
			table.clear_table();
		}, 300)
	}
}

function f_click_2(j, i, table)
{
	let last_x = table.points[table.lines_cnt()][0];
	let last_y = table.points[table.lines_cnt()][1];
	len = table.lines_cnt();

	if (table.destroy_segments(j, i, table.destroy_segment_animation.lesha_animation)) {return;}

	for (let n = 1; n <= len; ++n) {
		if (segments_intersect(j, i, last_x, last_y, table.points[n-1][0], table.points[n-1][1], table.points[n][0], table.points[n][1])) {
			// alert('Intersection!!');
			return;
		}
	}

	n = table.points.length - 1;
	if (n >= 1) {
		let last_len = (table.points[n-1][0]-table.points[n][0])**2 + (table.points[n-1][1]-table.points[n][1])**2
		if ((i - last_y) ** 2 + (j - last_x) ** 2 <= last_len){
			// alert('Distance should be >' + Math.sqrt(last_len) + '!');
			return;
		}
	}

	table.add_segment(j, i, table.draw_segment_animations.linear_animation);

	if (j == table.end_point[1] && i == table.end_point[0]) {
		setTimeout(function() {
			alert(student_name.value + ', your score is ' + table.lines_cnt())
			scores.innerHTML += '<tr><td style="text-align: center;">' + ++table.games_cnt + '</td><td>' + student_name.value + '</td><td>' + table.lines_cnt() + '</td></tr>';
			student_name.value = student_name.value == 'Vanyok' ? 'Feduk' : student_name.value == 'Feduk' ? 'Lesha' : 'Vanyok';
			table.clear_table();
		}, 300);
	}
}
