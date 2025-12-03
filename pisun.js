function runPisun() {
    const code = document.getElementById("pisunCode").value;
    const outputElem = document.getElementById("output");
    let output = "";

    function pisunPrint(val) {
        output += val + "\n";
    }

    const lines = code.split("\n").map(l => l.trim());
    let envStack = [{}]; // environment stack for local vars
    let i = 0;

    function getVar(name) {
        for (let j = envStack.length - 1; j >= 0; j--) {
            if (name in envStack[j]) return envStack[j][name];
        }
        throw `Variable ${name} not defined`;
    }

    function setVar(name, value) {
        envStack[envStack.length - 1][name] = value;
    }

    function evalExpr(expr) {
        expr = expr.replace(/[a-zA-Z_]\w*/g, v => getVar(v));
        try {
            return eval(expr);
        } catch {
            throw "Invalid expression: " + expr;
        }
    }

    function runBlock(endIndex) {
        let i = 0;
        while (i < endIndex) {
            const line = lines[i];
            if (!line || line.startsWith("#")) { i++; continue; }
            
            if (line.startsWith("let ")) {
                const [name, expr] = line.slice(4).split("=");
                setVar(name.trim(), evalExpr(expr.trim()));
            } else if (line.startsWith("print(") && line.endsWith(")")) {
                const expr = line.slice(6, -1);
                pisunPrint(evalExpr(expr));
            } else if (line.startsWith("if ") && line.endsWith("start")) {
                const cond = line.slice(3, -5).trim();
                // find matching end
                let depth = 1;
                let j = i + 1;
                while (j < lines.length && depth > 0) {
                    if (lines[j].endsWith("start")) depth++;
                    else if (lines[j] == "end") depth--;
                    j++;
                }
                if (evalExpr(cond)) {
                    envStack.push({});
                    runBlock(j - i - 2);
                    envStack.pop();
                }
                i = j - 1;
            }
            i++;
        }
    }

    if (lines[0] !== "pisun start" || lines[lines.length - 1] !== "end") {
        outputElem.textContent = "Code must start with 'pisun start' and end with 'end'";
        return;
    }

    try {
        envStack.push({});
        runBlock(lines.length - 2);
        envStack.pop();
        outputElem.textContent = output;
    } catch (e) {
        outputElem.textContent = "Error: " + e;
    }
}
