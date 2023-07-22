import { WASI, File, OpenFile, PreopenDirectory } from "@bjorn3/browser_wasi_shim";

let module;

const analyzeXhprof = async (name, buf) => {
    let args = [
        "tk",
        // 'analyze-xhprof',
        'generate-xhprof-graphviz',
        name,
    ];
    let env = [];
    const stdout = new File([])
    const directory = new PreopenDirectory("/", {
        [name]: new File(buf),
    });
    let fds = [
        new OpenFile(new File([])), // stdin
        new OpenFile(stdout), // stdout
        new OpenFile(new File([])), // stderr
        directory,
    ];
    let wasi = new WASI(args, env, fds);

    const extendedImport = {
        ...wasi.wasiImport,
        sock_accept() {
            throw "unimplemented"
        }
    }
    const wrappedImport = {}
    for (const key in extendedImport) {
        // console.log(key)
        wrappedImport[key] = function (...args) {
            console.log("import called ", key, structuredClone(args))
            const result = extendedImport[key].call(this, ...args)
            console.log("result", result)
            return result
        }
    }
    // console.log(wrappedImport)
    let inst = await WebAssembly.instantiate(module, {
        "wasi_snapshot_preview1": {
            ...wrappedImport,
        }
    });
    try {
        wasi.start(inst);
    } catch(e) {
        console.log(e)
    }
    // return new TextDecoder().decode(stdout.data)
    return new TextDecoder().decode(directory.dir.contents["callgraph.dot"].data)
}

const init = async () => {
    module = await WebAssembly.compileStreaming(fetch('./toolkit.wasm'));
    const main = window.document.getElementById("main")
    main.addEventListener('dragover', (e) => {e.preventDefault()})
    main.addEventListener('drop', (e) => {
        console.log('dropped')
        e.preventDefault();
        const item = e.dataTransfer.items[0]
        if (item.kind !== "file") {
            return
        }
        const file = item.getAsFile()
        const reader = new FileReader()
        const name = file.name
        reader.onload = (e) => {
            analyzeXhprof(name, e.target.result).then((result) => main.innerText = result)
        }
        reader.readAsArrayBuffer(file)
    });
    main.innerText = "initialized. waiting file droped..."
}


init()