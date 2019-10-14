function fedroFindMax(event)
{
    const off = 3;
    let n, m, x1, y1, x2, y2, col, used, prec;
    let depth = 0, global_ops = 0;
    let dir = [[1, 2], [1, -2], [2, 1], [2, -1], [-1, 2], [-1, -2], [-2, 1], [-2, -1]];
    let path = [];
    let anspath = [];

    function crossProduct(x1, y1, x2, y2) {
        return x1 * y2 - x2 * y1;
    }

    function segmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        let p1 = crossProduct(x2 - x1, y2 - y1, x3 - x1, y3 - y1);
        let p2 = crossProduct(x2 - x1, y2 - y1, x4 - x1, y4 - y1);
        let p3 = crossProduct(x4 - x3, y4 - y3, x1 - x3, y1 - y3);
        let p4 = crossProduct(x4 - x3, y4 - y3, x2 - x3, y2 - y3);
        if (p1 * p2 == 0 && p3 * p4 == 0) {
            return false;
        }
        if (p1 * p2 <= 0 && p3 * p4 <= 0) {
            return true;
        }
        return false;
    }

    function isCorrect(x, y) {
        return x >= 0 && x < n && y >= 0 && y < m;
    }

    function init(data) {
        n = data[0]*1;
        m = data[1]*1;
        x1 = data[2]*1;
        y1 = data[3]*1;
        x2 = data[4]*1;
        y2 = data[5]*1;
        col = new Array(n);
        used = new Array(n);
        for (let i = 0; i < n; i++) {
            used[i] = new Array(m);
            col[i] = new Array(m);
            for (let j = 0; j < m; j++) {
                used[i][j] = false;
                col[i][j] = -1;
            }
        }
        path.push([x1, y1]);
        anspath.push([x1, y1]);
        col[x1][y1] = depth;
        prec = new Array(dir.length);
        for (let id = 0; id < 8; id++) {
            prec[id] = [];
        }
        for (let id = 0; id < dir.length; id++) {
            let curx = dir[id][0], cury = dir[id][1];
            for (let lastx = -off; lastx <= off; lastx++) {
                for (let lasty = -off; lasty <= off; lasty++) {
                    for (let id1 = 0; id1 < dir.length; id1++) {
                        let nextx = lastx + dir[id1][0], nexty = lasty + dir[id1][1];
                        if (nextx < -off || nextx > off || nexty < -off || nexty > off) continue;
                        if (segmentsIntersect(0, 0, curx, cury, lastx, lasty, nextx, nexty)) {
                            prec[id].push([lastx, lasty, nextx, nexty]);
                        }
                    }
                }
            }
        }
    }

    function checkIntersection(lastx, lasty, id) {
        for (let elem of prec[id]) {
            let curx1 = elem[0] + lastx, cury1 = elem[1] + lasty, curx2 = elem[2] + lastx, cury2 = elem[3] + lasty;
            if (!isCorrect(curx1, cury1) || !isCorrect(curx2, cury2)) {
                continue;
            }
            if (col[curx1][cury1] == -1 || col[curx2][cury2] == -1) {
                continue;
            }
            if (col[curx1][cury1] - col[curx2][cury2] == 1) {
                return false;
            }
        }
        return true;
    }

    function isOk(curx, cury) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                used[i][j] = false;
            }
        }
        let q = [[curx, cury]];
        used[curx][cury] = true;
        for (let id = 0; id < q.length; id++) {
            let lastx = q[id][0], lasty = q[id][1];
            for (let d = 0; d < 8; d++) {
                let nextx = lastx + dir[d][0], nexty = lasty + dir[d][1];
                if (!isCorrect(nextx, nexty)) {
                    continue;
                }
                if (used[nextx][nexty] || col[nextx][nexty] != -1) {
                    continue;
                }
                if (!checkIntersection(lastx, lasty, d)) {
                    continue;
                }
                q.push([nextx, nexty]);
                used[nextx][nexty] = true;
                if (used[x2][y2]) break;
            }
        }
        return used[x2][y2];
    }

    function recursiveGen() {
        let lastx = path[path.length - 1][0];
        let lasty = path[path.length - 1][1];
        if (depth < 10 && !isOk(lastx, lasty)) return;
        global_ops++;
        if (lastx == x2 && lasty == y2) {
            if (anspath.length < path.length) {
                anspath = path.slice(0);
                postMessage(path);
            }
            if (global_ops % 50000 == 0) {
                postMessage(path);
            }
            return;
        }
        for (let id = 0; id < dir.length; id++) {
            let nextx = lastx + dir[id][0];
            let nexty = lasty + dir[id][1];
            if (!isCorrect(nextx, nexty)) {
                continue;
            }
            if (col[nextx][nexty] != -1) {
                continue;
            }
            if (!checkIntersection(lastx, lasty, id)) {
                continue;
            }
            path.push([nextx, nexty]);
            depth++;
            col[nextx][nexty] = depth;
            recursiveGen();
            col[nextx][nexty] = -1;
            depth--;
            path.pop();
        }
    }

    onmessage=function(event) {
        init(event.data);
        postMessage(anspath);
        recursiveGen(x2, y2);
        postMessage('finish');
    }
}
