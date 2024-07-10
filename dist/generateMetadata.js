"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
console.clear();
let searchAllFilesCache = new Map();
let allFiles = recursiveReaddir("src");
function recursiveReaddir(dir) {
    let files = (0, fs_1.readdirSync)(dir);
    let result = [];
    for (let file of files) {
        let path = (0, path_1.join)(dir, file);
        let stat = (0, fs_1.statSync)(path);
        if (stat.isDirectory()) {
            result = result.concat(recursiveReaddir(path));
        }
        else {
            result.push(path);
        }
    }
    return result;
}
function write(name, json) {
    let contents = JSON.stringify(json, null, 2);
    (0, fs_1.writeFileSync)((0, path_1.join)("metadata", name + ".json"), contents);
    console.log(`- Written ${name}.json (${(new TextEncoder().encode(contents).length / 1024).toFixed(2)}KB)`);
}
let documentation = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)("metadata", "documentation.json")).toString());
["__tests__", "generateMetadata"].forEach((prop) => {
    delete documentation[prop];
});
write("documentation", documentation);
function moreToVisit(node) {
    if (Array.isArray(node))
        return false;
    return true;
}
function makeFilePath(path, line) {
    return (`https://github.com/Leno-Developement/edjs/blob/main/src/${path.replace(".ts", "").replace("src/", "")}.ts` +
        (line ? `#L${line}` : ""));
}
function getLineNumber(path, value, after = -1) {
    if (!path)
        return null;
    let line = value.split("\n")[0];
    let file = (0, fs_1.readFileSync)((0, path_1.join)("src", path.replace(".ts", "").replace("src/", "") + ".ts")).toString();
    let lines = file.split("\n");
    let found = lines.findIndex((x, y) => x.includes(line) && y > after);
    return found === -1 ? null : found + 1;
}
let rawdata = {
    classes: [],
    functions: [],
    interfaces: [],
    types: [],
    variables: [],
};
for (let value of Object.values(documentation)) {
    visit(value);
}
write("classes", rawdata.classes.map(formatClass));
write("types", rawdata.types.map(formatType));
write("interfaces", rawdata.interfaces.map(formatInterface));
function formatInterface(value) {
    let { name, filePath } = value;
    let lineNumber = getLineNumber(filePath, value.rawText);
    let data = {
        name,
        meta: {
            file: (0, path_1.join)("src", filePath + ".ts"),
            line: lineNumber,
            github: makeFilePath(filePath, lineNumber),
        },
    };
    if (value.properties) {
        data.properties = value.properties.map((x) => formatProperty(x, data));
    }
    if (value.methods) {
        data.methods = value.methods.map((x) => formatMethod(x, data));
    }
    return data;
}
function formatClass(value) {
    let { name, filePath, extends: ext, properties, methods, constructor: _constructor, implements: _implements, statics, } = value;
    let lineNumber = getLineNumber(filePath, value.rawText);
    let data = {
        name,
        meta: {
            file: (0, path_1.join)("src", filePath + ".ts"),
            line: lineNumber,
            github: makeFilePath(filePath, lineNumber),
        },
    };
    if (ext)
        data.extends = ext.map((x) => x);
    if (_implements)
        data.implements = _implements.map((x) => x);
    if (properties) {
        data.properties = [];
        if (properties.public) {
            data.properties.push(...properties.public.map((x) => formatProperty(x, data)));
        }
        if (properties.private) {
            data.properties.push(...properties.private.map((x) => formatProperty(x, data)));
        }
        if (properties.protected) {
            data.properties.push(...properties.protected.map((x) => formatProperty(x, data)));
        }
        data.properties = data.properties.filter((x) => x.name[0] !== "#");
        if (!data.properties.length) {
            delete data.properties;
        }
    }
    if (methods) {
        data.methods = [];
        if (methods.public) {
            data.methods.push(...methods.public.map((x) => formatMethod(x, data)));
        }
        if (methods.private) {
            data.methods.push(...methods.private.map((x) => formatMethod(x, data)));
        }
        if (methods.protected) {
            data.methods.push(...methods.protected.map((x) => formatMethod(x, data)));
        }
        data.methods = data.methods.filter((x) => x.name[0] !== "#");
        if (!data.methods.length) {
            delete data.methods;
        }
    }
    if (statics) {
        data.static = {};
        if (statics.properties) {
            data.static.properties = [];
            if (statics.properties.public) {
                data.static.properties.push(...statics.properties.public.map((x) => formatProperty(x, data)));
            }
            if (statics.properties.private) {
                data.static.properties.push(...statics.properties.private.map((x) => formatProperty(x, data)));
            }
            if (statics.properties.protected) {
                data.static.properties.push(...statics.properties.protected.map((x) => formatProperty(x, data)));
            }
            data.static.properties = data.static.properties.filter((x) => x.name[0] !== "#");
            if (!data.static.properties.length) {
                delete data.static.properties;
            }
        }
        if (statics.methods) {
            data.static.methods = [];
            if (statics.methods.public) {
                data.static.methods.push(...statics.methods.public.map((x) => formatMethod(x, data)));
            }
            if (statics.methods.private) {
                data.static.methods.push(...statics.methods.private.map((x) => formatMethod(x, data)));
            }
            if (statics.methods.protected) {
                data.static.methods.push(...statics.methods.protected.map((x) => formatMethod(x, data)));
            }
            data.static.methods = data.static.methods.filter((x) => x.name[0] !== "#");
            if (!data.static.methods.length) {
                delete data.static.methods;
            }
        }
    }
    if (_constructor) {
        Reflect.set(data, "constructor", formatConstructor(_constructor, data));
    }
    return data;
}
function formatConstructor(value, parent) {
    let data = {};
    if (value.rawText) {
        let lineNumber = getLineNumber(parent.meta.file, value.rawText, parent.meta.line - 1);
        data.meta = {
            file: parent.meta.file,
            line: lineNumber,
            github: makeFilePath(parent.meta.file, lineNumber),
        };
    }
    if (value.params) {
        data.params = value.params;
    }
    return data;
}
function formatProperty(value, parent) {
    let { name, value: v, type } = value;
    let lineNumber = getLineNumber(parent.meta.file, value.rawText, parent.meta.line - 1);
    let data = {
        name,
        type,
        meta: {
            ...parent.meta,
            line: lineNumber,
            github: makeFilePath(parent.meta.file, lineNumber),
        },
        access: value.visibility,
    };
    if (v)
        data.value = v;
    return data;
}
function formatMethod(value, parent) {
    let { name, returnType: type, params } = value;
    let lineNumber = getLineNumber(parent.meta.file, value.rawText, parent.meta.line - 1);
    let data = {
        name,
        type,
        meta: {
            ...parent.meta,
            line: lineNumber,
            github: makeFilePath(parent.meta.file, lineNumber),
        },
        access: value.visibility,
    };
    if (params) {
        data.params = params;
    }
    return data;
}
function formatType(value) {
    let { name } = value;
    let filePath = searchAllFiles(value.rawText);
    let lineNumber = getLineNumber(filePath, value.rawText);
    let type = value.rawText.split("=");
    type.shift();
    let data = {
        name,
        type: type.join("=").slice(1, -1).replace(/\n */g, ""),
        meta: {
            file: filePath,
            line: lineNumber,
            github: makeFilePath(filePath, lineNumber),
        },
    };
    return data;
}
function visit(raw) {
    let values = Object.values(raw);
    if (moreToVisit(raw)) {
        for (let value of values) {
            visit(value);
        }
    }
    else {
        for (let value of values) {
            switch (value.objectType) {
                case "class":
                    rawdata.classes.push(value);
                    break;
                case "type":
                    rawdata.types.push(value);
                    break;
                case "interface":
                    rawdata.interfaces.push(value);
                    break;
                default:
            }
        }
    }
}
function searchAllFiles(text) {
    let cache = searchAllFilesCache;
    for (let [key, value] of cache.entries()) {
        if (value.indexOf(text) > -1) {
            return key;
        }
    }
    for (let file of allFiles) {
        if (!cache.has(file)) {
            let fileText = (0, fs_1.readFileSync)(file).toString();
            cache.set(file, fileText);
            if (fileText.indexOf(text) > -1) {
                return file;
            }
        }
    }
    return null;
}
//# sourceMappingURL=generateMetadata.js.map