function doFindPath(data) {
    function fedroFindMax(n, m, x1, y1, x2, y2)
    {
        let dirx = new Array(1, 1, 2, 2, -1, -1, -2, -2);
        let diry = new Array(2, -2, 1, -1, 2, -2, 1, -1);
        let pathx = new Array();
        let pathy = new Array();
        let anspathx = new Array();
        let anspathy = new Array();
        let used = new Array(n);
        let max_answer = 0;

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

        let global_ops = 0;

        function recursiveGen() {
            let lastx = pathx[pathx.length - 1];
            let lasty = pathy[pathy.length - 1];
            // console.log(lastx, lasty, x2, y2, pathx.length);
            if (lastx == x2 && lasty == y2 && max_answer < pathx.length - 1) {
                max_answer = pathx.length - 1;
                anspathx = pathx.slice(0);
                anspathy = pathy.slice(0);
            }
            if (lastx == x2 && lasty == y2) return;
            for (let rot = 0; rot < dirx.length; rot++) {
                let nextx = lastx + dirx[rot];
                let nexty = lasty + diry[rot];
                if (nextx < 0 || nextx >= n || nexty < 0 || nexty >= m) {
                    continue;
                }
                if (used[nextx][nexty]) {
                    continue;
                }
                let f = false;
                for (let id = 0; id < pathx.length - 1; id++) {
                    if (segmentsIntersect(pathx[id], pathy[id], pathx[id + 1], pathy[id + 1], lastx, lasty, nextx, nexty)) {
                        f = true;
                        break;
                    }
                }
                if (f) continue;
                pathx.push(nextx);
                pathy.push(nexty);
                used[nextx][nexty] = true;
                recursiveGen();
                used[nextx][nexty] = false;
                pathx.pop();
                pathy.pop();
            }
        }

        for (let i = 0; i < n; i++) {
            used[i] = new Array(m);
            for (let j = 0; j < m; j++) {
                used[i][j] = false;
            }
        }
        used[x1][y1] = true;
        pathx.push(x1);
        pathy.push(y1);
        anspathx.push(x1);
        anspathy.push(y1);
        // Tbl.clear_table();
        recursiveGen(x2, y2);
        // Tbl.clear_table();
        // for (let id = 0; id < anspathx.length - 1; id++) {
        //     drawFunction(anspathx[id], anspathy[id], anspathx[id + 1], anspathy[id + 1]);
        // }
        let ans = [];
        for (let id = 0; id < anspathx.length; id++) {
            ans.push([anspathx[id], anspathy[id]]);
        }
        return ans;
    }
    onmessage=function(event) {
        let n = event.data[0]*1, m = event.data[1]*1;
        let x1 = event.data[2]*1, y1 = event.data[3]*1, x2 = event.data[4]*1, y2 = event.data[5]*1;
        let fedro_answer = fedroFindMax(n, m, y1, x1, y2, x2);
        postMessage(fedro_answer);
    }
}