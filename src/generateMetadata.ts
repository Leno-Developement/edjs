import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

/* Variables & Functions net yet implemented */

console.clear();
let searchAllFilesCache = new Map<string, string>();
let allFiles = recursiveReaddir("src");

function recursiveReaddir(dir: string) {
  let files = readdirSync(dir);
  let result: string[] = [];
  for (let file of files) {
    let path = join(dir, file);
    let stat = statSync(path);
    if (stat.isDirectory()) {
      result = result.concat(recursiveReaddir(path));
    } else {
      result.push(path);
    }
  }
  return result;
}

function write(name: string, json: Record<string, any>) {
  let contents = JSON.stringify(json, null, 2);
  writeFileSync(join("metadata", name + ".json"), contents);
  console.log(
    `- Written ${name}.json (${(new TextEncoder().encode(contents).length / 1024).toFixed(2)}KB)`,
  );
}

let documentation = JSON.parse(
  readFileSync(join("metadata", "documentation.json")).toString(),
);
/* Delete Unwanted */
["__tests__", "generateMetadata"].forEach(
  (prop: keyof typeof documentation) => {
    delete documentation[prop];
  },
);
write("documentation", documentation);

function moreToVisit(node: unknown) {
  if (Array.isArray(node)) return false;
  return true;
}

function makeFilePath(path: string | null, line: number | null) {
  return (
    `https://github.com/Leno-Developement/edjs/blob/main/src/${path!.replace(".ts", "").replace("src/", "")}.ts` +
    (line ? `#L${line}` : "")
  );
}

function getLineNumber(path: string | null, value: string, after = -1) {
  if (!path) return null;
  let line = value.split("\n")[0];
  let file = readFileSync(
    join("src", path.replace(".ts", "").replace("src/", "") + ".ts"),
  ).toString();
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
} as Record<string, any[]>;

for (let value of Object.values(documentation)) {
  visit(value);
}

write("classes", rawdata.classes.map(formatClass));
write("types", rawdata.types.map(formatType));
write("interfaces", rawdata.interfaces.map(formatInterface));

function formatInterface(value: Record<string, any>) {
  let { name, filePath } = value;
  let lineNumber = getLineNumber(filePath, value.rawText);
  let data = {
    name,
    meta: {
      file: join("src", filePath + ".ts"),
      line: lineNumber,
      github: makeFilePath(filePath, lineNumber),
    },
  } as Record<string, any>;

  if (value.properties) {
    data.properties = value.properties.map((x: any) => formatProperty(x, data));
  }
  if (value.methods) {
    data.methods = value.methods.map((x: any) => formatMethod(x, data));
  }

  return data;
}

