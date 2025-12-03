const PisunInterpreter = (() => {
    const run = (code) => {
        const lines = code.split('\n');
        const vars = {}; // variable storage
        let result = '';

        for (let line of lines) {
            line = line.trim();
            if (line === '') continue;

            // --- let command ---
            if (line.startsWith('let ')) {
                const [, rest] = line.split('let ');
                let name, expr;

                if (rest.includes('=')) {
                    // format: let x = 10
                    [name, expr] = rest.split('=').map(s => s.trim());
                } else {
                    // format: let x 10
                    const parts = rest.split(' ').filter(s => s !== '');
                    name = parts[0];
                    expr = parts.slice(1).join(' ');
                }

                try {
                    const value = Function(...Object.keys(vars), `return ${expr}`)(...Object.values(vars));
                    vars[name] = value;
                } catch {
                    result += `Error evaluating expression for ${rest}\n`;
                }
            }

            // --- set command ---
            else if (line.startsWith('set ')) {
                const [, rest] = line.split('set ');
                const [name, ...exprParts] = rest.split(' ');
                const expr = exprParts.join(' ').trim();

                if (vars[name] !== undefined) {
                    try {
                        const value = Function(...Object.keys(vars), `return ${expr}`)(...Object.values(vars));
                        vars[name] = value;
                    } catch {
                        result += `Error evaluating expression for ${name}\n`;
                    }
                } else {
                    result += `Error: variable ${name} not defined\n`;
                }
            }

            // --- print command ---
            else if (line.startsWith('print(') && line.endsWith(')')) {
                const varName = line.slice(6, -1).trim();
                if (vars[varName] !== undefined) {
                    result += vars[varName] + '\n';
                } else {
                    result += `Error: ${varName} not defined\n`;
                }
            }

            // ignore other lines
        }

        return result || 'No output';
    };

    return { run };
})();
