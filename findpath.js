function fedroFindMax(event)
{
    let n, m, x1, y1, x2, y2;
    let dirx, diry, pathx, pathy, anspathx, anspathy, used, used1, max_answer;

    function crossProduct(x1, y1, x2, y2) {
        return x1 * y2 - x2 * y1;
    }

    function submitCurrentMax() {
        let ans = [];
        for (let id = 0; id < anspathx.length; id++) {
            ans.push([anspathx[id], anspathy[id]]);
        }
        postMessage(ans);
    }

    function submitCurrent() {
        let ans = [];
        for (let id = 0; id < pathx.length; id++) {
            ans.push([pathx[id], pathy[id]]);
        }
        postMessage(ans);
    }

    function finish() {
        submitCurrentMax();
        postMessage('finish');
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

    function checkIntersection(lastx, lasty, nextx, nexty) {
        for (let id = 0; id < pathx.length - 1; id++) {
            if (segmentsIntersect(pathx[id], pathy[id], pathx[id + 1], pathy[id + 1], 
                lastx, lasty, nextx, nexty)) {
                return false;
            }
        }
        return true;
    }

    function isOk(curx, cury) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                used1[i][j] = false;
            }
        }
        let q = new Array();
        q.push([curx, cury]);
        used1[curx][cury] = true;
        for (let id = 0; id < q.length; id++) {
            let lastx = q[id][0], lasty = q[id][1];
            for (let d = 0; d < 8; d++) {
                let nextx = lastx + dirx[d], nexty = lasty + diry[d];
                if (nextx < 0 || nextx >= n || nexty < 0 || nexty >= m) continue;
                if (used1[nextx][nexty]) continue;
                if (used[nextx][nexty]) continue;
                if (!checkIntersection(lastx, lasty, nextx, nexty)) continue;
                q.push([nextx, nexty]);
                used1[nextx][nexty] = true;
                if (used1[x2][y2]) break;
            }
        }
        return used1[x2][y2];
    }

    let global_ops = 0;
    let depth = 0;

    function recursiveGen() {
        let lastx = pathx[pathx.length - 1];
        let lasty = pathy[pathy.length - 1];
        if (depth < 10 && !isOk(lastx, lasty)) return;
        global_ops++;
        // if (global_ops % 500000 == 0) {
        //     submitCurrent();
        // }
        // console.log(lastx, lasty, x2, y2, pathx.length);
        if (lastx == x2 && lasty == y2 && max_answer < pathx.length - 1) {
            max_answer = pathx.length - 1;
            anspathx = pathx.slice(0);
            anspathy = pathy.slice(0);
            submitCurrentMax();
        }
        if (lastx == x2 && lasty == y2 && global_ops % 5000 == 0) {
            submitCurrent();
            return;
        }
        for (let rot = 0; rot < dirx.length; rot++) {
            let nextx = lastx + dirx[rot];
            let nexty = lasty + diry[rot];
            if (nextx < 0 || nextx >= n || nexty < 0 || nexty >= m) continue;
            if (used[nextx][nexty]) continue;
            if (!checkIntersection(lastx, lasty, nextx, nexty)) continue;
            pathx.push(nextx);
            pathy.push(nexty);
            used[nextx][nexty] = true;
            depth++;
            recursiveGen();
            depth--;
            used[nextx][nexty] = false;
            pathx.pop();
            pathy.pop();
        }
    }
    onmessage=function(event) {
        n = event.data[0]*1;
        m = event.data[1]*1;
        x1 = event.data[2]*1;
        y1 = event.data[3]*1;
        x2 = event.data[4]*1;
        y2 = event.data[5]*1;
        dirx = new Array(1, 1, 2, 2, -1, -1, -2, -2);
        diry = new Array(2, -2, 1, -1, 2, -2, 1, -1);
        pathx = new Array();
        pathy = new Array();
        anspathx = new Array();
        anspathy = new Array();
        used = new Array(n);
        used1 = new Array(n);
        max_answer = 0;
        for (let i = 0; i < n; i++) {
            used[i] = new Array(m);
            used1[i] = new Array(m);
            for (let j = 0; j < m; j++) {
                used[i][j] = used1[i][j] = false;
            }
        }
        used[x1][y1] = true;
        pathx.push(x1);
        pathy.push(y1);
        anspathx.push(x1);
        anspathy.push(y1);
        submitCurrentMax();
        recursiveGen(x2, y2);
        finish();
    }
}
