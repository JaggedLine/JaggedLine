function do_heavy_computations()
{
	let N = 1e9, s = 0;
	for (let i = 0; i < N; ++i)
		s += i ^ 3;
	postMessage('Yeah, it is ' + s);
}