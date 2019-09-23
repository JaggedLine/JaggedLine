var d = document;
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


class Table {
	constructor() 
	{
		this.sizeX = 0;
		this.sizeY = 0;
		this.points = new Array();
		this.sz = 60;
		this.games_cnt = 0;
		this.width = 20;
		this.show_score = true;
		this.segments_color = 'green'
		this.id = 'main'

		let table = this;
		this.draw_segment_animations = {
			no_animation: function (x1, y1, x2, y2) // real coordinates 
				{	
					var xc = (x1 + x2) / 2, yc = (y1 + y2) / 2;
					var len = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.width;
					var ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
					var segment_style = 'background: '+table.segments_color+'; transform: rotate(' + ang + 'deg); width: ' + len + 'px; top: ' + yc + 'px; left: ' + (xc - len / 2 + table.width / 2) + 'px';
					segments.innerHTML += '<div id="segment_'+table.id+'_' + table.lines_cnt() + '" class="segment" style="' + segment_style + '""></div>';
				},
			linear_animation: function (x1, y1, x2, y2) 
				{
					table.busy = true;
					var ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
					segments.innerHTML += '<div id="segment_'+table.id+'_' + table.lines_cnt() + '"; background: '+table.segments_color+'; class="segment" style="transform: rotate(' + ang + 'deg)"></div>';
					let segment = table.segment(table.lines_cnt());

					function timer(t) {
						if (t >= 1.05) {
							table.busy = false;
							return;
						}
						setTimeout(() => timer(t + 0.05), 10);
						var xc = x1 * (1 - t) + ((x1 + x2) / 2) * t, yc = y1 * (1 - t) + ((y1 + y2) / 2) * t;
						var len = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.width) * t;
						segment.style.width = len + 'px';
						segment.style.top = yc + 'px';
						segment.style.left = (xc - len / 2 + table.width / 2) + 'px';
					} 
					timer(0);
				},
			lesha_animation: function (x1, y1, x2, y2) 
				{
					table.busy = true;
					var ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
					segments.innerHTML += '<div id="segment_'+table.id+'_' + table.lines_cnt() + '"; background: '+table.segments_color+'; class="segment" style="transform: rotate(' + ang + 'deg)"></div>';
					let segment = table.segment(table.lines_cnt());

					function timer(t) {
						if (t >= 1.05) {
							table.busy = false;
							return;
						}
						setTimeout(() => timer(t + 0.05), 10);
						var xc = x1 * (1 - t) + ((x1 + x2) / 2) * t, yc = y1 * (1 - t) + ((y1 + y2) / 2) * t;
						var len1 = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.width) * 1;
						var len2 = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.width) * t;
						segment.style.width = len2 + 'px';
						segment.style.top = yc + 'px';
						segment.style.left = (xc - len1 / 2 + table.width / 2) + 'px';
					} 
					timer(0);
				}
			};

		this.destroy_segment_animation = {
			no_animation: function (N) 
				{
					segments.removeChild(table.segment(table.lines_cnt() - 1));
					table.points.pop();
					table.update_score();
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
							table.points.pop();
							table.update_score();
							if (N > 1) {
								table.destroy_segment_animation.linear_animation(N - 1, past + 1);
							} else {
								table.busy = false;
							}
							return;
						}
						setTimeout(() => timer(t - 0.05 * (1 + Math.min(N - t, past + t))), 10);
						var xc = x1 * (1 - t) + ((x1 + x2) / 2) * t, yc = y1 * (1 - t) + ((y1 + y2) / 2) * t;
						var len = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.width) * t;
						segment.style.width = len + 'px';
						segment.style.top = yc + 'px';
						segment.style.left = (xc - len / 2 + table.width / 2) + 'px';
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
							if (N > 1) {
								table.destroy_segment_animation.lesha_animation(N - 1, past + 1);
							} else {
								table.busy = false;
							}
							return;
						}
						setTimeout(() => timer(t - 0.05 * (1 + Math.min(N - t, past + t))), 10);
						var xc = x1 * (1 - t) + ((x1 + x2) / 2) * t, yc = y1 * (1 - t) + ((y1 + y2) / 2) * t;
						var len = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.width) * t;
						segment.style.top = yc + 'px';
						segment.style.width = len + 'px';
					} 
					timer(1);
				},

			};
		}

	segment(n) 
	{
		return d.getElementById('segment_'+this.id+'_'+n);
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
	}

	generate_table(x, y, f_click, start_point = [0, 0], end_point = [x - 1, y - 1])
	{
		nodes.innerHTML = '';
		segments.innerHTML = '';

		this.start_point = start_point;
		this.end_point = end_point;
		this.points = [start_point];
		this.sizeX = x; this.sizeY = y;

		this.busy = false;

		for (let i = 0; i < y; ++i)	{
			for (let j = 0; j < x; ++j) {
				let y_pos = i * this.sz, x_pos = j * this.sz;
				nodes.innerHTML += '<div id="node_' + i + '_' + j + '" class="node" style="top: ' + y_pos + 'px; left: ' + x_pos + 'px"></div>';
			}
		}
		for (let i = 0; i < y; ++i) {
			for (let j = 0; j < x; ++j) {
				let table = this;
				d.getElementById('node_' + i + '_' + j).onclick = function() {if (!table.busy) f_click(j, i, table)};
			}
		}
		d.getElementById('node_' + start_point[1] + '_' + start_point[0]).style.background = 'red';
		d.getElementById('node_' + end_point[1] + '_' + end_point[0]).style.background = 'red';
	}

	add_segment(x, y, animation_mode = this.draw_segment_animations.no_animation)
	{
		let last_x = this.points[this.lines_cnt()][0];
		let last_y = this.points[this.lines_cnt()][1];	
		animation_mode(last_x * this.sz, last_y * this.sz, x * this.sz, y * this.sz);
		this.points.push([x, y]);
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
		return false;
	}

}

function f_click_1(j, i, table)
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

	if ((i - last_y) ** 2 + (j - last_x) ** 2 - 5) {
		// alert('Distance should be ~' + Math.sqrt(5) + '!');
		return;
	}

	table.add_segment(j, i, table.draw_segment_animations.linear_animation);

	if (i == table.end_point[1] && j == table.end_point[0]) {
		setTimeout(function() {
			alert(student_name.value + ', your score is ' + table.lines_cnt())
			scores.innerHTML += '<tr><td id="game_'+table.games_cnt+'" style="text-align: center;">' + table.games_cnt + '</td><td>' + student_name.value + '</td><td style="text-align: center;">' + table.lines_cnt() + '<button style="float:right;" id = "show_path_' + table.games_cnt++ + '"><img src="eye.png" style="width: 30px; height: 30px"></button></td></tr>';
			d.getElementById('game_'+(table.games_cnt-1)).setAttribute('jagged_line', JSON.stringify(table.points));
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