function formatClass(value: Record<string, any>) {
  let {
    name,
    filePath,
    extends: ext,
    properties,
    methods,
    constructor: _constructor,
    implements: _implements,
    statics,
  } = value;

  let lineNumber = getLineNumber(filePath, value.rawText);

  let data = {
    name,
    meta: {
      file: join("src", filePath + ".ts"),
      line: lineNumber,
      github: makeFilePath(filePath, lineNumber),
    },
  } as Record<string, any>;

  if (ext) data.extends = ext.map((x: string) => x);
  if (_implements) data.implements = _implements.map((x: string) => x);

  if (properties) {
    data.properties = [];
    if (properties.public) {
      data.properties.push(
        ...properties.public.map((x: any) => formatProperty(x, data)),
      );
    }
    if (properties.private) {
      data.properties.push(
        ...properties.private.map((x: any) => formatProperty(x, data)),
      );
    }
    if (properties.protected) {
      data.properties.push(
        ...properties.protected.map((x: any) => formatProperty(x, data)),
      );
    }
    data.properties = data.properties.filter((x: any) => x.name[0] !== "#");
    if (!data.properties.length) {
      delete data.properties;
    }
  }
  if (methods) {
    data.methods = [];
    if (methods.public) {
      data.methods.push(
        ...methods.public.map((x: any) => formatMethod(x, data)),
      );
    }
    if (methods.private) {
      data.methods.push(
        ...methods.private.map((x: any) => formatMethod(x, data)),
      );
    }
    if (methods.protected) {
      data.methods.push(
        ...methods.protected.map((x: any) => formatMethod(x, data)),
      );
    }

    data.methods = data.methods.filter((x: any) => x.name[0] !== "#");
    if (!data.methods.length) {
      delete data.methods;
    }
  }

  if (statics) {
    data.static = {};
    if (statics.properties) {
      data.static.properties = [];
      if (statics.properties.public) {
        data.static.properties.push(
          ...statics.properties.public.map((x: any) => formatProperty(x, data)),
        );
      }
      if (statics.properties.private) {
        data.static.properties.push(
          ...statics.properties.private.map((x: any) =>
            formatProperty(x, data),
          ),
        );
      }
      if (statics.properties.protected) {
        data.static.properties.push(
          ...statics.properties.protected.map((x: any) =>
            formatProperty(x, data),
          ),
        );
      }
      data.static.properties = data.static.properties.filter(
        (x: any) => x.name[0] !== "#",
      );
      if (!data.static.properties.length) {
        delete data.static.properties;
      }
    }
    if (statics.methods) {
      data.static.methods = [];
      if (statics.methods.public) {
        data.static.methods.push(
          ...statics.methods.public.map((x: any) => formatMethod(x, data)),
        );
      }
      if (statics.methods.private) {
        data.static.methods.push(
          ...statics.methods.private.map((x: any) => formatMethod(x, data)),
        );
      }
      if (statics.methods.protected) {
        data.static.methods.push(
          ...statics.methods.protected.map((x: any) => formatMethod(x, data)),
        );
      }
      data.static.methods = data.static.methods.filter(
        (x: any) => x.name[0] !== "#",
      );
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

function formatConstructor(
  value: Record<string, any>,
  parent: Record<string, any>,
) {
  let data = {} as Record<string, any>;

  if (value.rawText) {
    let lineNumber = getLineNumber(
      parent.meta.file,
      value.rawText,
      parent.meta.line - 1,
    );
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

function formatProperty(
  value: Record<string, any>,
  parent: Record<string, any>,
) {
  let { name, value: v, type } = value;

  let lineNumber = getLineNumber(
    parent.meta.file,
    value.rawText,
    parent.meta.line - 1,
  );

  let data = {
    name,
    type,
    meta: {
      ...parent.meta,
      line: lineNumber,
      github: makeFilePath(parent.meta.file, lineNumber),
    },
    access: value.visibility,
  } as Record<string, any>;

  if (v) data.value = v;

  return data;
}

function formatMethod(value: Record<string, any>, parent: Record<string, any>) {
  let { name, returnType: type, params } = value;

  let lineNumber = getLineNumber(
    parent.meta.file,
    value.rawText,
    parent.meta.line - 1,
  );

  let data = {
    name,
    type,
    meta: {
      ...parent.meta,
      line: lineNumber,
      github: makeFilePath(parent.meta.file, lineNumber),
    },
    access: value.visibility,
  } as Record<string, any>;

  if (params) {
    data.params = params;
  }

  return data;
}

function formatType(value: Record<string, any>) {
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
  } as Record<string, any>;
  return data;
}

function visit(raw: any) {
  let values = Object.values(raw);
  if (moreToVisit(raw)) {
    for (let value of values) {
      visit(value);
    }
  } else {
    for (let value of values) {
      switch ((value as any).objectType) {
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
        //ignore
      }
    }
  }
}

function searchAllFiles(text: string): string | null {
  let cache = searchAllFilesCache;
  for (let [key, value] of cache.entries()) {
    if (value.indexOf(text) > -1) {
      return key;
    }
  }
  for (let file of allFiles) {
    if (!cache.has(file)) {
      let fileText = readFileSync(file).toString();
      cache.set(file, fileText);

      if (fileText.indexOf(text) > -1) {
        return file;
      }
    }
  }

  return null;
}
