import { init, WASI } from '@wasmer/wasi';

(async () => {
    await init();
    let wasi = new WASI({
        env: {
            // 'ENVVAR1': '1',
            // 'ENVVAR2': '2'
        },
        args: [
            // 'command', 'arg1', 'arg2'
        ],
      });
      
      const module = await WebAssembly.compileStreaming(fetch('./toolkit.wasm'));
      // const module = await WebAssembly.compileStreaming(fetch("https://deno.land/x/wasm/tests/demo.wasm"));
      // Instantiate the WASI module
      await wasi.instantiate(module, {
        wasi_snapshot_preview1: {
            sock_accept: function() {
                throw "not supported";
            }
        }
      });
      
      // Run the start function
      let exitCode = wasi.start();
      let stdout = wasi.getStdoutString();
      console.log(stdout)
})()